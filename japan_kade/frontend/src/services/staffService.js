import axios from 'axios';

const API_URL = 'http://localhost:8080/api/auth/';

const getAuthHeader = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (user && user.token) {
    return { Authorization: 'Bearer ' + user.token };
  } else {
    return {};
  }
};

const createStaff = async (staffData) => {
  return axios.post(API_URL + 'staff', staffData, { headers: getAuthHeader() });
};

const toggleStaffStatus = async (id, enabled) => {
  return axios.patch(`${API_URL}users/${id}/status`, null, { 
    params: { enabled },
    headers: getAuthHeader() 