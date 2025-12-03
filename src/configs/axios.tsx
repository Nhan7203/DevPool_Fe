import axios, { AxiosError, type AxiosRequestConfig, type InternalAxiosRequestConfig } from 'axios';
import { UNAUTHORIZED_EVENT } from '../constants/events';

// const API_URL = import.meta.env.VITE_API_URL;
const API_URL = 'https://localhost:7298/api';
// const API_URL = 'https://api-devpool.innosphere.io.vn/api';
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

// 🔎 Chuẩn hóa message lỗi trả về từ BE để hiển thị cho người dùng
const extractServerMessage = (data: unknown): string => {
	try {
		if (!data) return '';
		if (typeof data === 'string') return data;
		if (typeof data === 'object') {
			const obj = data as Record<string, unknown>;
			const candidates: string[] = [];
			const tryPush = (v: unknown) => {
				if (typeof v === 'string' && v.trim()) candidates.push(v.trim());
			};
			// Các field phổ biến từ BE
			tryPush(obj.error);
			tryPush(obj.message);
			tryPush((obj as any).objecterror);
			tryPush((obj as any).Objecterror);
			tryPush((obj as any).detail);
			tryPush((obj as any).title);
			// Thu thập thêm các string values khác (tránh đè lên candidates đã có)
			Object.values(obj).forEach((v) => tryPush(v));
			// Loại trùng và nối lại
			return Array.from(new Set(candidates)).join(' ').trim();
		}
		return '';
	} catch {
		return '';
	}
};

const addRefreshSubscriber = (callback: (token: string | null) => void) => {
    refreshSubscribers.push(callback);
};

const notifyRefreshSubscribers = (token: string | null) => {
    refreshSubscribers.forEach((callback) => callback(token));
    refreshSubscribers = [];
};

const handleRefreshToken = async (): Promise<string | null> => {
    // Lấy refresh token từ cả localStorage và sessionStorage
    const refreshToken = localStorage.getItem('refreshToken') || sessionStorage.getItem('refreshToken');
    if (!refreshToken) return null;

    const rememberMe = localStorage.getItem('remember_me') === 'true';
    const storage = rememberMe ? localStorage : sessionStorage;

    try {
        const response = await refreshClient.post('/auth/refresh-token', { refreshToken });
        const { accessToken, refreshToken: newRefreshToken } = response.data ?? {};

        if (accessToken) {
            storage.setItem('accessToken', accessToken);
        }

        if (newRefreshToken) {
            storage.setItem('refreshToken', newRefreshToken);
        }

        return accessToken ?? null;
    } catch (refreshError) {
        console.error('❌ Unable to refresh token:', refreshError);
        // Xóa từ cả 2 storage
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('devpool_user');
        sessionStorage.removeItem('accessToken');
        sessionStorage.removeItem('refreshToken');
        sessionStorage.removeItem('devpool_user');
        return null;
    }
};

// 🧩 Request interceptor: tự động thêm token vào header
axiosInstance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        // Lấy token từ cả localStorage và sessionStorage
        const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
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
		// Gắn normalizedMessage để màn FE có thể đọc thống nhất
		const normalized = extractServerMessage(error.response?.data);
		(error as any).normalizedMessage = normalized || error.message;
		if (normalized && typeof error.message === 'string') {
			// Cập nhật luôn error.message để các nơi chỉ đọc message vẫn thấy nội dung từ BE
			error.message = normalized;
		}
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
            // Xóa từ cả 2 storage
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('devpool_user');
            sessionStorage.removeItem('accessToken');
            sessionStorage.removeItem('refreshToken');
            sessionStorage.removeItem('devpool_user');
            window.dispatchEvent(new CustomEvent(UNAUTHORIZED_EVENT));
        } else if (status && status >= 400 && status < 500) {
			console.error('⚠️ Client Error:', error.response?.data || error.message);
			// Hiển thị cảnh báo thân thiện cho một số lỗi phổ biến
			const lower = (normalized || '').toLowerCase();
			if (lower.includes('email') && lower.includes('already exists')) {
				alert('❌ Email đã tồn tại trong hệ thống. Vui lòng dùng email khác.');
			}
        } else if (status && status >= 500) {
			// Ưu tiên in ra thông điệp chuẩn hóa nếu có (ví dụ: "Email already exists")
			console.error('💥 Server Error:', normalized || error.response?.data || error.message);
			// Hiển thị cảnh báo nếu có thông điệp cụ thể
			if (normalized) {
				const lower = normalized.toLowerCase();
				if (lower.includes('email') && lower.includes('already exists')) {
					alert('❌ Email đã tồn tại trong hệ thống. Vui lòng dùng email khác.');
				}
			}
        } else {
			console.error('❗ Unexpected Error:', error.message);
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;
