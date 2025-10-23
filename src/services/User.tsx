import axios from "../configs/axios";
import { AxiosError } from "axios";

export interface User {
  id: string;
  email: string;
  fullName: string;
  phoneNumber?: string;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
  roles: string[];
}

export interface UserCreateModel {
  email: string;
  fullName: string;
  phoneNumber?: string;
  password: string;
  role: string;
}

export interface UserUpdateModel {
  fullName: string;
  phoneNumber?: string;
}

export interface UserUpdateRoleModel {
  role: string;
}

export interface UserFilterModel {
  name?: string;
  role?: string;
  isActive?: boolean;
  excludeDeleted?: boolean;
  pageNumber?: number;
  pageSize?: number;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export const userService = {
  async getAll(filter?: UserFilterModel): Promise<PagedResult<User>> {
    try {
      const params = new URLSearchParams();

      if (filter?.name)
        params.append("Name", filter.name);
      if (filter?.role)
        params.append("Role", filter.role);
      if (filter?.isActive !== undefined)
        params.append("IsActive", filter.isActive ? "true" : "false");
      if (filter?.excludeDeleted !== undefined)
        params.append("ExcludeDeleted", filter.excludeDeleted ? "true" : "false");
      if (filter?.pageNumber)
        params.append("PageNumber", filter.pageNumber.toString());
      if (filter?.pageSize)
        params.append("PageSize", filter.pageSize.toString());

      const url = `/user${params.toString() ? `?${params}` : ""}`;
      const response = await axios.get(url);

      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw error.response?.data || { message: "Không thể tải danh sách người dùng" };
      throw { message: "Lỗi không xác định khi tải dữ liệu" };
    }
  },

  async getById(id: string): Promise<User> {
    try {
      const response = await axios.get(`/user/${id}`);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw error.response?.data || { message: "Không thể tải thông tin người dùng" };
      throw { message: "Lỗi không xác định khi tải dữ liệu" };
    }
  },

  async create(payload: UserCreateModel): Promise<User> {
    try {
      const response = await axios.post("/user", payload);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw error.response?.data || { message: "Không thể tạo người dùng mới" };
      throw { message: "Lỗi không xác định khi tạo người dùng" };
    }
  },

  async update(id: string, payload: UserUpdateModel): Promise<User> {
    try {
      const response = await axios.put(`/user/${id}`, payload);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw error.response?.data || { message: "Không thể cập nhật người dùng" };
      throw { message: "Lỗi không xác định khi cập nhật người dùng" };
    }
  },

  async updateRole(id: string, payload: UserUpdateRoleModel): Promise<User> {
    try {
      const response = await axios.put(`/user/${id}/role`, payload);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw error.response?.data || { message: "Không thể cập nhật vai trò người dùng" };
      throw { message: "Lỗi không xác định khi cập nhật vai trò" };
    }
  },

  async delete(id: string): Promise<void> {
    try {
      await axios.delete(`/user/${id}`);
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw error.response?.data || { message: "Không thể xóa người dùng" };
      throw { message: "Lỗi không xác định khi xóa người dùng" };
    }
  },

  async resetPassword(id: string, newPassword: string): Promise<void> {
    try {
      await axios.put(`/user/${id}/reset-password`, { password: newPassword });
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw error.response?.data || { message: "Không thể đặt lại mật khẩu" };
      throw { message: "Lỗi không xác định khi đặt lại mật khẩu" };
    }
  },

};
