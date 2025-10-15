import axios from "../configs/axios";
import { AxiosError } from "axios";

export interface Project {
  id: number;
  clientCompanyId: number;
  marketId: number;
  industryId: number;
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
  industryId: number;
  name: string;
  description?: string;
  startDate: string;
  endDate?: string | null;
  status: string;
}

export interface ProjectFilter {
  clientCompanyId?: number;
  marketId?: number;
  industryId?: number;
  name?: string;
  status?: string;
  startDateFrom?: string;
  startDateTo?: string;
  excludeDeleted?: boolean;
}

export const projectService = {
  async getAll(filter?: ProjectFilter) {
    try {
      const params = new URLSearchParams();

      if (filter?.clientCompanyId)
        params.append("ClientCompanyId", filter.clientCompanyId.toString());
      if (filter?.marketId)
        params.append("MarketId", filter.marketId.toString());
      if (filter?.industryId)
        params.append("IndustryId", filter.industryId.toString());
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
};
