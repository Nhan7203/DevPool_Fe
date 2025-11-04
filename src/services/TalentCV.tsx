import axios from "../configs/axios";
import { AxiosError } from "axios";

export interface TalentCV {
  id: number;
  talentId: number;
  jobRoleId: number;
  versionName: string;
  cvFileUrl: string;
  isActive: boolean;
  summary: string;
  isGeneratedFromTemplate: boolean;
  sourceTemplateId?: number;
}

export interface TalentCVFilter {
  talentId?: number;
  jobRoleId?: number; 
  isActive?: boolean;
  isGeneratedFromTemplate?: boolean;
  excludeDeleted?: boolean;
}

export interface TalentCVCreate {
  talentId: number;
  jobRoleId: number;
  versionName: string;
  cvFileUrl: string;
  isActive: boolean;
  summary: string;
  isGeneratedFromTemplate: boolean;
  sourceTemplateId?: number;
}

export interface TalentCVMatchResult {
  talentCV: TalentCV;
  matchScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  levelMatch: boolean;
  matchSummary: string;
}

export interface TalentCVJobRequestFilter {
  jobRequestId: number;
  excludeDeleted?: boolean;
  maxResults?: number; // Số lượng kết quả tối đa (nếu backend hỗ trợ)
}

export interface TalentCVExtractResponse {
  originalText: string;
  generateText: string;
  isSuccess: boolean;
}

export interface TalentCVExtractRequest {
  filePDF: File;
}

export const talentCVService = {
  async getAll(filter?: TalentCVFilter) {
    try {
      const params = new URLSearchParams();
      if (filter?.talentId) params.append("TalentId", filter.talentId.toString());
      if (filter?.jobRoleId) params.append("JobRoleId", filter.jobRoleId.toString());
      if (filter?.isActive !== undefined) params.append("IsActive", filter.isActive.toString());
      if (filter?.isGeneratedFromTemplate !== undefined) params.append("IsGeneratedFromTemplate", filter.isGeneratedFromTemplate.toString());
      if (filter?.excludeDeleted !== undefined) params.append("ExcludeDeleted", filter.excludeDeleted.toString());
      const url = `/talentcv${params.toString() ? `?${params}` : ""}`;
      const response = await axios.get(url);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw error.response?.data || { message: "Failed to fetch talent CVs" };
      throw { message: "Unexpected error occurred" };
    }
  },

  async getById(id: number) {
    try {
      const response = await axios.get(`/talentcv/${id}`);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw error.response?.data || { message: "Failed to fetch talent CV details" };
      throw { message: "Unexpected error occurred" };
    }
  },

  async create(payload: TalentCVCreate) {
    try {
      const response = await axios.post("/talentcv", payload);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw error.response?.data || { message: "Failed to create new talent CV" };
      throw { message: "Unexpected error occurred during creation" };
    }
  },

  async update(id: number, payload: Partial<TalentCVCreate>) {
    try {
      const response = await axios.put(`/talentcv/${id}`, payload);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw error.response?.data || { message: "Failed to update talent CV" };
      throw { message: "Unexpected error occurred" };
    }
  },

  async deleteById(id: number) {
    try {
      const response = await axios.delete(`/talentcv/${id}`);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw error.response?.data || { message: "Failed to delete talent CV" };
      throw { message: "Unexpected error occurred" };
    }
  },

  async getMatchesForJobRequest(filter: TalentCVJobRequestFilter) {
    try {
      const params = new URLSearchParams();
      params.append("JobRequestId", filter.jobRequestId.toString());
      if (filter.excludeDeleted !== undefined) params.append("ExcludeDeleted", filter.excludeDeleted.toString());
      if (filter.maxResults !== undefined) params.append("MaxResults", filter.maxResults.toString());
      const url = `/talentcv/filter-by-job-request${params.toString() ? `?${params}` : ""}`;
      const response = await axios.get(url);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw error.response?.data || { message: "Failed to fetch CV matches for job request" };
      throw { message: "Unexpected error occurred" };
    }
  },

  async extractFromPDF(file: File) {
    try {
      const formData = new FormData();
      formData.append("filePDF", file);
      const response = await axios.post("/talentcv/extract-pdf", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw error.response?.data || { message: "Failed to extract CV from PDF" };
      throw { message: "Unexpected error occurred during extraction" };
    }
  },
};
