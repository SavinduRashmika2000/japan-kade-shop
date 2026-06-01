import axios from 'axios';

const API_URL = 'http://localhost:8080/api/suppliers';

const getAuthHeader = () => {
    const userStr = localStorage.getItem('user');
    if (!userStr) return {};
    const user = JSON.parse(userStr);
    return { Authorization: `Bearer ${user.token || user.accessToken}` };
};

const getAllSuppliers = () => {
    return axios.get(API_URL, { headers: getAuthHeader() });
};

const getSupplierById = (id) => {
    return axios.get(`${API_URL}/${id}`, { headers: getAuthHeader() });
};

const createSupplier = (supplierData) => {