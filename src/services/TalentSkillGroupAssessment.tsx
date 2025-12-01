import axios from "../configs/axios";
import { AxiosError } from "axios";

export interface TalentSkillGroupAssessment {
  id: number;
  talentId: number;
  talentName?: string | null;
  skillGroupId: number;
  skillGroupName?: string | null;
  expertId?: number | null;
  expertName?: string | null;
  verifiedByName?: string | null;
  assessmentDate: string; // DateTime từ API, dùng string ISO
  isVerified: boolean;
  note?: string | null;
  skillSnapshot?: string | null;
  excelFileUrl?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string | null;
  isDeleted: boolean;
}

export interface TalentSkillGroupAssessmentFilter {
  talentId?: number;
  skillGroupId?: number;
  expertId?: number;
  isVerified?: boolean;
  isActive?: boolean;
  assessmentDateFrom?: string; // ISO string
  assessmentDateTo?: string; // ISO string
  excludeDeleted?: boolean;
}

export interface VerifiedSkillUpdate {
  skillId: number;
  level: string;
  yearsExp: number;
}

export interface TalentSkillGroupAssessmentCreate {
  talentId: number;
  skillGroupId: number;
  expertId?: number | null;
  verifiedByName?: string | null;
  assessmentDate: string; // ISO string, FE sẽ gửi lên
  isVerified: boolean;
  note?: string | null;
  skillSnapshot?: string | null;
  excelFileUrl?: string | null;
  verifiedSkills?: VerifiedSkillUpdate[];
}

export interface SkillGroupVerificationStatus {
  talentId: number;
  skillGroupId: number;
  skillGroupName?: string | null;
  isVerified: boolean;
  lastVerifiedDate?: string | null;
  lastVerifiedByExpertId?: number | null;
  lastVerifiedByExpertName?: string | null;
  needsReverification: boolean;
  reason?: string | null;
}

export const talentSkillGroupAssessmentService = {
  // GET api/TalentSkillGroupAssessment
  async getAll(filter?: TalentSkillGroupAssessmentFilter) {
    try {
      const params = new URLSearchParams();
      if (filter?.talentId) params.append("TalentId", filter.talentId.toString());
      if (filter?.skillGroupId) params.append("SkillGroupId", filter.skillGroupId.toString());
      if (filter?.expertId) params.append("ExpertId", filter.expertId.toString());
      if (filter?.isVerified !== undefined) params.append("IsVerified", filter.isVerified.toString());
      if (filter?.isActive !== undefined) params.append("IsActive", filter.isActive.toString());
      if (filter?.assessmentDateFrom) params.append("AssessmentDateFrom", filter.assessmentDateFrom);
      if (filter?.assessmentDateTo) params.append("AssessmentDateTo", filter.assessmentDateTo);
      if (filter?.excludeDeleted !== undefined)
        params.append("ExcludeDeleted", filter.excludeDeleted.toString());

      const url = `/TalentSkillGroupAssessment${params.toString() ? `?${params}` : ""}`;
      const response = await axios.get(url);
      return response.data as TalentSkillGroupAssessment[];
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw error.response?.data || { message: "Failed to fetch talent skill group assessments" };
      throw { message: "Unexpected error occurred" };
    }
  },

  // GET api/TalentSkillGroupAssessment/{id}
  async getById(id: number) {
    try {
      const response = await axios.get(`/TalentSkillGroupAssessment/${id}`);
      return response.data as TalentSkillGroupAssessment;
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw error.response?.data || { message: "Failed to fetch assessment details" };
      throw { message: "Unexpected error occurred" };
    }
  },

  // GET api/TalentSkillGroupAssessment/latest?talentId=&skillGroupId=
  async getLatest(talentId: number, skillGroupId: number) {
    try {
      const response = await axios.get(
        `/TalentSkillGroupAssessment/latest?talentId=${talentId}&skillGroupId=${skillGroupId}`
      );
      return response.data as TalentSkillGroupAssessment;
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw error.response?.data || { message: "Failed to fetch latest assessment" };
      throw { message: "Unexpected error occurred" };
    }
  },

  // POST api/TalentSkillGroupAssessment/verify
  async verifySkillGroup(payload: TalentSkillGroupAssessmentCreate) {
    try {
      const response = await axios.post("/TalentSkillGroupAssessment/verify", payload);
      return response.data as TalentSkillGroupAssessment;
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw error.response?.data || { message: "Failed to verify skill group" };
      throw { message: "Unexpected error occurred during verification" };
    }
  },

  // GET api/TalentSkillGroupAssessment/status?talentId=&skillGroupId=
  async getVerificationStatus(talentId: number, skillGroupId: number) {
    try {
      const response = await axios.get(
        `/TalentSkillGroupAssessment/status?talentId=${talentId}&skillGroupId=${skillGroupId}`
      );
      return response.data as SkillGroupVerificationStatus;
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw error.response?.data || { message: "Failed to fetch verification status" };
      throw { message: "Unexpected error occurred" };
    }
  },

  // POST api/TalentSkillGroupAssessment/statuses?talentId=
  async getVerificationStatuses(talentId: number, skillGroupIds: number[]) {
    try {
      const response = await axios.post(
        `/TalentSkillGroupAssessment/statuses?talentId=${talentId}`,
        skillGroupIds
      );
      return response.data as SkillGroupVerificationStatus[];
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw error.response?.data || { message: "Failed to fetch verification statuses" };
      throw { message: "Unexpected error occurred" };
    }
  },

  // POST api/TalentSkillGroupAssessment/invalidate?talentId=&skillGroupId=&reason=
  async invalidateAssessment(talentId: number, skillGroupId: number, reason?: string) {
    try {
      const params = new URLSearchParams();
      params.append("talentId", talentId.toString());
      params.append("skillGroupId", skillGroupId.toString());
      if (reason) params.append("reason", reason);

      const response = await axios.post(
        `/TalentSkillGroupAssessment/invalidate?${params.toString()}`
      );
      return response.data as { message: string; success: boolean };
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw error.response?.data || { message: "Failed to invalidate assessment" };
      throw { message: "Unexpected error occurred" };
    }
  },

  // GET api/TalentSkillGroupAssessment/history?talentId=&skillGroupId=
  async getAssessmentHistory(talentId: number, skillGroupId: number) {
    try {
      const response = await axios.get(
        `/TalentSkillGroupAssessment/history?talentId=${talentId}&skillGroupId=${skillGroupId}`
      );
      return response.data as TalentSkillGroupAssessment[];
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw error.response?.data || { message: "Failed to fetch assessment history" };
      throw { message: "Unexpected error occurred" };
    }
  },
};


