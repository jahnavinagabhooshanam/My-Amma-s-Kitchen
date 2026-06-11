import api from './api';

const savedForLaterService = {
  getAll: () => api.get('/saved_for_later'),
  add: (data) => api.post('/saved_for_later', data),
  remove: (id) => api.delete(`/saved_for_later/${id}`)
};

export default savedForLaterService;
