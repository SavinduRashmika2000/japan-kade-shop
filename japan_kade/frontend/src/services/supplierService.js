import axios from 'axios';

const API_URL = 'http://localhost:8080/api/suppliers';
const TIMEOUT = 10000; // 10s default timeout

const getAuthHeader = () => {
    const userStr = localStorage.getItem('user');
    if (!userStr) return {};
    const user = JSON.parse(userStr);
    return { Authorization: `Bearer ${user.token || user.accessToken}` };
};

/** Fetch all suppliers (Admin/Staff only) */
const getAllSuppliers = () => {
    return axios.get(API_URL, { headers: getAuthHeader(), timeout: TIMEOUT });
};

/** Fetch a single supplier by ID */
const getSupplierById = (id) => {
    return axios.get(`${API_URL}/${id}`, { headers: getAuthHeader(), timeout: TIMEOUT });
};

/** Create a new supplier (Admin only) */
const createSupplier = (supplierData) => {
    return axios.post(API_URL, supplierData, { headers: getAuthHeader(), timeout: TIMEOUT });
};

/** Update supplier details (Admin only) */
const updateSupplier = (id, supplierData) => {
    return axios.put(`${API_URL}/${id}`, supplierData, { headers: getAuthHeader(), timeout: TIMEOUT });
};

/** Delete a supplier (Admin only) */
const deleteSupplier = (id) => {
    return axios.delete(`${API_URL}/${id}`, { headers: getAuthHeader(), timeout: TIMEOUT });
};

const supplierService = {
    getAllSuppliers,
    getSupplierById,
    createSupplier,
    updateSupplier,
    deleteSupplier,
};

export default supplierService;

