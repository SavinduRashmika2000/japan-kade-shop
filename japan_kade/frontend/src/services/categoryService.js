import axios from 'axios';

const API_URL = 'http://localhost:8080/api/categories';

const getAuthHeader = () => {
  const userStr = localStorage.getItem('user');
  if (!userStr) return {};
  const user = JSON.parse(userStr);
  return { Authorization: `Bearer ${user.token || user.accessToken}` };
};

const getAllCategories = async () => {
  return axios.get(API_URL, { headers: getAuthHeader() });
};

const createCategory = async (categoryData) => {
  return axios.post(API_URL, categoryData, { headers: getAuthHeader() });
};

const updateCategory = async (id, categoryData) => {
  return axios.put(`${API_URL}/${id}`, categoryData, { headers: getAuthHeader() });
};

const deleteCategory = async (id) => {
  return axios.delete(`${API_URL}/${id}`, { headers: getAuthHeader() });
};

const categoryService = {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory
};

export default categoryService;
