import axios from 'axios';
import authService from './authService';

const API_URL = 'http://localhost:8080/api/customers';
const TIMEOUT = 10000; // 10s default timeout

// Add token to headers
const authHeader = () => {
  const user = authService.getCurrentUser();
  if (user && user.token) {
    return { Authorization: 'Bearer ' + user.token };
  } else {
    return {};
  }
};

/** Fetch all customer profiles (Admin/Staff only) */
const getAllCustomers = () => {
  return axios.get(API_URL, { headers: authHeader(), timeout: TIMEOUT });
};

/** Fetch a single customer profile by ID */
const getCustomerById = (id) => {
  return axios.get(`${API_URL}/${id}`, { headers: authHeader(), timeout: TIMEOUT });
};

/** Create a new customer profile (Admin/Staff only) */
const createCustomer = (customerData) => {
  return axios.post(API_URL, customerData, { headers: authHeader(), timeout: TIMEOUT });
};

/** Update customer profile fields and linked user account credentials */
const updateCustomer = (id, customerData) => {
  return axios.put(`${API_URL}/${id}`, customerData, { headers: authHeader(), timeout: TIMEOUT });
};

/** Permanently delete a customer profile and linked user account (Admin only) */
const deleteCustomer = (id) => {
  return axios.delete(`${API_URL}/${id}`, { headers: authHeader(), timeout: TIMEOUT });
};

const customerService = {
  getAllCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
};

export default customerService;

