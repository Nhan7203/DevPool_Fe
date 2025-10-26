import axios from "../configs/axios";
import { AxiosError } from "axios";

export const AssignmentType = {
  Primary: 0,
  Secondary: 1,
  Support: 2
} as const;

export type AssignmentType = typeof AssignmentType[keyof typeof AssignmentType];

export const AssignmentResponsibility = {
  HrManagement: 0,
  Sales: 1,
  Accounting: 2,
  ProjectCoordination: 3
} as const;

export type AssignmentResponsibility = typeof AssignmentResponsibility[keyof typeof AssignmentResponsibility];

export interface TalentStaffAssignment {
  id: number;
  userId: string;
  talentId: number;
  note: string;
  projectId?: number;
  assignmentType: AssignmentType;
  responsibility: AssignmentResponsibility;
  isActive: boolean;
  assignedAt: string; // DateTime as ISO string
  endedAt?: string; // DateTime as ISO string
}

export interface TalentStaffAssignmentFilter {
  userId?: string;
  talentId?: number;
  projectId?: number;
  assignmentType?: AssignmentType;
  responsibility?: AssignmentResponsibility;
  isActive?: boolean;
  excludeDeleted?: boolean;
}

export interface TalentStaffAssignmentCreate {
  userId: string;
  talentId: number;
  note: string;
  projectId?: number;
  assignmentType: AssignmentType;
  responsibility: AssignmentResponsibility;
  isActive: boolean;
  assignedAt: string; // DateTime as ISO string
  endedAt?: string; // DateTime as ISO string
}

export const talentStaffAssignmentService = {
  async getAll(filter?: TalentStaffAssignmentFilter) {
    try {
      const params = new URLSearchParams();
      if (filter?.userId) params.append("UserId", filter.userId);
      if (filter?.talentId) params.append("TalentId", filter.talentId.toString());
      if (filter?.projectId) params.append("ProjectId", filter.projectId.toString());
      if (filter?.assignmentType !== undefined) params.append("AssignmentType", filter.assignmentType.toString());
      if (filter?.responsibility !== undefined) params.append("Responsibility", filter.responsibility.toString());
      if (filter?.isActive !== undefined) params.append("IsActive", filter.isActive.toString());
      if (filter?.excludeDeleted !== undefined) params.append("ExcludeDeleted", filter.excludeDeleted.toString());
      const url = `/talentstaffassignment${params.toString() ? `?${params}` : ""}`;
      const response = await axios.get(url);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw error.response?.data || { message: "Failed to fetch talent staff assignments" };
      throw { message: "Unexpected error occurred" };
    }
  },

  async getById(id: number) {
    try {
      const response = await axios.get(`/talentstaffassignment/${id}`);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw error.response?.data || { message: "Failed to fetch talent staff assignment details" };
      throw { message: "Unexpected error occurred" };
    }
  },

  async create(payload: TalentStaffAssignmentCreate) {
    try {
      const response = await axios.post("/talentstaffassignment", payload);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw error.response?.data || { message: "Failed to create new talent staff assignment" };
      throw { message: "Unexpected error occurred during creation" };
    }
  },

  async update(id: number, payload: Partial<TalentStaffAssignmentCreate>) {
    try {
      const response = await axios.put(`/talentstaffassignment/${id}`, payload);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw error.response?.data || { message: "Failed to update talent staff assignment" };
      throw { message: "Unexpected error occurred" };
    }
  },

  async deleteById(id: number) {
    try {
      const response = await axios.delete(`/talentstaffassignment/${id}`);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw error.response?.data || { message: "Failed to delete talent staff assignment" };
      throw { message: "Unexpected error occurred" };
    }
  },
};
