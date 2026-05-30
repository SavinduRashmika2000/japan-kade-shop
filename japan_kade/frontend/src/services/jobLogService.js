import axios from 'axios';

const API_URL = 'http://localhost:8080/api/job-logs';

const getAuthHeader = () => {
    const userStr = localStorage.getItem('user');
    if (!userStr) return {};