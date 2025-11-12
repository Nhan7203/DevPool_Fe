import axios from "../configs/axios";
import { AxiosError } from "axios";

// Enums
export const NotificationType = {
  // Recruitment & Application (1xxx)
  ApplicationStatusChanged: 1001,
  InterviewRescheduled: 1003,
  InterviewCompleted: 1004,
  InterviewResultPassed: 1005,
  InterviewResultFailed: 1006,
  ApplicationOffered: 1007,
  ApplicationHired: 1008,
  ApplicationRejected: 1009,
  ApplicationWithdrawn: 1010,

  // Jobs & Projects (2xxx)
  NewJobPosted: 2001,
  JobStatusChanged: 2002,

  // Contracts (3xxx)
  ContractCreated: 3001,
  ContractPendingApproval: 3002,
  ContractActivated: 3003,
  ContractExpiringSoon: 3004,
  ContractExpired: 3005,
  ContractTerminated: 3006,

  // Talent (5xxx)
  TalentStatusChanged: 5001,
  TalentHired: 5002,

  // Documents (6xxx)
  DocumentUploaded: 6001,
} as const;

export type NotificationType = typeof NotificationType[keyof typeof NotificationType];

export const NotificationPriority = {
  Low: 1,
  Medium: 2,
  High: 3,
  Urgent: 4,
} as const;

export type NotificationPriority = typeof NotificationPriority[keyof typeof NotificationPriority];

// Interfaces
export interface Notification {
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
  metaData?: Record<string, unknown> | null;
  createdAt: string;
}

export interface NotificationCreate {
  title: string;
  message: string;
  type: NotificationType;
  priority?: NotificationPriority;
  userIds: string[];
  entityType?: string | null;
  entityId?: number | null;
  actionUrl?: string | null;
  iconClass?: string | null;
  metaData?: Record<string, string> | null;
}

export interface NotificationFilter {
  userId?: string;
  isRead?: boolean;
  type?: NotificationType;
  fromDate?: string;
  toDate?: string;
  pageNumber?: number;
  pageSize?: number;
  title?: string;
}

export interface NotificationListResult {
  notifications: Notification[];
  totalCount: number;
  unreadCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

export const notificationService = {
  async getAll(filter?: NotificationFilter): Promise<NotificationListResult> {
    try {
      const params = new URLSearchParams();

      if (filter?.userId) params.append("UserId", filter.userId);
      if (filter?.isRead !== undefined)
        params.append("IsRead", filter.isRead.toString());
      if (filter?.type !== undefined)
        params.append("Type", filter.type.toString());
      if (filter?.fromDate) params.append("FromDate", filter.fromDate);
      if (filter?.toDate) params.append("ToDate", filter.toDate);
      if (filter?.pageNumber) params.append("PageNumber", filter.pageNumber.toString());
      if (filter?.pageSize) params.append("PageSize", filter.pageSize.toString());
      if (filter?.title) params.append("Title", filter.title);

      const url = `/notification${params.toString() ? `?${params}` : ""}`;
      const response = await axios.get(url);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw error.response?.data || {
          message: "Không thể tải danh sách thông báo",
        };
      throw { message: "Lỗi không xác định khi tải dữ liệu" };
    }
  },

  async getById(id: number): Promise<Notification> {
    try {
      const response = await axios.get(`/notification/${id}`);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw error.response?.data || {
          message: "Không thể tải chi tiết thông báo",
        };
      throw { message: "Lỗi không xác định khi tải dữ liệu" };
    }
  },

  async create(payload: NotificationCreate): Promise<Notification | Notification[]> {
    try {
      const response = await axios.post("/notification", payload);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw error.response?.data || {
          message: "Không thể tạo thông báo mới",
        };
      throw { message: "Lỗi không xác định khi tạo thông báo" };
    }
  },

  async update(id: number, payload: Partial<NotificationCreate>): Promise<Notification> {
    try {
      const response = await axios.put(`/notification/${id}`, payload);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw error.response?.data || {
          message: "Không thể cập nhật thông báo",
        };
      throw { message: "Lỗi không xác định khi cập nhật" };
    }
  },

  async delete(id: number): Promise<void> {
    try {
      await axios.delete(`/notification/${id}`);
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw error.response?.data || {
          message: "Không thể xóa thông báo",
        };
      throw { message: "Lỗi không xác định khi xóa thông báo" };
    }
  },

  async markAsRead(id: number): Promise<Notification> {
    try {
      const response = await axios.put(`/notification/${id}/mark-read`, {});
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw error.response?.data || {
          message: "Không thể đánh dấu thông báo đã đọc",
        };
      throw { message: "Lỗi không xác định khi đánh dấu đã đọc" };
    }
  },

  async markAllAsRead(userId: string): Promise<void> {
    try {
      await axios.put(`/notification/mark-all-read`, { userId });
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw error.response?.data || {
          message: "Không thể đánh dấu tất cả thông báo đã đọc",
        };
      throw { message: "Lỗi không xác định khi đánh dấu tất cả đã đọc" };
    }
  },

  async getUnreadCount(userId: string): Promise<number> {
    try {
      const response = await axios.get(`/notification/unread-count?userId=${userId}`);
      return response.data.count || response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw error.response?.data || {
          message: "Không thể lấy số lượng thông báo chưa đọc",
        };
      throw { message: "Lỗi không xác định khi lấy số lượng thông báo chưa đọc" };
    }
  },
};

