import axios from "../configs/axios";
import { AxiosError } from "axios";

export interface JobPosition {
  id: number;
  clientCompanyId: number;
  positionTypeId: number;
  name: string;
  description?: string;
  level: number;
  isActive: boolean;
}

export interface JobPositionPayload {
  clientCompanyId: number;
  positionTypeId: number;
  name: string;
  description?: string;
  level: number;
  isActive: boolean;
}

export interface JobPositionFilter {
  clientCompanyId?: number;
  positionTypeId?: number;
  name?: string;
  isActive?: boolean;
  excludeDeleted?: boolean;
}

export const jobPositionService = {
  async getAll(filter?: JobPositionFilter) {
    try {
      const params = new URLSearchParams();

      if (filter?.clientCompanyId)
        params.append("ClientCompanyId", filter.clientCompanyId.toString());
      if (filter?.positionTypeId)
        params.append("PositionTypeId", filter.positionTypeId.toString());
      if (filter?.name) params.append("Name", filter.name);
      if (filter?.isActive !== undefined)
        params.append("IsActive", filter.isActive ? "true" : "false");
      if (filter?.excludeDeleted !== undefined)
        params.append("ExcludeDeleted", filter.excludeDeleted ? "true" : "false");

      const url = `/jobposition${params.toString() ? `?${params}` : ""}`;
      const response = await axios.get(url);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw error.response?.data || {
          message: "Không thể tải danh sách vị trí công việc",
        };
      throw { message: "Lỗi không xác định khi tải dữ liệu" };
    }
  },

  async getById(id: number) {
    try {
      const response = await axios.get(`/jobposition/${id}`);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw error.response?.data || {
          message: "Không thể tải chi tiết vị trí công việc",
        };
      throw { message: "Lỗi không xác định khi tải dữ liệu" };
    }
  },

  async create(payload: JobPositionPayload) {
    try {
      const response = await axios.post("/jobposition", payload);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw error.response?.data || {
          message: "Không thể tạo vị trí công việc mới",
        };
      throw { message: "Lỗi không xác định khi tạo vị trí công việc" };
    }
  },

  async update(id: number, payload: Partial<JobPositionPayload>) {
    try {
      const response = await axios.put(`/jobposition/${id}`, payload);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw error.response?.data || {
          message: "Không thể cập nhật vị trí công việc",
        };
      throw { message: "Lỗi không xác định khi cập nhật" };
    }
  },

  async delete(id: number) {
    try {
      const response = await axios.delete(`/jobposition/${id}`);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw error.response?.data || {
          message: "Không thể xóa vị trí công việc",
        };
      throw { message: "Lỗi không xác định khi xóa vị trí công việc" };
    }
  },
};
