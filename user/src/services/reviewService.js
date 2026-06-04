import api from './api';

const reviewService = {
  create: (data) => api.post('/reviews', data)
};

export default reviewService;
