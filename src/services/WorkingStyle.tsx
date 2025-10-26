import axios from "../configs/axios";
import { AxiosError } from "axios";

export interface WorkingStyle {
  id: number;
  name: string;
  description?: string;
}

export interface WorkingStyleCreate {
  name: string;
  description?: string;
}

export interface WorkingStyleFilter {
  name?: string;
  excludeDeleted?: boolean;
}

export const workingStyleService = {
  async getAll(filter?: WorkingStyleFilter) {
    try {
      const params = new URLSearchParams();

      if (filter?.name)
        params.append("Name", filter.name);
      if (filter?.excludeDeleted !== undefined)
        params.append("ExcludeDeleted", filter.excludeDeleted ? "true" : "false");

      const url = `/workingstyle${params.toString() ? `?${params}` : ""}`;
      const response = await axios.get(url);

      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw error.response?.data || { message: "Không thể tải danh sách phong cách làm việc" };
      throw { message: "Lỗi không xác định khi tải dữ liệu" };
    }
  },

  async getById(id: number) {
    try {
      const response = await axios.get(`/workingstyle/${id}`);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw error.response?.data || { message: "Không thể tải thông tin phong cách làm việc" };
      throw { message: "Lỗi không xác định khi tải dữ liệu" };
    }
  },

  async create(payload: WorkingStyleCreate) {
    try {
      const response = await axios.post("/workingstyle", payload);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw error.response?.data || { message: "Không thể tạo phong cách làm việc mới" };
      throw { message: "Lỗi không xác định khi tạo phong cách làm việc" };
    }
  },

  async update(id: number, payload: Partial<WorkingStyleCreate>) {
    try {
      const response = await axios.put(`/workingstyle/${id}`, payload);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw error.response?.data || { message: "Không thể cập nhật phong cách làm việc" };
      throw { message: "Lỗi không xác định khi cập nhật phong cách làm việc" };
    }
  },

  async delete(id: number) {
    try {
      const response = await axios.delete(`/workingstyle/${id}`);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw error.response?.data || { message: "Không thể xóa phong cách làm việc" };
      throw { message: "Lỗi không xác định khi xóa phong cách làm việc" };
    }
  },
};
