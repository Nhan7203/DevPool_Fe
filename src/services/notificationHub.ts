import { HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import { getAccessToken as getTokenFromStorage } from '../utils/storage';
import { API_URL } from '../configs/api';

// Suy ra HUB_URL từ API_URL
// Nếu API là https://host:port/api thì Hub sẽ là https://host:port/notificationHub
const HUB_BASE = String(API_URL).replace(/\/api\/?$/, '');
const HUB_URL = `${HUB_BASE}/notificationHub`;

let connection: HubConnection | null = null;
let isStarting = false;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 3;

// Hàm refresh token (sử dụng cùng logic như axios config)
const refreshToken = async (): Promise<string | null> => {
	try {
		// Xác định storage dựa trên rememberMe trước khi lấy token
		const rememberMe = localStorage.getItem('remember_me') === 'true';
		const storage = rememberMe ? localStorage : sessionStorage;
		
		// Lấy refresh token từ đúng storage (ưu tiên storage hiện tại, fallback sang storage kia)
		let refreshTokenValue = storage.getItem('refreshToken');
		if (!refreshTokenValue) {
			// Fallback: thử storage còn lại
			const fallbackStorage = rememberMe ? sessionStorage : localStorage;
			refreshTokenValue = fallbackStorage.getItem('refreshToken');
		}
		
		if (!refreshTokenValue) {
			console.warn('⚠️ No refresh token found in storage (notificationHub)');
			return null;
		}

		const response = await fetch(`${API_URL}/auth/refresh-token`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			credentials: 'include',
			body: JSON.stringify({ refreshToken: refreshTokenValue }),
		});

		if (!response.ok) {
			const errorData = await response.json().catch(() => ({}));
			const errorMessage = errorData?.message || 'Unknown error';
			console.error('❌ Unable to refresh token (notificationHub):', errorMessage);
			
			// Xử lý đặc biệt cho lỗi "Refresh token is revoked or does not match"
			if (errorMessage.includes('revoked') || errorMessage.includes('does not match')) {
				console.warn('⚠️ Refresh token mismatch - user may have logged in elsewhere (notificationHub)');
			}
			
			// Nếu refresh thất bại, xóa tokens
			localStorage.removeItem('accessToken');
			localStorage.removeItem('refreshToken');
			localStorage.removeItem('remember_me');
			sessionStorage.removeItem('accessToken');
			sessionStorage.removeItem('refreshToken');
			sessionStorage.removeItem('remember_me');
			return null;
		}

		const data = await response.json();
		if (data.accessToken) {
			// Lưu token mới vào storage
			storage.setItem('accessToken', data.accessToken);
			if (data.refreshToken) {
				storage.setItem('refreshToken', data.refreshToken);
				// Xóa token cũ ở storage kia nếu có (tránh conflict)
				const otherStorage = rememberMe ? sessionStorage : localStorage;
				otherStorage.removeItem('refreshToken');
			}
			return data.accessToken;
		}
		return null;
	} catch (error) {
		console.error('❌ Error refreshing token (notificationHub):', error);
		return null;
	}
};

// Function kept for potential future use
const getAccessToken = async (): Promise<string> => {
	let token = getTokenFromStorage() ?? '';
	
	// Luôn thử refresh token để đảm bảo token còn hiệu lực
	// Nếu không có token hoặc token có thể đã hết hạn, refresh
	if (!token) {
		const newToken = await refreshToken();
		if (newToken) {
			token = newToken;
		}
	}
	
	return token;
};

// Suppress unused function warning - may be used in future
void getAccessToken;

export const createNotificationConnection = (): HubConnection => {
	if (connection) return connection;

	connection = new HubConnectionBuilder()
		.withUrl(HUB_URL, {
			accessTokenFactory: async () => {
				// Luôn lấy token mới nhất từ storage
				const token = getTokenFromStorage() ?? '';
				if (!token) {
					// Nếu không có token, thử refresh
					const newToken = await refreshToken();
					return newToken || '';
				}
				return token;
			},
			withCredentials: true,
		})
		.withAutomaticReconnect({
			nextRetryDelayInMilliseconds: (retryContext) => {
				// Exponential backoff: 0s, 2s, 10s, 30s
				if (retryContext.previousRetryCount === 0) return 0;
				if (retryContext.previousRetryCount === 1) return 2000;
				if (retryContext.previousRetryCount === 2) return 10000;
				return 30000;
			},
		})
		.configureLogging(LogLevel.Warning)
		.build();

	// Optional: lắng nghe sự kiện hệ thống để debug
	connection.onreconnecting(() => {
		reconnectAttempts++;
	});
	connection.onreconnected(() => {
		reconnectAttempts = 0;
	});
	connection.onclose(async (error) => {
		// Nếu lỗi 401 và chưa vượt quá số lần thử, thử refresh token và reconnect
		if (error && reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
			const newToken = await refreshToken();
			if (newToken) {
				// Tạo lại connection với token mới
				connection = null;
				setTimeout(() => {
					startNotificationConnection(true).catch(() => {});
				}, 2000);
			}
		}
	});

	return connection;
};

export const startNotificationConnection = async (forceRestart: boolean = false): Promise<void> => {
	// Kiểm tra và refresh token trước khi kết nối
	let token = getTokenFromStorage();
	if (!token) {
		// Thử refresh token nếu không có token
		token = await refreshToken();
		if (!token) {
			// Không có token và không thể refresh, không kết nối
			return;
		}
	}

	// Nếu force restart, dừng connection cũ trước
	if (forceRestart && connection && connection.state !== 'Disconnected') {
		try {
			await connection.stop();
			connection = null; // Reset connection để tạo mới
		} catch {
			// ignore
		}
	}
	
	const newConn = createNotificationConnection();
	if (newConn.state === 'Connected' || isStarting) return;
	isStarting = true;
	
	try {
		await newConn.start();
		reconnectAttempts = 0; // Reset counter khi kết nối thành công
	} catch (err: any) {
		const errorMessage = err?.message || '';
		const statusCode = err?.statusCode || err?.status;
		
		// Nếu lỗi 401, thử refresh token và reconnect
		if (statusCode === 401 || errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
			const newToken = await refreshToken();
			if (newToken && reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
				// Tạo lại connection với token mới
				connection = null;
				reconnectAttempts++;
				setTimeout(() => {
					isStarting = false;
					startNotificationConnection(true).catch(() => {});
				}, 1000);
				return;
			} else {
				// Không thể refresh token, dừng kết nối
				isStarting = false;
				return;
			}
		}
		
		// Retry đơn giản sau 2s cho các lỗi khác (nếu chưa vượt quá số lần thử)
		if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
			reconnectAttempts++;
			setTimeout(() => {
				isStarting = false;
				startNotificationConnection(forceRestart).catch(() => {});
			}, 2000);
		} else {
			isStarting = false;
		}
		return;
	} finally {
		isStarting = false;
	}
};

export const stopNotificationConnection = async (): Promise<void> => {
	if (connection) {
		try {
			await connection.stop();
		} catch {
			// ignore
		}
	}
};

// Đăng ký handler nhận thông báo realtime từ server (ví dụ method name 'ReceiveNotification')
export const onReceiveNotification = (handler: (payload: unknown) => void): void => {
	const conn = createNotificationConnection();
	conn.on('ReceiveNotification', handler as (...args: any[]) => void);
};

export const offReceiveNotification = (handler: (payload: unknown) => void): void => {
	if (!connection) return;
	connection.off('ReceiveNotification', handler as (...args: any[]) => void);
};

// Lắng nghe cập nhật số lượng chưa đọc
export const onUnreadCountUpdated = (handler: (count: number) => void): void => {
	const conn = createNotificationConnection();
	// Đăng ký cả hai biến thể tên để tránh sai khác chữ hoa/thường từ server
	conn.on('UnreadCountUpdated', handler as (...args: any[]) => void);
	conn.on('unreadcountupdated', handler as (...args: any[]) => void);
};

export const offUnreadCountUpdated = (handler: (count: number) => void): void => {
	if (!connection) return;
	connection.off('UnreadCountUpdated', handler as (...args: any[]) => void);
	connection.off('unreadcountupdated', handler as (...args: any[]) => void);
};

// Hủy đăng ký handler nếu cần
// Các hàm invoke tới hub (khớp với BE)
export const getUnreadCount = async (): Promise<number> => {
	const conn = createNotificationConnection();
	if (conn.state !== 'Connected') await startNotificationConnection();
	try {
		const count = await conn.invoke<number>('GetUnreadCount');
		return typeof count === 'number' ? count : 0;
	} catch {
		return 0;
	}
};

export const markNotificationAsRead = async (notificationId: number): Promise<void> => {
	const conn = createNotificationConnection();
	if (conn.state !== 'Connected') await startNotificationConnection();
	await conn.invoke('MarkNotificationAsRead', notificationId);
};

export const markAllNotificationsAsRead = async (): Promise<void> => {
	const conn = createNotificationConnection();
	if (conn.state !== 'Connected') await startNotificationConnection();
	await conn.invoke('MarkAllNotificationsAsRead');
};

export const updateActivity = async (): Promise<void> => {
	const conn = createNotificationConnection();
	if (conn.state !== 'Connected') await startNotificationConnection();
	await conn.invoke('UpdateActivity');
};


