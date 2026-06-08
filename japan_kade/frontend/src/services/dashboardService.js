import axios from 'axios';

const API_URL = 'http://localhost:8080/api/dashboard';
const TIMEOUT = 15000; // 15s default timeout for loading dashboard stats

const getAuthHeader = () => {
  const userStr = localStorage.getItem('user');
  if (!userStr) return {};
  const user = JSON.parse(userStr);
  return { Authorization: `Bearer ${user.token || user.accessToken}` };
};

/** Fetch global dashboard statistics (Admin/Staff only) */
const getStats = () => {
  return axios.get(`${API_URL}/stats`, { headers: getAuthHeader(), timeout: TIMEOUT });
};

const dashboardService = {
  getStats,
};

export default dashboardService;

