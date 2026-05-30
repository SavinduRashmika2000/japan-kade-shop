import axios from 'axios';

const API_URL = 'http://localhost:8080/api/service-types';

const getAuthHeader = () => {
  const userStr = localStorage.getItem('user');
  if (!userStr) return {};
  try {
    const user = JSON.parse(userStr);
    const token = user.token || user.accessToken;
    if (!token) return {};
    return { Authorization: `Bearer ${token}` };
  } catch (e) {
    return {};
  }
};

const getAllServiceTypes = async () => {
  return axios.get(API_URL, { headers: getAuthHeader() });
};

const getServiceTypeById = async (id) => {
  return axios.get(`${API_URL}/${id}`, { headers: getAuthHeader() });
};