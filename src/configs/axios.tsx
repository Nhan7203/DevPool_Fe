import axios from 'axios';

// const API_URL = import.meta.env.VITE_API_URL;
const API_URL = 'https://localhost:7298/api';

const axiosInstance = axios.create({
    baseURL: API_URL,
    withCredentials: true,
    timeout: 30000,
});

// 🧩 Request interceptor: tự động thêm token vào header
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// ⚡ Response interceptor: xử lý lỗi & token hết hạn
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status;

        if (status === 401) {
            console.warn('🔒 Token expired or unauthorized.');
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('devpool_user');
            window.location.href = '/login';
        } else if (status >= 400 && status < 500) {
            console.error('⚠️ Client Error:', error.response?.data || error.message);
        } else if (status >= 500) {
            console.error('💥 Server Error:', error.response?.data || error.message);
        } else {
            console.error('❗ Unexpected Error:', error.message);
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;
