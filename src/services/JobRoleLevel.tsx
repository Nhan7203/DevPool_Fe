import axios from "../configs/axios";
import { AxiosError } from "axios";

export const TalentLevel = {
  Junior: 0,
  Middle: 1,
  Senior: 2,
  Lead: 3
} as const;

export type TalentLevel = typeof TalentLevel[keyof typeof TalentLevel];

export interface JobRoleLevel {
  id: number;
  jobRoleId: number;
  name: string;
  level: TalentLevel;
  description: string;
  minManMonthPrice?: number | null;
  maxManMonthPrice?: number | null;
}

export interface JobRoleLevelPayload {
  jobRoleId: number;
  name: string;
  level: TalentLevel;
  description?: string;
  minManMonthPrice?: number | null;
  maxManMonthPrice?: number | null;
}

export interface JobRoleLevelFilter {
  jobRoleId?: number;
  name?: string;
  level?: TalentLevel;
  excludeDeleted?: boolean;
}

export const jobRoleLevelService = {
  async getAll(filter?: JobRoleLevelFilter) {
    try {
      const params = new URLSearchParams();

      if (filter?.jobRoleId)
        params.append("JobRoleId", filter.jobRoleId.toString());
      if (filter?.name) params.append("Name", filter.name);
      if (filter?.level !== undefined) params.append("Level", filter.level.toString());
      if (filter?.excludeDeleted !== undefined)
        params.append("ExcludeDeleted", filter.excludeDeleted ? "true" : "false");

      const url = `/jobrolelevel${params.toString() ? `?${params}` : ""}`;
      const response = await axios.get(url);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw error.response?.data || {
          message: "Không thể tải danh sách vị trí công việc",
        };
      throw { message: "Lỗi không xác định khi tải dữ liệu" };
    }
  },

  async getById(id: number) {
    try {
      const response = await axios.get(`/jobrolelevel/${id}`);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw error.response?.data || {
          message: "Không thể tải chi tiết vị trí công việc",
        };
      throw { message: "Lỗi không xác định khi tải dữ liệu" };
    }
  },

  async create(payload: JobRoleLevelPayload) {
    try {
      const response = await axios.post("/jobrolelevel", payload);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw error.response?.data || {
          message: "Không thể tạo vị trí công việc mới",
        };
      throw { message: "Lỗi không xác định khi tạo vị trí công việc" };
    }
  },

  async update(id: number, payload: Partial<JobRoleLevelPayload>) {
    try {
      const response = await axios.put(`/jobrolelevel/${id}`, payload);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw error.response?.data || {
          message: "Không thể cập nhật vị trí công việc",
        };
      throw { message: "Lỗi không xác định khi cập nhật" };
    }
  },

  async delete(id: number) {
    try {
      const response = await axios.delete(`/jobrolelevel/${id}`);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw error.response?.data || {
          message: "Không thể xóa vị trí công việc",
        };
      throw { message: "Lỗi không xác định khi xóa vị trí công việc" };
    }
  },
};
