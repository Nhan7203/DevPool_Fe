import axios from "../configs/axios";
import { AxiosError } from "axios";

export interface JobRequest {
  id: number;
  title: string;
  clientCompanyId: number;
  projectId: number;
  jobPositionId: number;
  level: number;
  quantity: number;
  budgetPerMonth?: number | null;
  status: number;
}

export interface JobRequestPayload {
  projectId: number;
  jobPositionId: number;
  applyProcessTemplateId?: number | null;
  clientCompanyCVTemplateId: number;
  title: string;
  description?: string;
  requirements?: string;
  level: number;
  quantity: number;
  budgetPerMonth?: number;
  status: number;
  skillIds?: number[];
}

export interface JobRequestFilter {
  projectId?: number;
  jobPositionId?: number;
  applyProcessTemplateId?: number;
  clientCompanyCVTemplateId?: number;
  title?: string;
  level?: string;
  status?: string;
  excludeDeleted?: boolean;
}

export const jobRequestService = {
  async getAll(filter?: JobRequestFilter) {
    try {
      const params = new URLSearchParams();

      if (filter?.projectId) params.append("ProjectId", filter.projectId.toString());
      if (filter?.jobPositionId) params.append("JobPositionId", filter.jobPositionId.toString());
      if (filter?.applyProcessTemplateId)
        params.append("ApplyProcessTemplateId", filter.applyProcessTemplateId.toString());
      if (filter?.clientCompanyCVTemplateId)
        params.append("ClientCompanyCVTemplateId", filter.clientCompanyCVTemplateId.toString());
      if (filter?.title) params.append("Title", filter.title);
      if (filter?.level) params.append("Level", filter.level);
      if (filter?.status) params.append("Status", filter.status);
      if (filter?.excludeDeleted !== undefined)
        params.append("ExcludeDeleted", filter.excludeDeleted ? "true" : "false");

      const url = `/jobrequest${params.toString() ? `?${params}` : ""}`;
      const response = await axios.get(url);

      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw error.response?.data || { message: "Không thể tải danh sách yêu cầu tuyển dụng" };
      throw { message: "Lỗi không xác định khi tải dữ liệu" };
    }
  },

  async getById(id: number) {
    try {
      const response = await axios.get(`/jobrequest/${id}`);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw error.response?.data || { message: "Không thể tải yêu cầu tuyển dụng" };
      throw { message: "Lỗi không xác định khi tải dữ liệu" };
    }
  },

  async create(payload: JobRequestPayload) {
    try {
      const response = await axios.post("/jobrequest", payload);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw error.response?.data || { message: "Không thể tạo yêu cầu tuyển dụng" };
      throw { message: "Lỗi không xác định khi tạo yêu cầu" };
    }
  },

  async update(id: number, payload: Partial<JobRequestPayload>) {
    try {
      const response = await axios.put(`/jobrequest/${id}`, payload);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw error.response?.data || { message: "Không thể cập nhật yêu cầu tuyển dụng" };
      throw { message: "Lỗi không xác định khi cập nhật yêu cầu" };
    }
  },

  async delete(id: number) {
    try {
      const response = await axios.delete(`/jobrequest/${id}`);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw error.response?.data || { message: "Không thể xóa yêu cầu tuyển dụng" };
      throw { message: "Lỗi không xác định khi xóa yêu cầu tuyển dụng" };
    }
  },
};
