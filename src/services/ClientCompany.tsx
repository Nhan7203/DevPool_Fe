import axios from "../configs/axios";
import { AxiosError } from "axios";
import type { Project } from "./Project";
import type { ClientCompanyTemplate } from "./ClientCompanyTemplate";
import type { ClientJobRoleLevel } from "./ClientJobRoleLevel";

export interface ClientCompany {
  id: number;
  code: string;
  name: string;
  taxCode?: string;
  contactPerson: string;
  position?: string;
  email: string;
  phone?: string;
  address?: string;
  createdAt: string;
  updatedAt?: string;
  isDeleted: boolean;
}

export interface ClientCompanyDetailedModel {
  id: number;
  code: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  contactPerson?: string | null;
  position?: string | null;
  taxCode?: string | null;
  createdAt: string;
  updatedAt: string;
  // Related Collections
  projects: Project[];
  assignedCVTemplates: ClientCompanyTemplate[];
  jobRoleLevels: ClientJobRoleLevel[];
}

export interface ClientCompanyPayload {
  code: string;
  name: string;
  taxCode?: string;
  contactPerson: string;
  position?: string;
  email: string;
  phone?: string;
  address?: string;
}

export interface ClientCompanyFilter {
  name?: string;
  email?: string;
  contactPerson?: string;
  excludeDeleted?: boolean;
}

export const clientCompanyService = {
  async getAll(filter?: ClientCompanyFilter) {
    try {
      const params = new URLSearchParams();

      if (filter?.name) params.append("Name", filter.name);
      if (filter?.email) params.append("Email", filter.email);
      if (filter?.contactPerson) params.append("ContactPerson", filter.contactPerson);
      if (filter?.excludeDeleted !== undefined)
        params.append("ExcludeDeleted", filter.excludeDeleted ? "true" : "false");

      const url = `/clientcompany${params.toString() ? `?${params}` : ""}`;
      const response = await axios.get(url);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw (
          error.response?.data || { message: "Không thể tải danh sách công ty khách hàng" }
        );
      throw { message: "Lỗi không xác định khi tải danh sách công ty" };
    }
  },

  async getById(id: number) {
    try {
      const response = await axios.get(`/clientcompany/${id}`);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw (
          error.response?.data || { message: "Không thể tải thông tin công ty khách hàng" }
        );
      throw { message: "Lỗi không xác định khi tải thông tin công ty" };
    }
  },

  async create(payload: ClientCompanyPayload) {
    try {
      const response = await axios.post("/clientcompany", payload);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw (
          error.response?.data || { message: "Không thể tạo công ty khách hàng mới" }
        );
      throw { message: "Lỗi không xác định khi tạo công ty khách hàng" };
    }
  },

  async update(id: number, payload: Partial<ClientCompanyPayload>) {
    try {
      const response = await axios.put(`/clientcompany/${id}`, payload);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw (
          error.response?.data || { message: "Không thể cập nhật thông tin công ty khách hàng" }
        );
      throw { message: "Lỗi không xác định khi cập nhật công ty khách hàng" };
    }
  },

  async delete(id: number) {
    try {
      const response = await axios.delete(`/clientcompany/${id}`);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw (
          error.response?.data || { message: "Không thể xóa công ty khách hàng" }
        );
      throw { message: "Lỗi không xác định khi xóa công ty khách hàng" };
    }
  },

  async getDetailedById(id: number): Promise<ClientCompanyDetailedModel> {
    try {
      const response = await axios.get(`/clientcompany/${id}/detailed`);
      // API trả về { success, message, data }
      return response.data?.data || response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw (
          error.response?.data || { message: "Không thể tải thông tin chi tiết công ty khách hàng" }
        );
      throw { message: "Lỗi không xác định khi tải thông tin chi tiết công ty khách hàng" };
    }
  },

  async suggestCode(name: string): Promise<{ success: boolean; suggestedCode: string }> {
    try {
      const params = new URLSearchParams();
      params.append("name", name);
      const response = await axios.get(`/clientcompany/suggest-code?${params.toString()}`);
      // API trả về { success, suggestedCode }
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw (
          error.response?.data || { message: "Không thể tạo gợi ý code" }
        );
      throw { message: "Lỗi không xác định khi tạo gợi ý code" };
    }
  },

  async checkCodeUnique(code: string, excludeId?: number): Promise<{ success: boolean; isUnique: boolean }> {
    try {
      const params = new URLSearchParams();
      params.append("code", code);
      if (excludeId !== undefined) {
        params.append("excludeId", excludeId.toString());
      }
      const response = await axios.get(`/clientcompany/check-code-unique?${params.toString()}`);
      // API trả về { success, isUnique }
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw (
          error.response?.data || { message: "Không thể kiểm tra tính duy nhất của code" }
        );
      throw { message: "Lỗi không xác định khi kiểm tra code" };
    }
  },
};
