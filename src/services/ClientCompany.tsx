import axios from "../configs/axios";
import { AxiosError } from "axios";

export interface ClientCompany {
  id: number;
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

export interface ClientCompanyPayload {
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
};
