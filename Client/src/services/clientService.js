import { api } from './api'

export const clientService = {
  async getClients(params = {}) {
    const res = await api.get('/api/clients', { params })
    return res.data
  },
  async getClient(id) {
    const res = await api.get(`/api/clients/${id}`)
    return res.data
  },
  async createClient(data) {
    const res = await api.post('/api/clients', data)
    return res.data
  },
  async updateClient(id, updates) {
    const res = await api.put(`/api/clients/${id}`, updates)
    return res.data
  },
  async deleteClient(id) {
    const res = await api.delete(`/api/clients/${id}`)
    return res.data
  }
}



