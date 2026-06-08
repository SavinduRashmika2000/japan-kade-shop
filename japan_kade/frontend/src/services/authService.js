import axios from 'axios';

const API_URL = 'http://localhost:8080/api/auth';
const TIMEOUT = 10000; // 10s timeout for auth operations

/**
 * Log in a user (staff/admin or customer).
 * @param {string} identifier - Username (for staff) or Phone Number (for customer)
 * @param {string} password - Password
 */
const login = async (identifier, password) => {
  const response = await axios.post(
    `${API_URL}/signin`,
    {
      username: identifier, // used as identifier on backend
      password,
    },
    { timeout: TIMEOUT }
  );
  if (response.data.token) {
    localStorage.setItem('user', JSON.stringify(response.data));
  }
  return response.data;
};

/**
 * Register a new customer user.
 * @param {Object} userData - Customer registration data
 */
const signup = async (userData) => {
  return axios.post(`${API_URL}/signup`, userData, { timeout: TIMEOUT });
};

/** Log out the current user by removing credentials from localStorage */
const logout = () => {
  localStorage.removeItem('user');
};

/** Get the currently logged-in user object from localStorage */
const getCurrentUser = () => {
  return JSON.parse(localStorage.getItem('user'));
};

/**
 * Verify recovery details (Phone and ID number) for password reset.
 * @param {string} phone - User phone number
 * @param {string} idNo - User identity card number
 */
const verifyRecovery = (phone, idNo) => {
  return axios.post(`${API_URL}/reset-password/verify`, { phone, idNo }, { timeout: TIMEOUT });
};

/**
 * Perform a password reset change after verifying details.
 * @param {string} phone - User phone number
 * @param {string} idNo - User identity card number
 * @param {string} newPassword - New password to set
 */
const resetPassword = (phone, idNo, newPassword) => {
  return axios.post(`${API_URL}/reset-password/change`, { phone, idNo, newPassword }, { timeout: TIMEOUT });
};

const authService = {
  login,
  signup,
  logout,
  getCurrentUser,
  verifyRecovery,
  resetPassword,
};

export default authService;

