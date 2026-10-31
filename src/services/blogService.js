import { api } from '../lib/api';

export const blogService = {
  getAll: () => api.get('/blogs').catch(() => []),
  async getFeatured() {
    const blogs = await this.getAll();
    const featured = blogs.filter((b) => b.is_featured);
    return (featured.length ? featured : blogs).slice(0, 3);
  },
  async getById(id) {
    const direct = await api.get(`/blogs/${encodeURIComponent(id)}`).catch(() => null);
    if (direct) return direct;
    const all = await this.getAll();
    return all.find((b) => b.slug === id) || null;
  },
  create: (data) => api.post('/blogs', data),
  update: (id, updates) => api.put(`/blogs/${id}`, updates),
  delete: (id, reason = '') => api.del(`/blogs/${id}`, { reason }),
  async toggleFeatured(id) {
    const blog = await this.getById(id);
    return api.put(`/blogs/${id}`, { is_featured: !blog.is_featured });
  },
};
