import axios from "../configs/axios";
import { AxiosError } from "axios";

// Status Constants
export const TalentAssignmentStatusConstants = {
  Active: "Active",
  Completed: "Completed",
  Terminated: "Terminated",
  Inactive: "Inactive",

  AllStatuses: [
    "Active",
    "Completed",
    "Terminated",
    "Inactive"
  ] as const,

  isValidStatus: (status: string): boolean => {
    return TalentAssignmentStatusConstants.AllStatuses.includes(status as any);
  },

  AllowedTransitions: {
    Active: ["Completed", "Terminated", "Inactive"],
    Completed: [] as string[], // Terminal state
    Terminated: [] as string[], // Terminal state
    Inactive: ["Active"] // Can reactivate
  },

  isTerminalStatus: (status: string): boolean => {
    return status === TalentAssignmentStatusConstants.Completed ||
           status === TalentAssignmentStatusConstants.Terminated;
  },

  isTransitionAllowed: (fromStatus: string, toStatus: string): boolean => {
    const allowed = TalentAssignmentStatusConstants.AllowedTransitions[fromStatus as keyof typeof TalentAssignmentStatusConstants.AllowedTransitions];
    return allowed ? allowed.includes(toStatus) : false;
  }
};

// Model for GET
export interface TalentAssignmentModel {
  id: number;
  talentId: number;
  projectId: number;
  partnerId: number;
  talentApplicationId?: number | null;
  startDate: string; // ISO string
  endDate?: string | null; // ISO string
  commitmentFileUrl?: string | null;
  status: string;
  notes?: string | null;
  createdAt: string; // ISO string
  updatedAt?: string | null; // ISO string
}

// Model for CREATE
export interface TalentAssignmentCreateModel {
  talentId: number;
  projectId: number;
  partnerId: number;
  talentApplicationId?: number | null;
  startDate: string; // ISO string
  endDate?: string | null; // ISO string
  commitmentFileUrl?: string | null;
  status?: string; // Default: "Active"
  notes?: string | null;
}

// Model for EXTEND
export interface TalentAssignmentExtendModel {
  endDate: string; // ISO string
  commitmentFileUrl?: string | null;
  notes?: string | null;
}

// Model for UPDATE
export interface TalentAssignmentUpdateModel {
  endDate?: string | null; // ISO string
  commitmentFileUrl?: string | null;
  status?: string | null;
  notes?: string | null;
}

// Filter interface
export interface TalentAssignmentFilter {
  talentId?: number;
  projectId?: number;
  partnerId?: number;
  talentApplicationId?: number;
  status?: string;
  startDateFrom?: string; // ISO string
  startDateTo?: string; // ISO string
  endDateFrom?: string; // ISO string
  endDateTo?: string; // ISO string
  excludeDeleted?: boolean;
}

export const talentAssignmentService = {
  async getAll(filter?: TalentAssignmentFilter) {
    try {
      const params = new URLSearchParams();
      
      if (filter?.talentId)
        params.append("TalentId", filter.talentId.toString());
      if (filter?.projectId)
        params.append("ProjectId", filter.projectId.toString());
      if (filter?.partnerId)
        params.append("PartnerId", filter.partnerId.toString());
      if (filter?.talentApplicationId)
        params.append("TalentApplicationId", filter.talentApplicationId.toString());
      if (filter?.status)
        params.append("Status", filter.status);
      if (filter?.startDateFrom)
        params.append("StartDateFrom", filter.startDateFrom);
      if (filter?.startDateTo)
        params.append("StartDateTo", filter.startDateTo);
      if (filter?.endDateFrom)
        params.append("EndDateFrom", filter.endDateFrom);
      if (filter?.endDateTo)
        params.append("EndDateTo", filter.endDateTo);
      if (filter?.excludeDeleted !== undefined)
        params.append("ExcludeDeleted", filter.excludeDeleted ? "true" : "false");

      const url = `/talentassignment${params.toString() ? `?${params}` : ""}`;
      const response = await axios.get(url);
      
      // Ensure response.data is an array
      const data = response.data;
      if (Array.isArray(data)) {
        return data as TalentAssignmentModel[];
      } else if (data && Array.isArray(data.data)) {
        return data.data as TalentAssignmentModel[];
      } else {
        console.warn("⚠️ Response không phải là mảng:", data);
        return [] as TalentAssignmentModel[];
      }
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        console.error("❌ Lỗi khi fetch TalentAssignment:", {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          url: error.config?.url
        });
        throw error.response?.data || { message: "Không thể tải danh sách phân công nhân sự" };
      }
      throw { message: "Lỗi không xác định khi tải danh sách phân công nhân sự" };
    }
  },

  async getById(id: number) {
    try {
      const response = await axios.get(`/talentassignment/${id}`);
      return response.data as TalentAssignmentModel;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        throw error.response?.data || { message: "Không thể tải thông tin phân công nhân sự" };
      }
      throw { message: "Lỗi không xác định khi tải dữ liệu" };
    }
  },

  async create(payload: TalentAssignmentCreateModel) {
    try {
      const response = await axios.post("/talentassignment", payload);
      return response.data as TalentAssignmentModel;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        throw error.response?.data || { message: "Không thể tạo phân công nhân sự" };
      }
      throw { message: "Lỗi không xác định khi tạo phân công nhân sự" };
    }
  },

  async update(id: number, payload: TalentAssignmentUpdateModel) {
    try {
      const response = await axios.put(`/talentassignment/${id}`, payload);
      return response.data as TalentAssignmentModel;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        throw error.response?.data || { message: "Không thể cập nhật phân công nhân sự" };
      }
      throw { message: "Lỗi không xác định khi cập nhật phân công nhân sự" };
    }
  },

  async extend(id: number, payload: TalentAssignmentExtendModel) {
    try {
      const response = await axios.patch(`/talentassignment/${id}/extend`, payload);
      return response.data as TalentAssignmentModel;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        throw error.response?.data || { message: "Không thể gia hạn phân công nhân sự" };
      }
      throw { message: "Lỗi không xác định khi gia hạn phân công nhân sự" };
    }
  },

  async getActiveByProject(projectId: number) {
    try {
      const response = await axios.get(`/talentassignment/project/${projectId}/active`);
      const data = response.data;
      if (Array.isArray(data)) {
        return data as TalentAssignmentModel[];
      } else if (data && Array.isArray(data.data)) {
        return data.data as TalentAssignmentModel[];
      } else {
        console.warn("⚠️ Response không phải là mảng:", data);
        return [] as TalentAssignmentModel[];
      }
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        throw error.response?.data || { message: "Không thể tải danh sách phân công đang hoạt động" };
      }
      throw { message: "Lỗi không xác định khi tải danh sách phân công đang hoạt động" };
    }
  },
};

