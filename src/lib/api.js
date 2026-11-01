import { supabase } from '../config/supabase';

export class ApiError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.status = status;
  }
}

export const setAccessToken = () => {};
export const setSessionLostHandler = () => {};
export const refreshSession = async () => null;

/**
 * Pemetaan path REST API ke kueri Supabase PostgreSQL
 */
function parsePath(pathStr) {
  const clean = pathStr.replace(/^\/api\/?/, '').replace(/^\/+/, '');
  const [resourceWithQuery, ...rest] = clean.split('/');
  const [resource, queryStr] = resourceWithQuery.split('?');
  const id = rest[0] || '';
  const subAction = rest[1] || '';

  const queryParams = new URLSearchParams(queryStr || '');
  return { resource, id, subAction, queryParams };
}

export const api = {
  async get(path) {
    const { resource, id, subAction, queryParams } = parsePath(path);

    // 1. Healthcheck
    if (resource === 'health') return { ok: true, provider: 'supabase' };

    // 2. Auth Session Me
    if (resource === 'auth' && id === 'me') {
      const { data: { user } } = await supabase.auth.getUser();
      return { user };
    }

    // 3. Journals
    if (resource === 'journals') {
      if (id) {
        const { data, error } = await supabase.from('journals').select('*').eq('id', id).maybeSingle();
        if (error) throw new ApiError(error.message);
        return data;
      }
      const scope = queryParams.get('scope');
      let q = supabase.from('journals').select('*');
      if (scope === 'mine') {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) q = q.eq('owner_id', user.id);
      } else if (scope === 'review') {
        q = q.order('status', { ascending: false });
      } else {
        q = q.eq('status', 'published');
      }
      const { data, error } = await q.order('created_at', { ascending: false });
      if (error) throw new ApiError(error.message);
      return data || [];
    }

    // 4. Founders
    if (resource === 'founders') {
      if (id) {
        const { data, error } = await supabase.from('founders').select('*').eq('id', id).maybeSingle();
        if (error) throw new ApiError(error.message);
        return data;
      }
      const { data, error } = await supabase.from('founders').select('*').order('sort_order', { ascending: true });
      if (error) return [];
      return data || [];
    }

    // 5. Contact Messages
    if (resource === 'contact') {
      const { data, error } = await supabase.from('contact_messages').select('*').order('created_at', { ascending: false });
      if (error) return [];
      return data || [];
    }

    // 6. Users (Profiles)
    if (resource === 'users') {
      const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
      if (error) return [];
      return data || [];
    }

    // 7. Deletion Logs
    if (resource === 'logs') {
      const { data, error } = await supabase.from('deletion_logs').select('*').order('deleted_at', { ascending: false });
      if (error) return [];
      return data || [];
    }

    // 8. Assignments, Materials, Blogs (Generic Tables)
    const tableMap = {
      assignments: 'assignments',
      materials: 'materials',
      blogs: 'blogs',
    };
    const tableName = tableMap[resource] || resource;

    if (id) {
      const { data, error } = await supabase.from(tableName).select('*').eq('id', id).maybeSingle();
      if (error) throw new ApiError(error.message);
      return data;
    }

    let q = supabase.from(tableName).select('*');
    if (tableName === 'materials') {
      q = q.order('meeting_number', { ascending: true });
    } else {
      q = q.order('created_at', { ascending: false });
    }

    const { data, error } = await q;
    if (error) throw new ApiError(error.message);
    return data || [];
  },

  async post(path, body = {}) {
    const { resource } = parsePath(path);

    // Auth Login & Register
    if (resource === 'auth') {
      return body;
    }

    // Contact Form Submission
    if (resource === 'contact') {
      const contactData = {
        name: body.name,
        email: body.email,
        subject: body.subject || '',
        message: body.message,
        created_at: new Date().toISOString(),
      };
      await supabase.from('contact_messages').insert([contactData]);
      return { ok: true, mail: 'sent' };
    }

    // Users Management
    if (resource === 'users') {
      const { data, error } = await supabase.from('profiles').insert([
        {
          id: `usr_${Date.now()}`,
          name: body.name,
          email: body.email,
          identity_number: body.identity_number || '',
          role: body.role || 'dosen',
          created_at: new Date().toISOString(),
        },
      ]).select().single();
      if (error) throw new ApiError(error.message);
      return data;
    }

    // Journals Submission
    if (resource === 'journals') {
      const { data: { user } } = await supabase.auth.getUser();
      const isStaff = user?.user_metadata?.role === 'admin' || user?.user_metadata?.role === 'dosen';
      const newJournal = {
        title: body.title,
        authors: body.authors,
        abstract: body.abstract || '',
        keywords: body.keywords || '',
        category: body.category || '',
        year: body.year || new Date().getFullYear(),
        volume: body.volume || '',
        issue: body.issue || '',
        doi: body.doi || '',
        file_url: body.file_url || '',
        cover_url: body.cover_url || '',
        status: isStaff ? 'published' : 'pending',
        owner_id: user?.id || null,
        created_at: new Date().toISOString(),
        published_at: isStaff ? new Date().toISOString() : null,
      };
      const { data, error } = await supabase.from('journals').insert([newJournal]).select().single();
      if (error) throw new ApiError(error.message);
      return data;
    }

    // Generic Insert (assignments, materials, blogs, founders)
    const { data: { user } } = await supabase.auth.getUser();
    const payload = {
      ...body,
      ...(user && !body.owner_id && { owner_id: user.id }),
      created_at: body.created_at || new Date().toISOString(),
    };

    const { data, error } = await supabase.from(resource).insert([payload]).select().single();
    if (error) throw new ApiError(error.message);
    return data;
  },

  async put(path, body = {}) {
    const { resource, id } = parsePath(path);
    const { data, error } = await supabase.from(resource).update(body).eq('id', id).select().single();
    if (error) throw new ApiError(error.message);
    return data;
  },

  async patch(path, body = {}) {
    const { resource, id, subAction } = parsePath(path);

    // Journal status review
    if (resource === 'journals' && subAction === 'status') {
      const updateData = {
        status: body.status,
        review_note: body.review_note || '',
        published_at: body.status === 'published' ? new Date().toISOString() : null,
      };
      if (body.is_featured !== undefined) updateData.is_featured = body.is_featured;
      const { data, error } = await supabase.from('journals').update(updateData).eq('id', id).select().single();
      if (error) throw new ApiError(error.message);
      return data;
    }

    // Contact message is_read toggle
    if (resource === 'contact') {
      const { error } = await supabase.from('contact_messages').update({ is_read: body.is_read ? true : false }).eq('id', id);
      if (error) throw new ApiError(error.message);
      return { ok: true };
    }

    // Generic patch
    const { data, error } = await supabase.from(resource).update(body).eq('id', id).select().single();
    if (error) throw new ApiError(error.message);
    return data;
  },

  async del(path, body = {}) {
    const { resource, id } = parsePath(path);

    // Catat log penghapusan jika ada item yang dihapus
    try {
      const { data: item } = await supabase.from(resource).select('*').eq('id', id).maybeSingle();
      if (item) {
        const { data: { user } } = await supabase.auth.getUser();
        await supabase.from('deletion_logs').insert([
          {
            item_type: resource,
            item_title: item.title || item.name || id,
            deleted_by: user?.email || 'Pengguna',
            reason: body.reason || 'Dihapus dari panel kontrol',
            deleted_at: new Date().toISOString(),
          },
        ]);
      }
    } catch {
      // Abaikan jika pencatatan log gagal
    }

    const { error } = await supabase.from(resource).delete().eq('id', id);
    if (error) throw new ApiError(error.message);
    return { ok: true };
  },

  /**
   * Upload file langsung ke Supabase Storage Bucket
   */
  async upload(file) {
    if (!file) throw new ApiError('Berkas tidak ditemukan');

    const fileExt = file.name.split('.').pop().toLowerCase();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;

    const isImage = file.type?.startsWith('image/') || ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(fileExt);
    const bucket = isImage ? 'covers' : 'attachments';

    try {
      const { error } = await supabase.storage.from(bucket).upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });

      if (error) {
        // Fallback coba upload ke attachments jika covers belum dibuat
        const { error: err2 } = await supabase.storage.from('attachments').upload(fileName, file);
        if (err2) throw err2;
        const { data } = supabase.storage.from('attachments').getPublicUrl(fileName);
        return data.publicUrl;
      }

      const { data } = supabase.storage.from(bucket).getPublicUrl(fileName);
      return data.publicUrl;
    } catch (err) {
      console.warn('Gagal unggah ke Supabase Storage, memakai fallback lokal:', err);
      return URL.createObjectURL(file);
    }
  },
};

export const assetUrl = (u) => u || '';
