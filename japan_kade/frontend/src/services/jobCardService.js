import axios from 'axios';

const API_URL = 'http://localhost:8080/api/job-cards';

const getAuthHeader = () => {
    const userStr = localStorage.getItem('user');
    if (!userStr) return {};
    const user = JSON.parse(userStr);
    return { Authorization: `Bearer ${user.token || user.accessToken}` };
};

const getAllJobs = () => {
    return axios.get(API_URL, { headers: getAuthHeader() });
};