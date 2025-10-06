import { api } from './api'

export const projectService = {
  async getProjects(params = {}) {
    const res = await api.get('/api/projects', { params })
    return res.data
  },
  async createProject(data) {
    const res = await api.post('/api/projects', data)
    return res.data
  },
  async updateProject(id, updates) {
    const res = await api.put(`/api/projects/${id}`, updates)
    return res.data
  },
  async deleteProject(id) {
    const res = await api.delete(`/api/projects/${id}`)
    return res.data
  },
  async getProject(id) {
    const res = await api.get(`/api/projects/${id}`)
    return res.data
  }
}
