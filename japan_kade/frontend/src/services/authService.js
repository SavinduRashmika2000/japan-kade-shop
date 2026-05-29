import axios from 'axios';

const API_URL = 'http://localhost:8080/api/auth';

const login = async (identifier, password) => {
  const response = await axios.post(API_URL + '/signin', {
    username: identifier, // used as identifier on backend
    password,
  });
  if (response.data.token) {
    localStorage.setItem('user', JSON.stringify(response.data));
  }