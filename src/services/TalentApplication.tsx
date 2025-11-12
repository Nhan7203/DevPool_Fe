import axios from "../configs/axios";
import { AxiosError } from "axios";
import type { JobRequest } from "./JobRequest";
import type { TalentCV } from "./TalentCV";
import type { User } from "./User";
import type { Talent } from "./Talent";
import type { Project } from "./Project";
import type { ClientCompany } from "./ClientCompany";
import type { ApplyActivity } from "./ApplyActivity";

export interface TalentApplication {
  id: number;
  jobRequestId: number;
  cvId: number;
  submittedBy: string;
  status: string;
  note?: string;
  convertedCVPath?: string | null;
  createdAt: string; // ISO string
  updatedAt?: string | null; // ISO string
}

export interface TalentApplicationCreate {
  jobRequestId: number;
  cvId: number;
  submittedBy: string;
  status?: string; // default "Pending" on server
  note?: string;
  convertedCVPath?: string;
}

export interface TalentApplicationFilter {
  jobRequestId?: number;
  cvId?: number;
  submittedBy?: string;
  status?: string;
  submittedFrom?: string; // ISO string
  submittedTo?: string; // ISO string
  excludeDeleted?: boolean;
}

export interface TalentApplicationStatusUpdate {
  newStatus: string;
  note?: string;
}

export interface TalentApplicationStatusTransitionResult {
  isSuccess: boolean;
  message: string;
  oldStatus?: string | null;
  newStatus?: string | null;
  validationErrors: string[];
  talentStatusUpdated?: boolean;
  contractsCreated?: boolean;
}

export interface TalentApplicationUpdate {
  status?: string;
  note?: string;
  convertedCVPath?: string;
}

// Status Constants
export const TalentApplicationStatusConstants = {
  Interviewing: "Interviewing",
  Offered: "Offered",
  Hired: "Hired",
  Rejected: "Rejected",
  Withdrawn: "Withdrawn",

  AllStatuses: [
    "Interviewing",
    "Offered",
    "Hired",
    "Rejected",
    "Withdrawn"
  ] as const,

  isValidStatus: (status: string): boolean => {
    return TalentApplicationStatusConstants.AllStatuses.includes(status as any);
  },

  AllowedTransitions: {
    Interviewing: ["Offered", "Rejected", "Withdrawn"],
    Offered: ["Hired", "Rejected", "Withdrawn"],
    Hired: [] as string[], // Terminal state
    Rejected: [] as string[], // Terminal state
    Withdrawn: [] as string[] // Terminal state
  },

  isTerminalStatus: (status: string): boolean => {
    return status === TalentApplicationStatusConstants.Hired ||
           status === TalentApplicationStatusConstants.Rejected ||
           status === TalentApplicationStatusConstants.Withdrawn;
  },

  isTransitionAllowed: (fromStatus: string, toStatus: string): boolean => {
    const allowed = TalentApplicationStatusConstants.AllowedTransitions[fromStatus as keyof typeof TalentApplicationStatusConstants.AllowedTransitions];
    return allowed ? allowed.includes(toStatus) : false;
  }
};

export interface TalentApplicationDetailed {
  id: number;
  jobRequestId: number;
  cvId: number;
  submittedBy: string;
  status: string;
  note: string;
  convertedCVPath?: string | null;
  createdAt: string; // ISO string
  updatedAt?: string | null; // ISO string
  
  // Related Navigation Properties
  jobRequest?: JobRequest | null;
  cv?: TalentCV | null; // Note: API returns "CV" but we'll use "cv" for camelCase
  submitter?: User | null;
  
  // Additional Related Data
  talent?: Talent | null;
  project?: Project | null;
  clientCompany?: ClientCompany | null;
  
  // Related Collections
  activities: ApplyActivity[];
  
  // Additional Display Properties
  jobTitle?: string | null;
  companyName?: string | null;
  talentName?: string | null;
  submitterName?: string | null;
}

export interface TalentApplicationsByJobRequestResponse {
  success: boolean;
  message: string;
  data: {
    jobRequestId: number;
    filterStatus: string;
    totalApplications: number;
    applications: TalentApplicationDetailed[];
  };
}

export const talentApplicationService = {
  async getAll(filter?: TalentApplicationFilter) {
    try {
      const params = new URLSearchParams();
      if (filter?.jobRequestId) params.append("JobRequestId", filter.jobRequestId.toString());
      if (filter?.cvId) params.append("CvId", filter.cvId.toString());
      if (filter?.submittedBy) params.append("SubmittedBy", filter.submittedBy);
      if (filter?.status) params.append("Status", filter.status);
      if (filter?.submittedFrom) params.append("SubmittedFrom", filter.submittedFrom);
      if (filter?.submittedTo) params.append("SubmittedTo", filter.submittedTo);
      if (filter?.excludeDeleted !== undefined) params.append("ExcludeDeleted", filter.excludeDeleted ? "true" : "false");

      const url = `/talentapplication${params.toString() ? `?${params}` : ""}`;
      const response = await axios.get(url);
      
      // Ensure response.data is an array
      const data = response.data;
      if (Array.isArray(data)) {
        return data as TalentApplication[];
      } else if (data && Array.isArray(data.data)) {
        // In case API returns { data: [...] }
        return data.data as TalentApplication[];
      } else {
        console.warn("⚠️ Response không phải là mảng:", data);
        return [] as TalentApplication[];
      }
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        console.error("❌ Lỗi khi fetch TalentApplication:", {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          url: error.config?.url
        });
        throw error.response?.data || { message: "Không thể tải danh sách đơn ứng tuyển" };
      }
      throw { message: "Lỗi không xác định khi tải danh sách đơn ứng tuyển" };
    }
  },

  async getById(id: number) {
    try {
      const response = await axios.get(`/talentapplication/${id}`);
      return response.data as TalentApplication;
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw error.response?.data || { message: "Không thể tải thông tin đơn ứng tuyển" };
      throw { message: "Lỗi không xác định khi tải dữ liệu" };
    }
  },

  async getDetailedById(id: number) {
    try {
      const response = await axios.get(`/talentapplication/${id}/detailed`);
      
      // API trả về format: { success: true, message: "...", data: {...} }
      const responseData = response.data;
      
      // Kiểm tra nếu có cấu trúc { success, message, data }
      if (responseData && typeof responseData === 'object' && 'data' in responseData) {
        return responseData.data as TalentApplicationDetailed;
      }
      
      // Nếu không có cấu trúc trên, trả về trực tiếp
      return responseData as TalentApplicationDetailed;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        console.error("❌ Lỗi khi fetch TalentApplicationDetailed:", {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          url: error.config?.url
        });
        throw error.response?.data || { message: "Không thể tải thông tin chi tiết đơn ứng tuyển" };
      }
      throw { message: "Lỗi không xác định khi tải thông tin chi tiết" };
    }
  },

  async create(payload: TalentApplicationCreate) {
    try {
      const response = await axios.post("/talentapplication", payload);
      return response.data as TalentApplication;
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw error.response?.data || { message: "Không thể tạo đơn ứng tuyển" };
      throw { message: "Lỗi không xác định khi tạo đơn ứng tuyển" };
    }
  },

  async update(id: number, payload: TalentApplicationUpdate) {
    try {
      const response = await axios.put(`/talentapplication/${id}`, payload);
      return response.data as TalentApplication;
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw error.response?.data || { message: "Không thể cập nhật đơn ứng tuyển" };
      throw { message: "Lỗi không xác định khi cập nhật đơn ứng tuyển" };
    }
  },

  async updateStatus(id: number, payload: TalentApplicationStatusUpdate) {
    try {
      const response = await axios.patch(`/talentapplication/${id}/change-status`, payload);
      return response.data as TalentApplicationStatusTransitionResult;
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw error.response?.data || { message: "Không thể cập nhật trạng thái đơn ứng tuyển" };
      throw { message: "Lỗi không xác định khi cập nhật trạng thái" };
    }
  },

  async getByJobRequest(jobRequestId: number, status?: string) {
    try {
      const params = new URLSearchParams();
      if (status) params.append("status", status);

      const url = `/talentapplication/by-jobrequest/${jobRequestId}${params.toString() ? `?${params}` : ""}`;
      const response = await axios.get(url);

      const data = response.data as TalentApplicationsByJobRequestResponse;
      if (!data || !data.success) {
        console.warn("⚠️ Response getByJobRequest không thành công:", response.data);
      }
      return data;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        console.error("❌ Lỗi khi gọi getByJobRequest:", {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
        });
        throw error.response?.data || { message: "Không thể tải danh sách hồ sơ ứng tuyển theo job request" };
      }
      throw { message: "Lỗi không xác định khi tải danh sách hồ sơ ứng tuyển theo job request" };
    }
  },
};

