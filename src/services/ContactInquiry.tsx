import axios from "../configs/axios";
import { AxiosError } from "axios";

// Status constants - can be used as enum-like object
export const ContactInquiryStatus = {
  New: "New",
  InProgress: "InProgress",
  Closed: "Closed",
} as const;

// Status type derived from the constant
export type ContactInquiryStatusType = typeof ContactInquiryStatus[keyof typeof ContactInquiryStatus];

// Status constants with additional info
export const ContactInquiryStatusConstants = {
  New: "New",
  InProgress: "InProgress",
  Closed: "Closed",
  AllStatuses: ["New", "InProgress", "Closed"] as const,
  AllowedTransitions: {
    New: ["InProgress", "Closed"],
    InProgress: ["Closed"],
    Closed: []
  } as Record<string, string[]>
};

// Model interfaces
export interface ContactInquiryModel {
  id: number;
  fullName: string;
  email: string;
  company?: string | null;
  subject: string;
  content: string;
  status: ContactInquiryStatusType;
  assignedTo?: string | null;
  assignedToName?: string | null;
  contactedAt?: string | null; // DateTime as ISO string
  contactedBy?: string | null;
  responseNotes?: string | null;
  createdAt: string; // DateTime as ISO string
  updatedAt?: string | null; // DateTime as ISO string
}

export interface ContactInquiryCreateModel {
  fullName: string;
  email: string;
  company?: string | null;
  subject: string;
  content: string;
}

export interface ContactInquiryFilterModel {
  fullName?: string;
  email?: string;
  company?: string;
  subject?: string;
  status?: ContactInquiryStatusType;
  assignedTo?: string;
  createdAtFrom?: string; // DateTime as ISO string
  createdAtTo?: string; // DateTime as ISO string
  excludeDeleted?: boolean;
  pageNumber?: number;
  pageSize?: number;
}

export interface ContactInquiryStatusUpdateModel {
  newStatus: ContactInquiryStatusType | number; // Can be string or enum number (1, 2, 3)
  responseNotes?: string | null;
}

export interface ContactInquiryClaimResult {
  isSuccess: boolean;
  message: string;
  inquiryId: number;
  assignedTo?: string | null;
  assignedToName?: string | null;
}

export interface ContactInquiryStatusTransitionResult {
  isSuccess: boolean;
  message: string;
  oldStatus?: string;
  newStatus?: string;
  validationErrors?: string[];
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export const contactInquiryService = {
  /**
   * Submit contact inquiry (Public endpoint - no auth required)
   */
  async submitInquiry(payload: ContactInquiryCreateModel): Promise<ContactInquiryModel> {
    try {
      const response = await axios.post<ContactInquiryModel>("/contactinquiry", payload);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw error.response?.data || { message: "Không thể gửi yêu cầu liên hệ" };
      throw { message: "Lỗi không xác định khi gửi yêu cầu" };
    }
  },

  /**
   * Get all contact inquiries with pagination and filtering (Sales, Manager, Admin only)
   */
  async getAll(filter?: ContactInquiryFilterModel): Promise<PagedResult<ContactInquiryModel>> {
    try {
      const params = new URLSearchParams();

      if (filter?.fullName) params.append("FullName", filter.fullName);
      if (filter?.email) params.append("Email", filter.email);
      if (filter?.company) params.append("Company", filter.company);
      if (filter?.subject) params.append("Subject", filter.subject);
      if (filter?.status) params.append("Status", filter.status);
      if (filter?.assignedTo) params.append("AssignedTo", filter.assignedTo);
      if (filter?.createdAtFrom) params.append("CreatedAtFrom", filter.createdAtFrom);
      if (filter?.createdAtTo) params.append("CreatedAtTo", filter.createdAtTo);
      if (filter?.excludeDeleted !== undefined)
        params.append("ExcludeDeleted", filter.excludeDeleted.toString());
      if (filter?.pageNumber !== undefined)
        params.append("PageNumber", filter.pageNumber.toString());
      if (filter?.pageSize !== undefined)
        params.append("PageSize", filter.pageSize.toString());

      const url = `/contactinquiry${params.toString() ? `?${params}` : ""}`;
      const response = await axios.get<PagedResult<ContactInquiryModel>>(url);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw error.response?.data || { message: "Không thể tải danh sách yêu cầu liên hệ" };
      throw { message: "Lỗi không xác định khi tải dữ liệu" };
    }
  },

  /**
   * Get contact inquiry by ID (Sales, Manager, Admin only)
   */
  async getById(id: number): Promise<ContactInquiryModel> {
    try {
      const response = await axios.get<ContactInquiryModel>(`/contactinquiry/${id}`);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        if (error.response?.status === 404)
          throw { message: "Không tìm thấy yêu cầu liên hệ" };
        throw error.response?.data || { message: "Không thể tải thông tin yêu cầu liên hệ" };
      }
      throw { message: "Lỗi không xác định khi tải dữ liệu" };
    }
  },

  /**
   * Claim inquiry - Sales person claims it to prevent duplicate contacts (Sales, Manager, Admin only)
   */
  async claimInquiry(id: number): Promise<ContactInquiryClaimResult> {
    try {
      const response = await axios.post<ContactInquiryClaimResult>(`/contactinquiry/${id}/claim`);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        if (error.response?.status === 401)
          throw { message: "Bạn chưa đăng nhập" };
        throw error.response?.data || { message: "Không thể nhận yêu cầu liên hệ" };
      }
      throw { message: "Lỗi không xác định khi nhận yêu cầu" };
    }
  },

  /**
   * Update inquiry status (Sales, Manager, Admin only)
   */
  async updateStatus(
    id: number,
    payload: ContactInquiryStatusUpdateModel
  ): Promise<ContactInquiryStatusTransitionResult> {
    try {
      const response = await axios.put<ContactInquiryStatusTransitionResult>(
        `/contactinquiry/${id}/change-status`,
        payload
      );
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        if (error.response?.status === 401)
          throw { message: "Bạn chưa đăng nhập" };
        throw error.response?.data || { message: "Không thể cập nhật trạng thái" };
      }
      throw { message: "Lỗi không xác định khi cập nhật trạng thái" };
    }
  },

  /**
   * Get available status transitions for an inquiry (Sales, Manager, Admin only)
   */
  async getAvailableStatusTransitions(id: number): Promise<string[]> {
    try {
      const response = await axios.get<string[]>(`/contactinquiry/${id}/available-status-transitions`);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        if (error.response?.status === 404)
          throw { message: "Không tìm thấy yêu cầu liên hệ" };
        throw error.response?.data || { message: "Không thể tải danh sách trạng thái có thể chuyển" };
      }
      throw { message: "Lỗi không xác định khi tải dữ liệu" };
    }
  }
};

