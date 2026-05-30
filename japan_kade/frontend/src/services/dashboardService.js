import axios from 'axios';

const API_URL = 'http://localhost:8080/api/dashboard';

const getAuthHeader = () => {
  const userStr = localStorage.getItem('user');
  if (!userStr) return {};