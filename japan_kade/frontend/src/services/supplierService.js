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
    return axios.post(API_URL, supplierData, { headers: getAuthHeader() });
};

const updateSupplier = (id, supplierData) => {
    return axios.put(`${API_URL}/${id}`, supplierData, { headers: getAuthHeader() });
};

const deleteSupplier = (id) => {
    return axios.delete(`${API_URL}/${id}`, { headers: getAuthHeader() });
};