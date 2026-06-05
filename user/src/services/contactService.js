import api from './api';

const contactService = {
  getAll: () => api.get('/contact'),
  submit: (data) => api.post('/contact', data),
  updateStatus: (id, status) => api.put(`/contact/${id}`, { status }),
  delete: (id) => api.delete(`/contact/${id}`)
};

export default contactService;
