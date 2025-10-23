import axios from "../configs/axios";
import { AxiosError } from "axios";

export interface SkillGroup {
  id: number;
  name: string;
  description?: string;
}

export interface SkillGroupCreateModel {
  name: string;
  description?: string;
}

export interface SkillGroupFilterModel {
  name?: string;
  excludeDeleted?: boolean;
}

export const skillGroupService = {
  async getAll(filter?: SkillGroupFilterModel) {
    try {
      const params = new URLSearchParams();

      if (filter?.name)
        params.append("Name", filter.name);
      if (filter?.excludeDeleted !== undefined)
        params.append("ExcludeDeleted", filter.excludeDeleted ? "true" : "false");

      const url = `/skillgroup${params.toString() ? `?${params}` : ""}`;
      const response = await axios.get(url);

      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw error.response?.data || { message: "Không thể tải danh sách nhóm kỹ năng" };
      throw { message: "Lỗi không xác định khi tải dữ liệu" };
    }
  },

  async getById(id: number) {
    try {
      const response = await axios.get(`/skillgroup/${id}`);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw error.response?.data || { message: "Không thể tải thông tin nhóm kỹ năng" };
      throw { message: "Lỗi không xác định khi tải dữ liệu" };
    }
  },

  async create(payload: SkillGroupCreateModel) {
    try {
      const response = await axios.post("/skillgroup", payload);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw error.response?.data || { message: "Không thể tạo nhóm kỹ năng mới" };
      throw { message: "Lỗi không xác định khi tạo nhóm kỹ năng" };
    }
  },

  async update(id: number, payload: Partial<SkillGroupCreateModel>) {
    try {
      const response = await axios.put(`/skillgroup/${id}`, payload);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw error.response?.data || { message: "Không thể cập nhật nhóm kỹ năng" };
      throw { message: "Lỗi không xác định khi cập nhật nhóm kỹ năng" };
    }
  },

  async delete(id: number) {
    try {
      const response = await axios.delete(`/skillgroup/${id}`);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw error.response?.data || { message: "Không thể xóa nhóm kỹ năng" };
      throw { message: "Lỗi không xác định khi xóa nhóm kỹ năng" };
    }
  },
};
