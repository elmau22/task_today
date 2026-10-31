/**
 * Klien HTTP untuk backend Task Today.
 * - Access token (JWT) hanya disimpan di memori, bukan localStorage.
 * - Refresh token berada di cookie httpOnly; dipakai otomatis saat access token habis.
 */
let accessToken = null;
let refreshing = null;
let onSessionLost = () => {};

export const setAccessToken = (t) => { accessToken = t; };
export const setSessionLostHandler = (fn) => { onSessionLost = fn; };

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

async function raw(path, { method = 'GET', body, form, auth = true } = {}) {
  const headers = {};
  if (auth && accessToken) headers.Authorization = `Bearer ${accessToken}`;
  let payload;
  if (form) payload = form;
  else if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
    payload = JSON.stringify(body);
  }
  return fetch(`/api${path}`, { method, headers, body: payload, credentials: 'include' });
}

export async function refreshSession() {
  if (!refreshing) {
    refreshing = raw('/auth/refresh', { method: 'POST', auth: false })
      .then(async (res) => {
        if (!res.ok) return null;
        const data = await res.json();
        accessToken = data.token;
        return data;
      })
      .catch(() => null)
      .finally(() => { refreshing = null; });
  }
  return refreshing;
}

export async function request(path, opts = {}) {
  let res = await raw(path, opts);
  if (res.status === 401 && opts.auth !== false && !path.startsWith('/auth/')) {
    const renewed = await refreshSession();
    if (renewed) res = await raw(path, opts);
    else {
      accessToken = null;
      onSessionLost();
    }
  }
  const text = await res.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { /* bukan JSON */ }
  if (!res.ok) throw new ApiError(data?.error || `Permintaan gagal (${res.status})`, res.status);
  return data;
}

export const api = {
  get: (p) => request(p),
  post: (p, body) => request(p, { method: 'POST', body }),
  put: (p, body) => request(p, { method: 'PUT', body }),
  patch: (p, body) => request(p, { method: 'PATCH', body }),
  del: (p, body) => request(p, { method: 'DELETE', body }),
  async upload(file) {
    const form = new FormData();
    form.append('file', file);
    const data = await request('/uploads', { method: 'POST', form });
    return data.url;
  },
};

/** Ubah tautan unggahan relatif menjadi URL yang bisa dibuka. */
export const assetUrl = (u) => u || '';
