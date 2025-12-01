import axios from "../configs/axios";
import { AxiosError } from "axios";

export interface Project {
  id: number;
  clientCompanyId: number;
  marketId: number;
  industryIds: number[];
  industryNames?: string[];
  name: string;
  description?: string;
  startDate: string;
  endDate?: string | null;
  status: string;
  createdAt: string;
  updatedAt?: string | null;
  isDeleted: boolean;
}

export interface ProjectPayload {
  clientCompanyId: number;
  marketId: number;
  industryIds: number[];
  name: string;
  description?: string;
  startDate: string;
  endDate?: string | null;
  status: string;
}

export interface ProjectFilter {
  clientCompanyId?: number;
  marketId?: number;
  industryIds?: number[];
  name?: string;
  status?: string;
  startDateFrom?: string;
  startDateTo?: string;
  excludeDeleted?: boolean;
}

export interface ProjectStatusUpdateModel {
  newStatus: string;
  notes?: string | null;
}

export interface ProjectStatusTransitionResult {
  success: boolean;
  message?: string;
  data?: any;
  isSuccess?: boolean;
}

export interface ProjectDetailedModel {
  id: number;
  clientCompanyId?: number | null;
  marketId?: number | null;
  industryIds: number[];
  name: string;
  description?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  status?: string | null;
  createdAt: string;
  updatedAt: string;
  // Navigation Properties
  clientCompanyName?: string | null;
  marketName?: string | null;
  industryNames: string[];
  // Related Collections
  jobRequests?: any[];
  clientContracts?: any[];
  staffAssignments?: any[];
}

export const projectService = {
  async getAll(filter?: ProjectFilter) {
    try {
      const params = new URLSearchParams();

      if (filter?.clientCompanyId)
        params.append("ClientCompanyId", filter.clientCompanyId.toString());
      if (filter?.marketId)
        params.append("MarketId", filter.marketId.toString());
      if (filter?.industryIds?.length) {
        filter.industryIds.forEach((industryId) =>
          params.append("IndustryIds", industryId.toString())
        );
      }
      if (filter?.name)
        params.append("Name", filter.name);
      if (filter?.status)
        params.append("Status", filter.status);
      if (filter?.startDateFrom)
        params.append("StartDateFrom", filter.startDateFrom);
      if (filter?.startDateTo)
        params.append("StartDateTo", filter.startDateTo);
      if (filter?.excludeDeleted !== undefined)
        params.append("ExcludeDeleted", filter.excludeDeleted ? "true" : "false");

      const url = `/project${params.toString() ? `?${params}` : ""}`;
      const response = await axios.get(url);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw error.response?.data || { message: "Không thể tải danh sách dự án" };
      throw { message: "Lỗi không xác định khi tải danh sách dự án" };
    }
  },

  async getById(id: number) {
    try {
      const response = await axios.get(`/project/${id}`);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw error.response?.data || { message: "Không thể tải thông tin dự án" };
      throw { message: "Lỗi không xác định khi tải dữ liệu" };
    }
  },

  async getDetailedById(id: number): Promise<ProjectDetailedModel> {
    try {
      const response = await axios.get(`/project/${id}/detailed`);
      // Backend trả về { success: true, message: "...", data: ProjectDetailedModel }
      return response.data.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw error.response?.data || { message: "Không thể tải thông tin chi tiết dự án" };
      throw { message: "Lỗi không xác định khi tải thông tin chi tiết dự án" };
    }
  },

  async create(payload: Partial<ProjectPayload>) {
    try {
      const response = await axios.post("/project", payload);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw error.response?.data || { message: "Không thể tạo dự án" };
      throw { message: "Lỗi không xác định khi tạo dự án" };
    }
  },

  async update(id: number, payload: Partial<ProjectPayload>) {
    try {
      const response = await axios.put(`/project/${id}`, payload);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw error.response?.data || { message: "Không thể cập nhật dự án" };
      throw { message: "Lỗi không xác định khi cập nhật dự án" };
    }
  },

  async delete(id: number) {
    try {
      const response = await axios.delete(`/project/${id}`);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw error.response?.data || { message: "Không thể xóa dự án" };
      throw { message: "Lỗi không xác định khi xóa dự án" };
    }
  },

  async updateStatus(id: number, payload: ProjectStatusUpdateModel): Promise<ProjectStatusTransitionResult> {
    try {
      const response = await axios.put(`/project/${id}/change-status`, payload);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw error.response?.data || { message: "Không thể thay đổi trạng thái dự án" };
      throw { message: "Lỗi không xác định khi thay đổi trạng thái dự án" };
    }
  },
};
