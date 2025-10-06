import { api } from './api'

export const taskService = {
  async getTasks(params = {}) {
    const res = await api.get('/api/tasks', { params })
    return res.data
  },
  async getTask(id) {
    const res = await api.get(`/api/tasks/${id}`)
    return res.data
  },
  async createTask(data) {
    const res = await api.post('/api/tasks', data)
    return res.data
  },
  async updateTask(id, updates) {
    const res = await api.put(`/api/tasks/${id}`, updates)
    return res.data
  },
  async deleteTask(id) {
    const res = await api.delete(`/api/tasks/${id}`)
    return res.data
  }
}