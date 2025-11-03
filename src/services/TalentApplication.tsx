import axios from "../configs/axios";
import { AxiosError } from "axios";

export interface TalentApplication {
  id: number;
  jobRequestId: number;
  cvId: number;
  submittedBy: string;
  status: string;
  note?: string;
  convertedCVPath?: string | null;
  createdAt: string; // ISO string
  updatedAt?: string | null; // ISO string
}

export interface TalentApplicationCreate {
  jobRequestId: number;
  cvId: number;
  submittedBy: string;
  status?: string; // default "Pending" on server
  note?: string;
  convertedCVPath?: string;
}

export interface TalentApplicationFilter {
  jobRequestId?: number;
  cvId?: number;
  submittedBy?: string;
  status?: string;
  submittedFrom?: string; // ISO string
  submittedTo?: string; // ISO string
  excludeDeleted?: boolean;
}

export interface TalentApplicationStatusUpdate {
  newStatus: string;
  note?: string;
}

export interface TalentApplicationStatusTransitionResult {
  isSuccess: boolean;
  message: string;
  oldStatus?: string | null;
  newStatus?: string | null;
  validationErrors: string[];
}

export const talentApplicationService = {
  async getAll(filter?: TalentApplicationFilter) {
    try {
      const params = new URLSearchParams();
      if (filter?.jobRequestId) params.append("JobRequestId", filter.jobRequestId.toString());
      if (filter?.cvId) params.append("CvId", filter.cvId.toString());
      if (filter?.submittedBy) params.append("SubmittedBy", filter.submittedBy);
      if (filter?.status) params.append("Status", filter.status);
      if (filter?.submittedFrom) params.append("SubmittedFrom", filter.submittedFrom);
      if (filter?.submittedTo) params.append("SubmittedTo", filter.submittedTo);
      if (filter?.excludeDeleted !== undefined) params.append("ExcludeDeleted", filter.excludeDeleted ? "true" : "false");

      const url = `/talentapplication${params.toString() ? `?${params}` : ""}`;
      const response = await axios.get(url);
      return response.data as TalentApplication[];
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw error.response?.data || { message: "Không thể tải danh sách đơn ứng tuyển" };
      throw { message: "Lỗi không xác định khi tải danh sách đơn ứng tuyển" };
    }
  },

  async getById(id: number) {
    try {
      const response = await axios.get(`/talentapplication/${id}`);
      return response.data as TalentApplication;
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw error.response?.data || { message: "Không thể tải thông tin đơn ứng tuyển" };
      throw { message: "Lỗi không xác định khi tải dữ liệu" };
    }
  },

  async create(payload: TalentApplicationCreate) {
    try {
      const response = await axios.post("/talentapplication", payload);
      return response.data as TalentApplication;
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw error.response?.data || { message: "Không thể tạo đơn ứng tuyển" };
      throw { message: "Lỗi không xác định khi tạo đơn ứng tuyển" };
    }
  },

  async updateStatus(id: number, payload: TalentApplicationStatusUpdate) {
    try {
      // Giả định endpoint cập nhật trạng thái
      const response = await axios.put(`/talentapplication/${id}/status`, payload);
      return response.data as TalentApplicationStatusTransitionResult;
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw error.response?.data || { message: "Không thể cập nhật trạng thái đơn ứng tuyển" };
      throw { message: "Lỗi không xác định khi cập nhật trạng thái" };
    }
  },
};


