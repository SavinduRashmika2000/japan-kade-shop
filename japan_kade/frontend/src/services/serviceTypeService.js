import axios from 'axios';

const API_URL = 'http://localhost:8080/api/service-types';

const getAuthHeader = () => {
  const userStr = localStorage.getItem('user');
  if (!userStr) return {};
  try {
    const user = JSON.parse(userStr);
    const token = user.token || user.accessToken;
    if (!token) return {};
    return { Authorization: `Bearer ${token}` };