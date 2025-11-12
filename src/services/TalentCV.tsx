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

export interface BasicInfoData {
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth?: string | null;
  locationName: string;
  githubUrl: string;
  portfolioUrl: string;
  workingMode: string;
}

export interface BasicInfoComparison {
  current: BasicInfoData;
  suggested: BasicInfoData;
  hasChanges: boolean;
}

export interface SkillComparisonItem {
  skillId: number;
  skillName: string;
  level: string;
  yearsExp: number;
}

export interface SkillMatchResult {
  skillId: number;
  skillName: string;
  cvMention: string;
  cvLevel: string;
  cvYearsExp?: number | null;
  matchConfidence: number;
}

export interface ExtractedSkill {
  skillName: string;
  level: string;
  yearsExp?: number | null;
}

export interface SkillsComparison {
  existing: SkillComparisonItem[];
  newFromCV: ExtractedSkill[];
  matched: SkillMatchResult[];
}

export interface ExistingWorkExperienceData {
  id: number;
  company: string;
  position: string;
  startDate: string;
  endDate?: string | null;
  description: string;
}

export interface ExtractedWorkExperience {
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface WorkExperienceDuplicateCheck {
  existing: ExistingWorkExperienceData;
  fromCV: ExtractedWorkExperience;
  similarityScore: number;
  recommendation: string;
  differencesSummary: string[];
}

export interface WorkExperiencesComparison {
  potentialDuplicates: WorkExperienceDuplicateCheck[];
  newEntries: ExtractedWorkExperience[];
}

export interface ExistingProjectData {
  id: number;
  projectName: string;
  position: string;
  technologies: string;
  description: string;
}

export interface ExtractedProject {
  projectName: string;
  position: string;
  description: string;
  technologies: string;
}

export interface ProjectDuplicateCheck {
  existing: ExistingProjectData;
  fromCV: ExtractedProject;
  similarityScore: number;
  recommendation: string;
  differencesSummary: string[];
}

export interface ProjectsComparison {
  potentialDuplicates: ProjectDuplicateCheck[];
  newEntries: ExtractedProject[];
}

export interface ExistingCertificateData {
  id: number;
  certificateTypeName: string;
  issuedDate?: string | null;
  isVerified: boolean;
  imageUrl: string;
}

export interface ExtractedCertificate {
  certificateName: string;
  issuedDate: string;
  imageUrl: string;
}

export interface CertificatesComparison {
  existing: ExistingCertificateData[];
  newFromCV: ExtractedCertificate[];
}

export interface JobRoleLevelComparisonItem {
  id: number;
  position: string;
  level: string;
  yearsOfExp: number;
  ratePerMonth?: number | null;
}

export interface ExtractedJobRoleLevel {
  position: string;
  level: string;
  yearsOfExp?: number | null;
  ratePerMonth?: number | null;
}

export interface JobRoleLevelsComparison {
  existing: JobRoleLevelComparisonItem[];
  newFromCV: ExtractedJobRoleLevel[];
}

export interface BasicInfoUpdateDecision {
  updateFullName: boolean;
  updateEmail: boolean;
  updatePhone: boolean;
  updateDateOfBirth: boolean;
  updateLocation: boolean;
  updateGithubUrl: boolean;
  updatePortfolioUrl: boolean;
  updateWorkingMode: boolean;
  newFullName?: string;
  newEmail?: string;
  newPhone?: string;
  newDateOfBirth?: string | null;
  newLocationId?: number | null;
  newGithubUrl?: string;
  newPortfolioUrl?: string;
  newWorkingMode?: string;
}

export interface SkillsUpdateDecision {
  skillIdsToAdd: number[];
  skillIdsToRemove: number[];
}

export type WorkExperienceActionType = "UPDATE" | "ADD_NEW" | "SKIP";

export interface WorkExperienceUpdateAction {
  actionType: WorkExperienceActionType;
  existingId?: number | null;
  newData: ExtractedWorkExperience;
}

export interface WorkExperiencesUpdateDecision {
  actions: WorkExperienceUpdateAction[];
}

export type ProjectActionType = "UPDATE" | "ADD_NEW" | "SKIP";

export interface ProjectUpdateAction {
  actionType: ProjectActionType;
  existingId?: number | null;
  newData: ExtractedProject;
}

export interface ProjectsUpdateDecision {
  actions: ProjectUpdateAction[];
}

export type CertificateActionType = "ADD_NEW" | "SKIP";

export interface CertificateUpdateAction {
  actionType: CertificateActionType;
  newData: ExtractedCertificate;
}

export interface CertificatesUpdateDecision {
  actions: CertificateUpdateAction[];
}

export type JobRoleLevelActionType = "ADD_NEW" | "SKIP";

export interface JobRoleLevelUpdateAction {
  actionType: JobRoleLevelActionType;
  newData: ExtractedJobRoleLevel;
}

export interface JobRoleLevelsUpdateDecision {
  actions: JobRoleLevelUpdateAction[];
}

export interface ApplyCVUpdatesRequest {
  basicInfo?: BasicInfoUpdateDecision;
  skills?: SkillsUpdateDecision;
  workExperiences?: WorkExperiencesUpdateDecision;
  projects?: ProjectsUpdateDecision;
  certificates?: CertificatesUpdateDecision;
  jobRoleLevels?: JobRoleLevelsUpdateDecision;
}

export interface UpdateStatistics {
  skillsAdded: number;
  skillsRemoved: number;
  workExperiencesAdded: number;
  workExperiencesUpdated: number;
  projectsAdded: number;
  projectsUpdated: number;
  certificatesAdded: number;
  jobRoleLevelsAdded: number;
  basicInfoUpdated: boolean;
}

export interface ApplyCVUpdatesResponse {
  isSuccess: boolean;
  message: string;
  statistics: UpdateStatistics;
}

export interface CVAnalysisComparisonResponse {
  isSuccess: boolean;
  errorMessage?: string | null;
  basicInfo: BasicInfoComparison;
  skills: SkillsComparison;
  workExperiences: WorkExperiencesComparison;
  projects: ProjectsComparison;
  certificates: CertificatesComparison;
  jobRoleLevels: JobRoleLevelsComparison;
  rawExtractedText: string;
}

export interface TalentCVExtractRequest {
  filePDF: File;
}

export interface TalentCVToggleActiveModel {
  isActive: boolean;
}

export interface TalentCVFieldsUpdateModel {
  talentId: number;
  summary?: string | null;
  isActive?: boolean;
  isGeneratedFromTemplate?: boolean;
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

  async activate(id: number) {
    try {
      const response = await axios.patch(`/talentcv/${id}/activate`);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw error.response?.data || { message: "Failed to activate talent CV" };
      throw { message: "Unexpected error occurred during activation" };
    }
  },

  async deactivate(id: number) {
    try {
      const response = await axios.patch(`/talentcv/${id}/deactivate`);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw error.response?.data || { message: "Failed to deactivate talent CV" };
      throw { message: "Unexpected error occurred during deactivation" };
    }
  },

  async updateFields(id: number, payload: TalentCVFieldsUpdateModel) {
    try {
      const response = await axios.patch(`/talentcv/${id}/update-fields`, payload);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw error.response?.data || { message: "Failed to update talent CV fields" };
      throw { message: "Unexpected error occurred during field update" };
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

  async analyzeCVForUpdate(talentId: number, file: File) {
    try {
      const formData = new FormData();
      formData.append("CVFile", file);
      const response = await axios.post(`/talentcv/talents/${talentId}/analyze-cv`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data as CVAnalysisComparisonResponse;
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw error.response?.data || { message: "Failed to analyze CV for update" };
      throw { message: "Unexpected error occurred during CV analysis" };
    }
  },

  async applyCVUpdates(talentId: number, payload: ApplyCVUpdatesRequest) {
    try {
      const response = await axios.put(`/talentcv/talents/${talentId}/apply-cv-updates`, payload);
      return response.data as ApplyCVUpdatesResponse;
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw error.response?.data || { message: "Failed to apply CV updates" };
      throw { message: "Unexpected error occurred while applying CV updates" };
    }
  },
};
