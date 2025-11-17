import { HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr';

// Suy ra HUB_URL từ biến môi trường hoặc fallback localhost
// Nếu API là https://host:port/api thì Hub sẽ là https://host:port/notificationHub
const RAW_API_URL = (import.meta as any)?.env?.VITE_API_URL || 'https://localhost:7298/api';
const HUB_BASE = String(RAW_API_URL).replace(/\/api\/?$/, '');
const HUB_URL = `${HUB_BASE}/notificationHub`;

let connection: HubConnection | null = null;
let isStarting = false;

const getAccessToken = (): string => {
	const token = localStorage.getItem('accessToken') ?? '';
	return token;
};

export const createNotificationConnection = (): HubConnection => {
	if (connection) return connection;

	connection = new HubConnectionBuilder()
		.withUrl(HUB_URL, {
			accessTokenFactory: getAccessToken,
			withCredentials: true,
		})
		.withAutomaticReconnect()
		.configureLogging(LogLevel.Information)
		.build();

	// Optional: lắng nghe sự kiện hệ thống để debug
	connection.onreconnecting(() => {
		console.info('[SignalR] Reconnecting to notification hub...');
	});
	connection.onreconnected(() => {
		console.info('[SignalR] Reconnected to notification hub');
	});
	connection.onclose(() => {
		console.warn('[SignalR] Connection to notification hub closed');
	});

	return connection;
};

export const startNotificationConnection = async (): Promise<void> => {
	const conn = createNotificationConnection();
	if (conn.state === 'Connected' || isStarting) return;
	isStarting = true;
	try {
		await conn.start();
	} catch (err) {
		// Retry đơn giản sau 2s
		setTimeout(() => {
			isStarting = false;
			startNotificationConnection().catch(() => {});
		}, 2000);
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


