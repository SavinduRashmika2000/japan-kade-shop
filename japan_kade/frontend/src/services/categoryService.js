import axios from 'axios';

const API_URL = 'http://localhost:8080/api/categories';

const getAuthHeader = () => {
  const userStr = localStorage.getItem('user');
  if (!userStr) return {};
  const user = JSON.parse(userStr);
  return { Authorization: `Bearer ${user.token || user.accessToken}` };