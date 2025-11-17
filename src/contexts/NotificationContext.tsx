import React, { createContext, useContext, useMemo, useState } from 'react';
import { type NotificationType, type NotificationPriority } from '../services/Notification';

export interface RealtimeNotification {
	id: number;
	title: string;
	message: string;
	type: NotificationType;
	priority: NotificationPriority;
	userId: string;
	isRead: boolean;
	readAt?: string | null;
	entityType?: string | null;
	entityId?: number | null;
	actionUrl?: string | null;
	iconClass?: string | null;
	metaData?: Record<string, string | number | boolean> | null;
	createdAt: string;
}

interface NotificationContextValue {
	unread: number;
	items: RealtimeNotification[];
	setUnread: (n: number) => void;
	pushItem: (n: RealtimeNotification) => void;
	setItems: (items: RealtimeNotification[]) => void;
	updateItemById: (id: number, patch: Partial<RealtimeNotification>) => void;
	clearItems: () => void;
}

const NotificationContext = createContext<NotificationContextValue>({
	unread: 0,
	items: [],
	setUnread: () => {},
	pushItem: () => {},
	setItems: () => {},
	updateItemById: () => {},
	clearItems: () => {},
});

export const useNotification = (): NotificationContextValue => useContext(NotificationContext);

export const NotificationProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
	const [unread, setUnread] = useState<number>(0);
	const [items, setItems] = useState<RealtimeNotification[]>([]);

	const ctxValue = useMemo<NotificationContextValue>(() => ({
		unread,
		items,
		setUnread,
		pushItem: (n: RealtimeNotification) => setItems(prev => [n, ...prev]),
		setItems: (next: RealtimeNotification[]) => setItems(next),
		updateItemById: (id: number, patch: Partial<RealtimeNotification>) =>
			setItems(prev => prev.map(it => it.id === id ? { ...it, ...patch } : it)),
		clearItems: () => setItems([]),
	}), [unread, items]);

	return (
		<NotificationContext.Provider value={ctxValue}>
			{children}
		</NotificationContext.Provider>
	);
};


