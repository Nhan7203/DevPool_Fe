import axios from "../configs/axios";
import { AxiosError } from "axios";

export const WorkingMode = {
  None: 0,
  Onsite: 1,
  Remote: 2,
  Hybrid: 4,
  Flexible: 8,

} as const;

export type WorkingMode = typeof WorkingMode[keyof typeof WorkingMode];

export const JobRequestStatus = {
  Pending: 0,
  Approved: 1,
  Closed: 2,
  Rejected: 3
} as const;

export type JobRequestStatus = typeof JobRequestStatus[keyof typeof JobRequestStatus];

export interface JobSkill {
  id: number;
  skillId: number;
  skillName: string;
  isRequired: boolean;
}

export interface JobRequest {
  id: number;
  projectId: number;
  jobRoleLevelId: number;
  applyProcessTemplateId?: number | null;
  clientCompanyCVTemplateId: number;
  title: string;
  description: string;
  requirements: string;
  quantity: number;
  locationId?: number | null;
  workingMode: WorkingMode;
  budgetPerMonth?: number | null;
  status: JobRequestStatus;
  jobSkills: JobSkill[];
}

export interface JobRequestPayload {
  projectId: number;
  jobRoleLevelId: number;
  applyProcessTemplateId?: number | null;
  clientCompanyCVTemplateId: number;
  title: string;
  description?: string;
  requirements?: string;
  quantity: number;
  locationId?: number | null;
  workingMode: WorkingMode;
  budgetPerMonth?: number | null;
  status: JobRequestStatus;
  skillIds: number[];
}

export interface JobRequestFilter {
  projectId?: number;
  jobRoleLevelId?: number;
  applyProcessTemplateId?: number;
  clientCompanyCVTemplateId?: number;
  title?: string;
  locationId?: number;
  workingMode?: WorkingMode;
  status?: JobRequestStatus;
  excludeDeleted?: boolean;
}

export const jobRequestService = {
  async getAll(filter?: JobRequestFilter) {
    try {
      const params = new URLSearchParams();

      if (filter?.projectId) params.append("ProjectId", filter.projectId.toString());
      if (filter?.jobRoleLevelId) params.append("JobRoleLevelId", filter.jobRoleLevelId.toString());
      if (filter?.applyProcessTemplateId)
        params.append("ApplyProcessTemplateId", filter.applyProcessTemplateId.toString());
      if (filter?.clientCompanyCVTemplateId)
        params.append("ClientCompanyCVTemplateId", filter.clientCompanyCVTemplateId.toString());
      if (filter?.title) params.append("Title", filter.title);
      if (filter?.locationId) params.append("LocationId", filter.locationId.toString());
      if (filter?.workingMode !== undefined) params.append("WorkingMode", filter.workingMode.toString());
      if (filter?.status !== undefined) params.append("Status", filter.status.toString());
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
