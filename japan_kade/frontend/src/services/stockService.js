import axios from 'axios';

const API_URL = 'http://localhost:8080/api/stock';
const TIMEOUT = 15000; // 15s default timeout

const getAuthHeader = () => {
  const userStr = localStorage.getItem('user');
  if (!userStr) return {};
  const user = JSON.parse(userStr);
  return { Authorization: `Bearer ${user.token || user.accessToken}` };
};

/** Fetch all stock items */
const getAllStockItems = async () => {
  return axios.get(API_URL, { headers: getAuthHeader(), timeout: TIMEOUT });
};

/** Trigger stock synchronization (Admin/Staff only) */
const syncAllStock = async () => {
  return axios.post(`${API_URL}/sync`, null, { headers: getAuthHeader(), timeout: TIMEOUT });
};

/** Fetch a single stock item by ID */
const getStockItemById = async (id) => {
  return axios.get(`${API_URL}/${id}`, { headers: getAuthHeader(), timeout: TIMEOUT });
};

/**
 * Check if the requested quantity of a stock item is available.
 * @param {number} id - Stock Item ID
 * @param {number} quantity - Quantity to check
 */
const checkAvailability = async (id, quantity) => {
  return axios.get(`${API_URL}/${id}/check-availability`, {
    params: { quantity },
    headers: getAuthHeader(),
    timeout: TIMEOUT
  });
};

/** Create a new stock item (Admin only) */
const createStockItem = async (stockData) => {
  return axios.post(API_URL, stockData, { headers: getAuthHeader(), timeout: TIMEOUT });
};

/** Update stock item details (Admin only) */
const updateStockItem = async (id, stockData) => {
  return axios.put(`${API_URL}/${id}`, stockData, { headers: getAuthHeader(), timeout: TIMEOUT });
};

/** Delete a stock item (Admin only) */
const deleteStockItem = async (id) => {
  return axios.delete(`${API_URL}/${id}`, { headers: getAuthHeader(), timeout: TIMEOUT });
};

/** Delete all stock items (Admin only) */
const deleteAllStock = async () => {
  return axios.delete(`${API_URL}/all`, { headers: getAuthHeader(), timeout: TIMEOUT });
};

/**
 * Add stock batch to an existing stock item (Admin only).
 * @param {number} id - Stock Item ID
 * @param {Object} payload - Stock intake payload
 */
const addStock = async (id, payload) => {
  return axios.post(`${API_URL}/${id}/add-stock`, payload, { headers: getAuthHeader(), timeout: TIMEOUT });
};

/**
 * Manually reduce stock of an item (Admin only).
 * @param {number} id - Stock Item ID
 * @param {Object} payload - Reduction payload
 */
const reduceStock = async (id, payload) => {
  return axios.post(`${API_URL}/${id}/reduce-stock`, payload, { headers: getAuthHeader(), timeout: TIMEOUT });
};

/**
 * Preview FIFO cost for a specific quantity reduction.
 * @param {number} id - Stock Item ID
 * @param {number} quantity - Quantity to preview
 */
const previewFifoCost = async (id, quantity) => {
  return axios.get(`${API_URL}/${id}/preview-fifo-cost`, {
    params: { quantity },
    headers: getAuthHeader(),
    timeout: TIMEOUT
  });
};

/** Fetch all stock transactions log (Admin only) */
const getAllTransactions = async () => {
  return axios.get(`${API_URL}/transactions`, { headers: getAuthHeader(), timeout: TIMEOUT });
};

/** Fetch all active batches for a stock item */
const getBatches = async (id) => {
  return axios.get(`${API_URL}/${id}/batches`, { headers: getAuthHeader(), timeout: TIMEOUT });
};

/** Fetch inventory profit and sales analytics (Admin only) */
const getInventoryAnalytics = async () => {
  return axios.get(`${API_URL}/analytics`, { headers: getAuthHeader(), timeout: TIMEOUT });
};

const stockService = {
  getAllStockItems,
  syncAllStock,
  getStockItemById,
  checkAvailability,
  createStockItem,
  updateStockItem,
  deleteStockItem,
  deleteAllStock,
  addStock,
  reduceStock,
  previewFifoCost,
  getAllTransactions,
  getBatches,
  getInventoryAnalytics
};

export default stockService;

