import axios from "../configs/axios";
import { AxiosError } from "axios";

// Model Industry
export interface Industry {
  id: number;
  name: string;
  code: string;
  description?: string;
}

// Payload tạo hoặc update Industry
export interface IndustryPayload {
  name: string;
  code: string;
  description: string;
}

// Filter dùng khi lấy danh sách Industry
export interface IndustryFilter {
  name?: string;
  excludeDeleted?: boolean;
}

export const industryService = {
  // Lấy danh sách Industry
  async getAll(filter?: IndustryFilter) {
    try {
      const params = new URLSearchParams();
      if (filter?.name) params.append("Name", filter.name);
      if (filter?.excludeDeleted !== undefined)
        params.append("ExcludeDeleted", filter.excludeDeleted ? "true" : "false");

      const url = `/industry${params.toString() ? `?${params}` : ""}`;
      const response = await axios.get(url);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw error.response?.data || { message: "Không thể tải danh sách lĩnh vực" };
      throw { message: "Lỗi không xác định khi tải danh sách lĩnh vực" };
    }
  },

  // Lấy Industry theo id
  async getById(id: number) {
    try {
      const response = await axios.get(`/industry/${id}`);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw error.response?.data || { message: "Không thể tải lĩnh vực" };
      throw { message: "Lỗi không xác định khi tải dữ liệu" };
    }
  },

  // Tạo mới Industry
  async create(payload: IndustryPayload) {
    try {
      const response = await axios.post("/industry", payload);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw error.response?.data || { message: "Không thể tạo lĩnh vực" };
      throw { message: "Lỗi không xác định khi tạo lĩnh vực" };
    }
  },

  // Cập nhật Industry
  async update(id: number, payload: Partial<IndustryPayload>) {
    try {
      const response = await axios.put(`/industry/${id}`, payload);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw error.response?.data || { message: "Không thể cập nhật lĩnh vực" };
      throw { message: "Lỗi không xác định khi cập nhật lĩnh vực" };
    }
  },

  // Xóa Industry
  async delete(id: number) {
    try {
      const response = await axios.delete(`/industry/${id}`);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw error.response?.data || { message: "Không thể xóa lĩnh vực" };
      throw { message: "Lỗi không xác định khi xóa lĩnh vực" };
    }
  },
};
