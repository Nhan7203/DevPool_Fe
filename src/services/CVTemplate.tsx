import axios from "../configs/axios";
import { AxiosError } from "axios";

export interface CVTemplate {
  id: number;
  name: string;
  templateFilePath: string;
  isDefault: boolean;
  description?: string;
  createdAt: string; // ISO date string
  updatedAt?: string;
  isDeleted: boolean;
}

export interface CVTemplatePayload {
  name: string;
  templateFilePath: string;
  isDefault?: boolean;
  description?: string;
}

export interface CVTemplateFilter {
  name?: string;
  isDefault?: boolean;
  excludeDeleted?: boolean;
}

export const cvTemplateService = {
  async getAll(filter?: CVTemplateFilter): Promise<CVTemplate[]> {
    try {
      const params = new URLSearchParams();
      if (filter?.name) params.append("Name", filter.name);
      if (filter?.isDefault !== undefined) params.append("IsDefault", filter.isDefault.toString());
      if (filter?.excludeDeleted !== undefined) params.append("ExcludeDeleted", filter.excludeDeleted ? "true" : "false");

      const url = `/cvtemplate${params.toString() ? `?${params}` : ""}`;
      const response = await axios.get(url);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        throw error.response?.data || { message: "Không thể tải danh sách CV Templates" };
      }
      throw { message: "Lỗi không xác định khi tải dữ liệu CV Templates" };
    }
  },

  async getById(id: number): Promise<CVTemplate> {
    try {
      const response = await axios.get(`/cvtemplate/${id}`);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        throw error.response?.data || { message: "Không thể tải CV Template" };
      }
      throw { message: "Lỗi không xác định khi tải dữ liệu CV Template" };
    }
  },

  async create(payload: CVTemplatePayload): Promise<CVTemplate> {
    try {
      const response = await axios.post("/cvtemplate", payload);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        throw error.response?.data || { message: "Không thể tạo CV Template" };
      }
      throw { message: "Lỗi không xác định khi tạo CV Template" };
    }
  },

  async update(id: number, payload: Partial<CVTemplatePayload>): Promise<CVTemplate> {
    try {
      const response = await axios.put(`/cvtemplate/${id}`, payload);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        throw error.response?.data || { message: "Không thể cập nhật CV Template" };
      }
      throw { message: "Lỗi không xác định khi cập nhật CV Template" };
    }
  },

  async delete(id: number): Promise<void> {
    try {
      await axios.delete(`/cvtemplate/${id}`);
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        throw error.response?.data || { message: "Không thể xóa CV Template" };
      }
      throw { message: "Lỗi không xác định khi xóa CV Template" };
    }
  },
};
