import axios from "../configs/axios";
import { AxiosError } from "axios";
import { WorkingMode } from "../types/WorkingMode";

export interface Talent {
  id: number;
  currentPartnerId: number;
  userId: string;
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth?: string; // DateTime as ISO string
  locationId?: number;
  workingMode: WorkingMode;
  githubUrl: string;
  portfolioUrl: string;
  status: string;
}

export interface TalentFilter {
  currentPartnerId?: number;
  fullName?: string;
  email?: string;
  locationId?: number;
  workingMode?: WorkingMode;
  status?: string;
  excludeDeleted?: boolean;
}

export interface TalentCreate {
  currentPartnerId: number;
  userId: string;
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth?: string; // DateTime as ISO string
  locationId?: number;
  workingMode: WorkingMode;
  githubUrl: string;
  portfolioUrl: string;
  status: string;
}

// Interfaces for TalentWithRelatedDataCreateModel
export interface TalentSkillCreateModel {
  skillId: number;
  level: string;
  yearsExp: number;
}

export interface TalentWorkExperienceCreateModel {
  talentCVId?: number; // Optional when creating with initialCV - backend will assign from initialCV
  company: string;
  position: string;
  startDate: string; // DateTime as ISO string
  endDate?: string; // DateTime as ISO string
  description: string;
}

export interface TalentProjectCreateModel {
  talentCVId?: number; // Optional when creating with initialCV - backend will assign from initialCV
  projectName: string;
  position: string;
  technologies: string;
  description: string;
}

export interface TalentCertificateCreateModel {
  certificateTypeId: number;
  certificateName: string;
  certificateDescription?: string;
  issuedDate?: string; // DateTime as ISO string
  isVerified: boolean;
  imageUrl: string;
}

export interface TalentJobRoleLevelCreateModel {
  jobRoleLevelId: number;
  yearsOfExp: number;
  ratePerMonth?: number;
}

export interface TalentCVCreateModel {
  jobRoleId: number;
  version: number;
  cvFileUrl: string;
  isActive: boolean;
  summary: string;
  isGeneratedFromTemplate: boolean;
  sourceTemplateId?: number;
}

export interface TalentWithRelatedDataCreateModel {
  // Thông tin cơ bản của Talent
  currentPartnerId: number;
  userId?: string;
  fullName: string;
  email: string;
  phone?: string;
  dateOfBirth?: string; // DateTime as ISO string
  locationId?: number;
  workingMode: WorkingMode;
  githubUrl?: string;
  portfolioUrl?: string;
  status?: string;

  // Các dữ liệu liên quan (optional)
  initialCV?: TalentCVCreateModel;
  skills?: TalentSkillCreateModel[];
  workExperiences?: TalentWorkExperienceCreateModel[];
  projects?: TalentProjectCreateModel[];
  certificates?: TalentCertificateCreateModel[];
  jobRoleLevels?: TalentJobRoleLevelCreateModel[];
}

export interface TalentStatusUpdateModel {
  newStatus: string;
  notes?: string;
}

export interface TalentStatusTransitionResult {
  isSuccess: boolean;
  message: string;
  previousStatus?: string;
  newStatus?: string;
  validationErrors?: string[];
}

export const talentService = {
  async getAll(filter?: TalentFilter) {
    try {
      const params = new URLSearchParams();
      if (filter?.currentPartnerId) params.append("CurrentPartnerId", filter.currentPartnerId.toString());
      if (filter?.fullName) params.append("FullName", filter.fullName);
      if (filter?.email) params.append("Email", filter.email);
      if (filter?.locationId) params.append("LocationId", filter.locationId.toString());
      if (filter?.workingMode !== undefined) params.append("WorkingMode", filter.workingMode.toString());
      if (filter?.status) params.append("Status", filter.status);
      if (filter?.excludeDeleted !== undefined) params.append("ExcludeDeleted", filter.excludeDeleted.toString());
      const url = `/talent${params.toString() ? `?${params}` : ""}`;
      const response = await axios.get(url);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw error.response?.data || { message: "Failed to fetch talents" };
      throw { message: "Unexpected error occurred" };
    }
  },

  async getById(id: number) {
    try {
      const response = await axios.get(`/talent/${id}`);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw error.response?.data || { message: "Failed to fetch talent details" };
      throw { message: "Unexpected error occurred" };
    }
  },

  async create(payload: TalentCreate) {
    try {
      const response = await axios.post("/talent", payload);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw error.response?.data || { message: "Failed to create new talent" };
      throw { message: "Unexpected error occurred during creation" };
    }
  },

  async createWithRelatedData(payload: TalentWithRelatedDataCreateModel) {
    try {
      const response = await axios.post("/talent/with-related-data", payload);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw error.response?.data || { message: "Failed to create talent with related data" };
      throw { message: "Unexpected error occurred during creation with related data" };
    }
  },

  async update(id: number, payload: Partial<TalentCreate>) {
    try {
      const response = await axios.put(`/talent/${id}`, payload);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw error.response?.data || { message: "Failed to update talent" };
      throw { message: "Unexpected error occurred" };
    }
  },

  async deleteById(id: number) {
    try {
      const response = await axios.delete(`/talent/${id}`);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw error.response?.data || { message: "Failed to delete talent" };
      throw { message: "Unexpected error occurred" };
    }
  },

  async changeStatus(id: number, payload: TalentStatusUpdateModel) {
    try {
      const response = await axios.patch(`/talent/${id}/change-status`, payload);
      return response.data as TalentStatusTransitionResult;
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw error.response?.data || { message: "Failed to change talent status" };
      throw { message: "Unexpected error occurred during status change" };
    }
  },

  async getByClientOrProject(clientCompanyId?: number, projectId?: number) {
    try {
      if (!clientCompanyId && !projectId) {
        throw { message: "Either clientCompanyId or projectId must be provided" };
      }

      const params = new URLSearchParams();
      if (clientCompanyId) params.append("clientCompanyId", clientCompanyId.toString());
      if (projectId) params.append("projectId", projectId.toString());

      const url = `/talent/by-client-or-project${params.toString() ? `?${params}` : ""}`;
      const response = await axios.get(url);
      
      // Backend trả về format { success, message, data }
      if (response.data?.success && response.data?.data) {
        return response.data.data;
      }
      
      // Fallback nếu format khác
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        const errorData = error.response?.data;
        if (errorData?.message) {
          throw errorData;
        }
        throw { message: "Failed to fetch talents by client or project" };
      }
      throw error || { message: "Unexpected error occurred" };
    }
  },
};