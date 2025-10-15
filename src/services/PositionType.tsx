import axios from "../configs/axios";
import { AxiosError } from "axios";

export interface PositionType {
  id: number;
  name: string;
  description?: string | null;
}

export interface PositionTypeFilter {
  name?: string;
  excludeDeleted?: boolean;
}

export interface PositionTypeCreatePayload {
  name: string;
  description?: string;
}

export const positionTypeService = {
  async getAll(filter?: PositionTypeFilter): Promise<PositionType[]> {
    try {
      const params = new URLSearchParams();

      if (filter?.name) params.append("Name", filter.name);
      if (filter?.excludeDeleted !== undefined)
        params.append("ExcludeDeleted", filter.excludeDeleted ? "true" : "false");

      const url = `/positiontype${params.toString() ? `?${params}` : ""}`;
      const response = await axios.get(url);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw error.response?.data || { message: "Không thể tải danh sách loại vị trí" };
      throw { message: "Lỗi không xác định khi tải dữ liệu" };
    }
  },

  async getById(id: number): Promise<PositionType> {
    try {
      const response = await axios.get(`/positiontype/${id}`);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw error.response?.data || { message: "Không thể tải loại vị trí" };
      throw { message: "Lỗi không xác định khi tải dữ liệu" };
    }
  },

  async create(payload: PositionTypeCreatePayload): Promise<PositionType> {
    try {
      const response = await axios.post("/positiontype", payload);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw error.response?.data || { message: "Không thể tạo loại vị trí" };
      throw { message: "Lỗi không xác định khi tạo loại vị trí" };
    }
  },

  async update(id: number, payload: Partial<PositionTypeCreatePayload>): Promise<PositionType> {
    try {
      const response = await axios.put(`/positiontype/${id}`, payload);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw error.response?.data || { message: "Không thể cập nhật loại vị trí" };
      throw { message: "Lỗi không xác định khi cập nhật loại vị trí" };
    }
  },

  async delete(id: number): Promise<void> {
    try {
      await axios.delete(`/positiontype/${id}`);
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw error.response?.data || { message: "Không thể xóa loại vị trí" };
      throw { message: "Lỗi không xác định khi xóa loại vị trí" };
    }
  },
};
