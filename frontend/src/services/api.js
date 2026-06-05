import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '/api',
});

// Add token to requests
api.interceptors.request.use((config) => {
    try {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user && user.token) {
            config.headers.Authorization = `Bearer ${user.token}`;
        }
    } catch {
        // Corrupted localStorage — ignore
        localStorage.removeItem('user');
    }
    return config;
});

// Handle global response errors (e.g. 401 Unauthorized token expirations)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const url = error.config?.url || '';
        const isAuthRequest = url.includes('/users/login') || url === '/users';
        const isAlreadyOnAuthPage = window.location.pathname === '/login' || window.location.pathname === '/signup' || window.location.pathname === '/admin/login';

        if (error.response && error.response.status === 401 && !isAuthRequest && !isAlreadyOnAuthPage) {
            localStorage.removeItem('user');
            window.location.href = '/login';
        }

        // Extract the server error message so callers get a useful message
        const serverMessage = error.response?.data?.message;
        if (serverMessage) {
            error.message = serverMessage;
        }
        return Promise.reject(error);
    }
);

export const fetchProducts = async () => {
    const { data } = await api.get('/products');
    return data;
};

export const fetchProductById = async (id) => {
    const { data } = await api.get(`/products/${id}`);
    return data;
};

export const searchProducts = async (query) => {
    const { data } = await api.get(`/products/search?q=${encodeURIComponent(query)}`);
    return data;
};

export const login = async (email, password) => {
    const { data } = await api.post('/users/login', { email, password });
    return data;
};

export const register = async (name, email, password) => {
    const { data } = await api.post('/users', { name, email, password });
    return data;
};

export const updateProfile = async (userData) => {
    const { data } = await api.put('/users/profile', userData);
    return data;
};

export const deleteAccount = async () => {
    const { data } = await api.delete('/users/profile');
    return data;
};

export const fetchProfile = async () => {
    const { data } = await api.get('/users/profile');
    return data;
};

export const fetchActiveCoupons = async () => {
    const { data } = await api.get('/coupons');
    return data;
};

export const applyCoupon = async (code, orderAmount, items) => {
    const { data } = await api.post('/coupons/apply', { code, orderAmount, items });
    return data;
};

export const createOrder = async (orderData) => {
    const { data } = await api.post('/orders', orderData);
    return data;
};

export const fetchMyOrders = async () => {
    const { data } = await api.get('/orders/myorders');
    return data;
};

export const payOrder = async (id, paymentResult) => {
    const { data } = await api.put(`/orders/${id}/pay`, paymentResult);
    return data;
};

export const simulatePayment = async (orderId) => {
    const { data } = await api.put(`/orders/${orderId}/simulate-payment`);
    return data;
};

// Stripe Payment APIs
export const createPaymentIntentStripe = async (amount, currency = 'inr', orderId = '') => {
    const { data } = await api.post('/payment/create-payment-intent', { amount, currency, orderId });
    return data;
};

export const confirmStripePayment = async (paymentIntentId, orderId) => {
    const { data } = await api.post('/payment/confirm', { paymentIntentId, orderId });
    return data;
};

export const createPaymentIntent = async (orderId) => {
    const { data } = await api.post(`/orders/${orderId}/create-payment-intent`);
    return data;
};

export const fetchOrderById = async (orderId) => {
    const { data } = await api.get(`/orders/${orderId}`);
    return data;
};

export const cancelOrder = async (id, reason) => {
    const { data } = await api.patch(`/orders/${id}/cancel`, { reason });
    return data;
};

export const fetchAllOrders = async () => {
    const { data } = await api.get('/orders');
    return data;
};

export const getAIRecommendations = async (message, conversationHistory = []) => {
    const { data } = await api.post('/ai/chat', { message, conversationHistory });
    return data;
};

export const getSmartRecommendations = async (productId, cartItems = []) => {
    const { data } = await api.post('/ai/recommendations', { productId, cartItems });
    return data;
};

export const parseVoiceCommand = async (text) => {
    const { data } = await api.post('/ai/parse-voice-command', { text });
    return data;
};

export const transcribeAudio = async (audioBlob) => {
    const formData = new FormData();
    // Use 'audio.webm' as a default extension for browser-recorded media
    formData.append('audio', audioBlob, 'audio.webm');
    
    // We send it as multipart/form-data, but we let Axios set the Content-Type automatically 
    // so it includes the correct boundary parameter.
    const { data } = await api.post('/ai/transcribe', formData);
    return data;
};

// Admin APIs
export const getAdminStats = async () => {
    const { data } = await api.get('/admin/stats');
    return data;
};

export const getAdminAnalytics = async () => {
    const { data } = await api.get('/admin/analytics');
    return data;
};

export const getAllCustomers = async () => {
    const { data } = await api.get('/admin/customers');
    return data;
};

export const createCustomer = async (customerData) => {
    const { data } = await api.post('/admin/customers', customerData);
    return data;
};

export const getAllOrdersAdmin = async () => {
    const { data } = await api.get('/admin/orders');
    return data;
};

export const createProduct = async (productData) => {
    const { data } = await api.post('/products', productData);
    return data;
};

export const updateProduct = async (id, productData) => {
    const { data } = await api.put(`/products/${id}`, productData);
    return data;
};

export const deleteProduct = async (id) => {
    const { data } = await api.delete(`/products/${id}`);
    return data;
};

export const updateUserRole = async (id, role) => {
    const { data } = await api.put(`/admin/users/${id}`, { role });
    return data;
};

export const deleteUser = async (id) => {
    const { data } = await api.delete(`/admin/users/${id}`);
    return data;
};

export const updateOrderStatus = async (id, status) => {
    const { data } = await api.patch(`/admin/orders/${id}/status`, { status });
    return data;
};

// ── Cluster APIs ──
export const getClusterStatus = async () => {
    const { data } = await api.get('/cluster/status');
    return data;
};

export const getClusterUsers = async (params = {}) => {
    const { data } = await api.get('/cluster/users', { params });
    return data;
};

export const batchUpdateUserRoles = async (userIds, role) => {
    const { data } = await api.put('/cluster/users/batch-role', { userIds, role });
    return data;
};

export const batchDeleteUsers = async (userIds) => {
    const { data } = await api.delete('/cluster/users/batch', { data: { userIds } });
    return data;
};

export const exportUsers = async () => {
    const { data } = await api.get('/cluster/users/export');
    return data;
};

export default api;
