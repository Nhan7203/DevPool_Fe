import axios, { AxiosError, type AxiosRequestConfig, type InternalAxiosRequestConfig } from 'axios';
import { UNAUTHORIZED_EVENT } from '../constants/events';

// const API_URL = import.meta.env.VITE_API_URL;
const API_URL = 'https://localhost:7298/api';

const axiosInstance = axios.create({
    baseURL: API_URL,
    withCredentials: true,
    timeout: 30000,
});

const refreshClient = axios.create({
    baseURL: API_URL,
    withCredentials: true,
    timeout: 30000,
});

let isRefreshing = false;
let refreshSubscribers: Array<(token: string | null) => void> = [];

const addRefreshSubscriber = (callback: (token: string | null) => void) => {
    refreshSubscribers.push(callback);
};

const notifyRefreshSubscribers = (token: string | null) => {
    refreshSubscribers.forEach((callback) => callback(token));
    refreshSubscribers = [];
};

const handleRefreshToken = async (): Promise<string | null> => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) return null;

    try {
        const response = await refreshClient.post('/auth/refresh-token', { refreshToken });
        const { accessToken, refreshToken: newRefreshToken } = response.data ?? {};

        if (accessToken) {
            localStorage.setItem('accessToken', accessToken);
        }

        if (newRefreshToken) {
            localStorage.setItem('refreshToken', newRefreshToken);
        }

        return accessToken ?? null;
    } catch (refreshError) {
        console.error('❌ Unable to refresh token:', refreshError);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('devpool_user');
        return null;
    }
};

// 🧩 Request interceptor: tự động thêm token vào header
axiosInstance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
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
    async (error: AxiosError) => {
        const status = error.response?.status;
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

        if (status === 401 && !originalRequest?._retry) {
            originalRequest._retry = true;

            if (!isRefreshing) {
                isRefreshing = true;
                const newToken = await handleRefreshToken();
                isRefreshing = false;
                notifyRefreshSubscribers(newToken);

                if (!newToken) {
                    window.dispatchEvent(new CustomEvent(UNAUTHORIZED_EVENT));
                    return Promise.reject(error);
                }
            }

            return new Promise((resolve, reject) => {
                addRefreshSubscriber((token) => {
                    if (!token) {
                        reject(error);
                        return;
                    }

                    if (originalRequest.headers) {
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                    } else {
                        originalRequest.headers = { Authorization: `Bearer ${token}` };
                    }

                    resolve(axiosInstance(originalRequest));
                });
            });
        }

        if (status === 401) {
            console.warn('🔒 Token expired or unauthorized.');
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('devpool_user');
            window.dispatchEvent(new CustomEvent(UNAUTHORIZED_EVENT));
        } else if (status && status >= 400 && status < 500) {
            console.error('⚠️ Client Error:', error.response?.data || error.message);
        } else if (status && status >= 500) {
            console.error('💥 Server Error:', error.response?.data || error.message);
        } else {
            console.error('❗ Unexpected Error:', error.message);
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;
