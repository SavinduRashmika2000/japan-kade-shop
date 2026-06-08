import axios from 'axios';

const API_URL = 'http://localhost:8080/api/categories';
const TIMEOUT = 10000; // 10s default timeout

const getAuthHeader = () => {
  const userStr = localStorage.getItem('user');
  if (!userStr) return {};
  const user = JSON.parse(userStr);
  return { Authorization: `Bearer ${user.token || user.accessToken}` };
};

/** Fetch all stock item categories (Admin/Staff only) */
const getAllCategories = async () => {
  return axios.get(API_URL, { headers: getAuthHeader(), timeout: TIMEOUT });
};

/** Create a new category (Admin only) */
const createCategory = async (categoryData) => {
  return axios.post(API_URL, categoryData, { headers: getAuthHeader(), timeout: TIMEOUT });
};

/** Update category details (Admin only) */
const updateCategory = async (id, categoryData) => {
  return axios.put(`${API_URL}/${id}`, categoryData, { headers: getAuthHeader(), timeout: TIMEOUT });
};

/** Delete a category (Admin only) */
const deleteCategory = async (id) => {
  return axios.delete(`${API_URL}/${id}`, { headers: getAuthHeader(), timeout: TIMEOUT });
};

const categoryService = {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};

export default categoryService;

