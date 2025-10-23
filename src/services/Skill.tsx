import axios from "../configs/axios";
import { AxiosError } from "axios";

export interface Skill {
  id: number;
  skillGroupId: number;
  name: string;
  description?: string;
}

export interface SkillCreateModel {
  skillGroupId: number;
  name: string;
  description?: string;
}

export interface SkillFilterModel {
  name?: string;
  skillGroupId?: number;
  excludeDeleted?: boolean;
}

export const skillService = {
  async getAll(filter?: SkillFilterModel) {
    try {
      const params = new URLSearchParams();

      if (filter?.skillGroupId)
        params.append("SkillGroupId", filter.skillGroupId.toString());
      if (filter?.name)
        params.append("Name", filter.name);
      if (filter?.excludeDeleted !== undefined)
        params.append("ExcludeDeleted", filter.excludeDeleted ? "true" : "false");

      const url = `/skill${params.toString() ? `?${params}` : ""}`;
      const response = await axios.get(url);

      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw error.response?.data || { message: "Không thể tải danh sách kỹ năng" };
      throw { message: "Lỗi không xác định khi tải dữ liệu" };
    }
  },

  async getById(id: number) {
    try {
      const response = await axios.get(`/skill/${id}`);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw error.response?.data || { message: "Không thể tải thông tin kỹ năng" };
      throw { message: "Lỗi không xác định khi tải dữ liệu" };
    }
  },

  async create(payload: SkillCreateModel) {
    try {
      const response = await axios.post("/skill", payload);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw error.response?.data || { message: "Không thể tạo kỹ năng mới" };
      throw { message: "Lỗi không xác định khi tạo kỹ năng" };
    }
  },

  async update(id: number, payload: Partial<SkillCreateModel>) {
    try {
      const response = await axios.put(`/skill/${id}`, payload);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw error.response?.data || { message: "Không thể cập nhật kỹ năng" };
      throw { message: "Lỗi không xác định khi cập nhật kỹ năng" };
    }
  },

  async delete(id: number) {
    try {
      const response = await axios.delete(`/skill/${id}`);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw error.response?.data || { message: "Không thể xóa kỹ năng" };
      throw { message: "Lỗi không xác định khi xóa kỹ năng" };
    }
  },
};
