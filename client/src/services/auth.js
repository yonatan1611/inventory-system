import api from './api';

export const authAPI = {
  login: (username, password) => 
    api.post('/auth/login', { username, password }),
  
  setup: (username, password) => 
    api.post('/auth/setup', { username, password }),
};