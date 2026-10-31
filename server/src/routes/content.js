import { Router } from 'express';
import { resource } from '../resource.js';
import { requireAuth, requireRole, isStaff } from '../auth.js';

const common = ['title', 'description', 'file_type', 'file_url', 'cover_url',
  'mata_kuliah', 'dosen_pengampu', 'prodi', 'universitas', 'is_featured'];

export const assignments = resource({
  table: 'assignments', label: 'Tugas',
  fields: [...common, 'student_name'],
  bools: ['is_featured'], staffOnlyFields: ['is_featured'],
  canCreate: requireAuth,
  canModify: (u, row) => isStaff(u) || row.owner_id === u.id,
});

export const materials = resource({
  table: 'materials', label: 'Materi',
  fields: [...common, 'meeting_number'],
  bools: ['is_featured'], order: 'meeting_number ASC, created_at DESC',
  canCreate: requireRole('admin', 'dosen'),
  canModify: (u) => isStaff(u),
  beforeSave: (d) => { if (d.meeting_number !== undefined) d.meeting_number = parseInt(d.meeting_number, 10) || 1; },
});

export const blogs = resource({
  table: 'blogs', label: 'Blog',
  fields: ['title', 'slug', 'category', 'author', 'read_time', 'cover_url', 'summary', 'content', 'is_featured'],
  bools: ['is_featured'],
  canCreate: requireRole('admin', 'dosen'),
  canModify: (u) => isStaff(u),
  beforeSave: (d, _req, existing) => { if (!existing) d.date = new Date().toISOString().slice(0, 10); },
});

export const founders = resource({
  table: 'founders', label: 'Pendiri',
  fields: ['name', 'position', 'bio', 'photo_url', 'email', 'linkedin_url', 'sort_order'],
  order: 'sort_order ASC, created_at ASC', required: ['name'],
  canCreate: requireRole('admin'),
  canModify: (u) => u.role === 'admin',
  beforeSave: (d) => { if (d.sort_order !== undefined) d.sort_order = parseInt(d.sort_order, 10) || 0; },
});

export default Router();
