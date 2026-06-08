import axios from 'axios';

const API_URL = 'http://localhost:8080/api/job-cards';
const TIMEOUT = 15000; // 15s default timeout

const getAuthHeader = () => {
    const userStr = localStorage.getItem('user');
    if (!userStr) return {};
    const user = JSON.parse(userStr);
    return { Authorization: `Bearer ${user.token || user.accessToken}` };
};

/** Fetch all job cards (admin only) */
const getAllJobs = () =>
    axios.get(API_URL, { headers: getAuthHeader(), timeout: TIMEOUT });

/** Fetch jobs belonging to the currently authenticated customer */
const getMyJobs = () =>
    axios.get(`${API_URL}/my-jobs`, { headers: getAuthHeader(), timeout: TIMEOUT });

/** Fetch a single job card by ID */
const getJobById = (id) =>
    axios.get(`${API_URL}/${id}`, { headers: getAuthHeader(), timeout: TIMEOUT });

/** Create a new job card / bill */
const createJob = (jobData) =>
    axios.post(API_URL, jobData, { headers: getAuthHeader(), timeout: TIMEOUT });

/**
 * Update the status of an existing job card.
 * @param {number} id - Job card ID
 * @param {string} status - One of WAITING | PAID | CANCELLED
 */
const updateJobStatus = (id, status) =>
    axios.put(`${API_URL}/${id}/status`, null, {
        params: { status },
        headers: getAuthHeader(),
        timeout: TIMEOUT
    });

/** Update all fields of a job card */
const updateJob = (id, jobData) =>
    axios.put(`${API_URL}/${id}`, jobData, { headers: getAuthHeader(), timeout: TIMEOUT });

/** Permanently delete a job card and restore its stock */
const deleteJob = (id) =>
    axios.delete(`${API_URL}/${id}`, { headers: getAuthHeader(), timeout: TIMEOUT });

const jobCardService = {
    getAllJobs,
    getMyJobs,
    getJobById,
    createJob,
    updateJobStatus,
    updateJob,
    deleteJob,
};

export default jobCardService;
