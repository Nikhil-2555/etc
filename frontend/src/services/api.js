import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000/api',
});

// Add token to requests
api.interceptors.request.use((config) => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.token) {
        config.headers.Authorization = `Bearer ${user.token}`;
    }
    return config;
});

// Handle global response errors (e.g. 401 Unauthorized token expirations)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const isLoginRequest = error.config && error.config.url && error.config.url.includes('/users/login');
        if (error.response && error.response.status === 401 && !isLoginRequest) {
            localStorage.removeItem('user');
            window.location.href = '/login';
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

export const cancelOrder = async (id) => {
    const { data } = await api.patch(`/orders/${id}/cancel`);
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

export default api;
