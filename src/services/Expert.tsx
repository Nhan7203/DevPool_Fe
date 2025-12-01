import axios from "../configs/axios";
import { AxiosError } from "axios";

export interface Expert {
  id: number;
  name: string;
  email?: string | null;
  phone?: string | null;
  isPartnerRepresentative: boolean;
  partnerId?: number | null;
  partnerName?: string | null;
  company?: string | null;
  specialization?: string | null;
  createdAt: string; // ISO
  updatedAt?: string | null;
  isDeleted: boolean;
}

export interface ExpertFilter {
  name?: string;
  email?: string;
  isPartnerRepresentative?: boolean;
  partnerId?: number;
  excludeDeleted?: boolean;
}

export interface ExpertCreate {
  name: string;
  email?: string | null;
  phone?: string | null;
  isPartnerRepresentative?: boolean;
  partnerId?: number | null;
  company?: string | null;
  specialization?: string | null;
}

export interface ExpertUpdate {
  name?: string;
  email?: string | null;
  phone?: string | null;
  isPartnerRepresentative?: boolean;
  partnerId?: number | null;
  company?: string | null;
  specialization?: string | null;
}

export interface ExpertSkillGroup {
  id: number;
  expertId: number;
  expertName?: string | null;
  skillGroupId: number;
  skillGroupName?: string | null;
  assignedAt: string; // ISO
  isActive: boolean;
  createdAt: string; // ISO
  isDeleted: boolean;
}

export interface ExpertSkillGroupCreate {
  expertId: number;
  skillGroupId: number;
}

export const expertService = {
  async getAll(filter?: ExpertFilter): Promise<Expert[]> {
    try {
      const params = new URLSearchParams();

      if (filter?.name) params.append("Name", filter.name);
      if (filter?.email) params.append("Email", filter.email);
      if (filter?.isPartnerRepresentative !== undefined)
        params.append(
          "IsPartnerRepresentative",
          filter.isPartnerRepresentative ? "true" : "false"
        );
      if (filter?.partnerId) params.append("PartnerId", filter.partnerId.toString());
      if (filter?.excludeDeleted !== undefined)
        params.append("ExcludeDeleted", filter.excludeDeleted ? "true" : "false");

      const url = `/expert${params.toString() ? `?${params}` : ""}`;
      const response = await axios.get(url);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw error.response?.data || { message: "Không thể tải danh sách expert" };
      throw { message: "Lỗi không xác định khi tải dữ liệu expert" };
    }
  },

  async getById(id: number): Promise<Expert> {
    try {
      const response = await axios.get(`/expert/${id}`);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw error.response?.data || { message: "Không thể tải thông tin expert" };
      throw { message: "Lỗi không xác định khi tải dữ liệu expert" };
    }
  },

  async create(payload: ExpertCreate): Promise<Expert> {
    try {
      const response = await axios.post("/expert", payload);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw error.response?.data || { message: "Không thể tạo expert mới" };
      throw { message: "Lỗi không xác định khi tạo expert" };
    }
  },

  async update(id: number, payload: ExpertUpdate): Promise<void> {
    try {
      await axios.put(`/expert/${id}`, payload);
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw error.response?.data || { message: "Không thể cập nhật expert" };
      throw { message: "Lỗi không xác định khi cập nhật expert" };
    }
  },

  async delete(id: number): Promise<void> {
    try {
      await axios.delete(`/expert/${id}`);
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw error.response?.data || { message: "Không thể xóa expert" };
      throw { message: "Lỗi không xác định khi xóa expert" };
    }
  },

  // Skill groups of expert
  async getSkillGroups(expertId: number): Promise<ExpertSkillGroup[]> {
    try {
      const response = await axios.get(`/expert/${expertId}/skill-groups`);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw (
          error.response?.data || { message: "Không thể tải danh sách nhóm kỹ năng của expert" }
        );
      throw { message: "Lỗi không xác định khi tải nhóm kỹ năng của expert" };
    }
  },

  async assignSkillGroup(
    expertId: number,
    payload: ExpertSkillGroupCreate
  ): Promise<ExpertSkillGroup> {
    try {
      const response = await axios.post(`/expert/${expertId}/skill-groups`, payload);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw (
          error.response?.data || { message: "Không thể gán nhóm kỹ năng cho expert" }
        );
      throw { message: "Lỗi không xác định khi gán nhóm kỹ năng cho expert" };
    }
  },

  async unassignSkillGroup(expertId: number, skillGroupId: number): Promise<void> {
    try {
      await axios.delete(`/expert/${expertId}/skill-groups/${skillGroupId}`);
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw (
          error.response?.data || { message: "Không thể hủy gán nhóm kỹ năng của expert" }
        );
      throw { message: "Lỗi không xác định khi hủy gán nhóm kỹ năng của expert" };
    }
  },
};


