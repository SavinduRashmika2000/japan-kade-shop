import axios from 'axios';

const API_URL = 'http://localhost:8080/api/stock';

const getAuthHeader = () => {
  const userStr = localStorage.getItem('user');
  if (!userStr) return {};
  const user = JSON.parse(userStr);
  return { Authorization: `Bearer ${user.token || user.accessToken}` };
};

const getAllStockItems = async () => {
  return axios.get(API_URL, { headers: getAuthHeader() });
};

const getStockItemById = async (id) => {
  return axios.get(`${API_URL}/${id}`, { headers: getAuthHeader() });
};

const createStockItem = async (stockData) => {
  return axios.post(API_URL, stockData, { headers: getAuthHeader() });
};

const updateStockItem = async (id, stockData) => {
  return axios.put(`${API_URL}/${id}`, stockData, { headers: getAuthHeader() });
};

const deleteStockItem = async (id) => {
  return axios.delete(`${API_URL}/${id}`, { headers: getAuthHeader() });
};

const addStock = async (id, payload) => {
  return axios.post(`${API_URL}/${id}/add-stock`, payload, { headers: getAuthHeader() });
};

const getAllTransactions = async () => {
  return axios.get(`${API_URL}/transactions`, { headers: getAuthHeader() });
};

const reduceStock = async (id, payload) => {