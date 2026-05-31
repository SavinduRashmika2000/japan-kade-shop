import axios from 'axios';

const API_URL = 'http://localhost:8080/api/auth/';

const getAuthHeader = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (user && user.token) {
    return { Authorization: 'Bearer ' + user.token };
  } else {
    return {};
  }