import axios from 'axios';
import authService from './authService';

const API_URL = 'http://localhost:8080/api/customers';

// Add token to headers
const authHeader = () => {
  const user = authService.getCurrentUser();
  if (user && user.token) {
    return { Authorization: 'Bearer ' + user.token };
  } else {
    return {};
  }
};

const getAllCustomers = () => {
  return axios.get(API_URL, { headers: authHeader() });
};

const updateCustomer = (id, customerData) => {