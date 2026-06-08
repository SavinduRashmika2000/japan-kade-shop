import axios from 'axios';

const API_URL = 'http://localhost:8080/api/job-logs';
const TIMEOUT = 15000; // 15s default timeout for loading logs

const getAuthHeader = () => {
    const userStr = localStorage.getItem('user');
    if (!userStr) return {};
    const user = JSON.parse(userStr);
    return { Authorization: `Bearer ${user.token || user.accessToken}` };
};

/** Fetch all system job logs sorted by timestamp descending */
const getAllLogs = () => {
    return axios.get(API_URL, { headers: getAuthHeader(), timeout: TIMEOUT });
};

const jobLogService = {
    getAllLogs,
};

export default jobLogService;

