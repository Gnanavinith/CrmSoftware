import { api } from './api'

export const userService = {
  async getUsers(params = {}) {
    const res = await api.get('/api/users', { params })
    return res.data
  },
  async getUser(id) {
    const res = await api.get(`/api/users/${id}`)
    return res.data
  },
  async updateUser(id, updates) {
    const res = await api.put(`/api/users/${id}`, updates)
    return res.data
  },
  async getTeamMembers() {
    const res = await api.get('/api/users/team')
    return res.data
  }
}
