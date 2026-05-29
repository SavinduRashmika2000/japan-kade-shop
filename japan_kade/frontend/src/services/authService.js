import axios from 'axios';

const API_URL = 'http://localhost:8080/api/auth';

const login = async (identifier, password) => {
  const response = await axios.post(API_URL + '/signin', {
    username: identifier, // used as identifier on backend
    password,
  });
  if (response.data.token) {
    localStorage.setItem('user', JSON.stringify(response.data));
  }
  return response.data;
};

const signup = async (userData) => {
  return axios.post(API_URL + '/signup', userData);
};

const logout = () => {
  localStorage.removeItem('user');
};

const getCurrentUser = () => {
  return JSON.parse(localStorage.getItem('user'));
};

const verifyRecovery = (phone, idNo) => {
  return axios.post(API_URL + '/reset-password/verify', { phone, idNo });
};

const resetPassword = (phone, idNo, newPassword) => {
  return axios.post(API_URL + '/reset-password/change', { phone, idNo, newPassword });
};
