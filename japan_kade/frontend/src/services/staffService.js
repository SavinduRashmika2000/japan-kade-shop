import axios from 'axios';

const API_URL = 'http://localhost:8080/api/auth/';
const TIMEOUT = 10000; // 10s default timeout

const getAuthHeader = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (user && user.token) {
    return { Authorization: 'Bearer ' + user.token };
  } else {
    return {};
  }
};

/** Create a new staff/admin member (Admin only) */
const createStaff = async (staffData) => {
  return axios.post(API_URL + 'staff', staffData, { headers: getAuthHeader(), timeout: TIMEOUT });
};

/**
 * Enable or disable a staff member's system access.
 * @param {number} id - User ID
 * @param {boolean} enabled - Target access status
 */
const toggleStaffStatus = async (id, enabled) => {
  return axios.patch(`${API_URL}users/${id}/status`, null, { 
    params: { enabled },
    headers: getAuthHeader(),
    timeout: TIMEOUT
  });
};

/** Fetch all management and staff members (Admin only) */
const getAllStaff = async () => {
  return axios.get(API_URL + 'staff', { headers: getAuthHeader(), timeout: TIMEOUT });
};

/** Update staff member profile and access level (Admin only) */
const updateStaff = async (id, staffData) => {
  return axios.put(`${API_URL}staff/${id}`, staffData, { headers: getAuthHeader(), timeout: TIMEOUT });
};

const staffService = {
  createStaff,
  toggleStaffStatus,
  getAllStaff,
  updateStaff,
};

export default staffService;

