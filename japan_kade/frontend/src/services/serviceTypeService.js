import axios from 'axios';

const API_URL = 'http://localhost:8080/api/service-types';
const TIMEOUT = 10000; // 10s default timeout

const getAuthHeader = () => {
  const userStr = localStorage.getItem('user');
  if (!userStr) return {};
  try {
    const user = JSON.parse(userStr);
    const token = user.token || user.accessToken;
    if (!token) return {};
    return { Authorization: `Bearer ${token}` };
  } catch (e) {
    return {};
  }
};

/** Fetch all service type entries */
const getAllServiceTypes = async () => {
  return axios.get(API_URL, { headers: getAuthHeader(), timeout: TIMEOUT });
};

/** Fetch a single service type by ID */
const getServiceTypeById = async (id) => {
  return axios.get(`${API_URL}/${id}`, { headers: getAuthHeader(), timeout: TIMEOUT });
};

/** Create a new service type entry (Admin only) */
const createServiceType = async (data) => {
  return axios.post(API_URL, data, { headers: getAuthHeader(), timeout: TIMEOUT });
};

/** Update service type entry (Admin only) */
const updateServiceType = async (id, data) => {
  return axios.put(`${API_URL}/${id}`, data, { headers: getAuthHeader(), timeout: TIMEOUT });
};

/** Delete service type entry (Admin only) */
const deleteServiceType = async (id) => {
  return axios.delete(`${API_URL}/${id}`, { headers: getAuthHeader(), timeout: TIMEOUT });
};

const serviceTypeService = {
  getAllServiceTypes,
  getServiceTypeById,
  createServiceType,
  updateServiceType,
  deleteServiceType,
};

export default serviceTypeService;

