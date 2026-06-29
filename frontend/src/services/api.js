import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'https://etc-production-89ba.up.railway.app/api',
    timeout: 30000, // 30s timeout — mobile networks need more time
    headers: {
        'Content-Type': 'application/json',
    },
    // Ensure credentials (cookies) are sent cross-origin for mobile browsers
    withCredentials: true,
});

// Warn developers if the API URL is not explicitly set (will cause issues on Vercel/Netlify)
if (!import.meta.env.VITE_API_URL) {
    console.warn(
        '⚠️ VITE_API_URL is not set! API requests will go to /api (same-origin).',
        'In production deploys (Vercel), you MUST set VITE_API_URL in the environment variables.',
        'Example: VITE_API_URL=https://etc-production-89ba.up.railway.app/api'
    );
}

// Add token to requests & set up abort controller for mobile reliability
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

// Retry logic for network failures (mobile networks are unreliable)
const MAX_RETRIES = 3;

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const config = error.config;

        // Determine if the error is a transient network issue worth retrying
        const isNetworkError =
            !error.response &&
            (error.code === 'ERR_NETWORK' ||
             error.code === 'ECONNABORTED' ||
             error.code === 'ETIMEDOUT' ||
             error.code === 'ERR_CANCELED' ||
             error.message === 'Network Error' ||
             error.message?.includes('timeout') ||
             error.message?.includes('aborted'));

        if (isNetworkError && config) {
            config._retryCount = (config._retryCount || 0) + 1;

            if (config._retryCount <= MAX_RETRIES) {
                // Exponential backoff: 1s, 2s, 4s
                const delay = Math.min(1000 * Math.pow(2, config._retryCount - 1), 4000);
                console.log(`Retry ${config._retryCount}/${MAX_RETRIES} for ${config.url} in ${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
                // Create a fresh config to avoid stale abort controllers
                const freshConfig = { ...config };
                delete freshConfig.cancelToken;
                delete freshConfig.signal;
                return api(freshConfig);
            }
        }

        // Handle 401 - redirect to login (but not for auth requests themselves)
        const url = error.config?.url || '';
        const isAuthRequest = url.includes('/users/login') || url === '/users';
        const isAlreadyOnAuthPage = window.location.pathname === '/login' || window.location.pathname === '/signup' || window.location.pathname === '/admin/login';

        if (error.response && error.response.status === 401 && !isAuthRequest && !isAlreadyOnAuthPage) {
            localStorage.removeItem('user');
            window.location.href = '/login';
        }

        // Extract the best possible error message for the user
        if (error.response?.data?.message) {
            error.message = error.response.data.message;
        } else if (error.response?.status === 0 || !error.response) {
            // No response at all — network issue (common on mobile)
            error.message = 'Unable to connect to the server. Please check your internet connection and try again.';
        }

        return Promise.reject(error);
    }
);

export const fetchProducts = async () => {
    const { data } = await api.get('/products');
    // Guard: if backend is unreachable and Vercel serves HTML instead of JSON
    if (typeof data === 'string' || !Array.isArray(data)) {
        console.error('fetchProducts received non-array data — VITE_API_URL may be misconfigured:', typeof data);
        return [];
    }
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


export default api;
