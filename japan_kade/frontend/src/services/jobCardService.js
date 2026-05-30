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

const getMyJobs = () => {
    return axios.get(`${API_URL}/my-jobs`, { headers: getAuthHeader() });
};

const getJobById = (id) => {
    return axios.get(`${API_URL}/${id}`, { headers: getAuthHeader() });
};

const createJob = (jobData) => {
    return axios.post(API_URL, jobData, { headers: getAuthHeader() });
};
