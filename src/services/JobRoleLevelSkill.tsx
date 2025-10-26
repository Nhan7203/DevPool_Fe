import axios from "../configs/axios";
import { AxiosError } from "axios";

export interface JobRoleLevelSkill {
  id: number;
  jobRoleLevelId: number;
  skillId: number;
}

export interface JobRoleLevelSkillFilter {
  jobRoleLevelId?: number;
  skillId?: number;
  excludeDeleted?: boolean;
}

export interface JobRoleLevelSkillCreate {
  jobRoleLevelId: number;
  skillId: number;
}

export const jobRoleLevelSkillService = {
  async getAll(filter?: JobRoleLevelSkillFilter) {
    try {
      const params = new URLSearchParams();
      if (filter?.jobRoleLevelId) params.append("JobRoleLevelId", filter.jobRoleLevelId.toString());
      if (filter?.skillId) params.append("SkillId", filter.skillId.toString());
      if (filter?.excludeDeleted !== undefined) params.append("ExcludeDeleted", filter.excludeDeleted.toString());
      const url = `/jobrolelevelskill${params.toString() ? `?${params}` : ""}`;
      const response = await axios.get(url);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw error.response?.data || { message: "Failed to fetch job role level skills" };
      throw { message: "Unexpected error occurred" };
    }
  },

  async getById(id: number) {
    try {
      const response = await axios.get(`/jobrolelevelskill/${id}`);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw error.response?.data || { message: "Failed to fetch job role level skill details" };
      throw { message: "Unexpected error occurred" };
    }
  },

  async create(payload: JobRoleLevelSkillCreate) {
    try {
      const response = await axios.post("/jobrolelevelskill", payload);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw error.response?.data || { message: "Failed to create new job role level skill" };
      throw { message: "Unexpected error occurred during creation" };
    }
  },

  async update(id: number, payload: Partial<JobRoleLevelSkillCreate>) {
    try {
      const response = await axios.put(`/jobrolelevelskill/${id}`, payload);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw error.response?.data || { message: "Failed to update job role level skill" };
      throw { message: "Unexpected error occurred" };
    }
  },

  async deleteById(id: number) {
    try {
      const response = await axios.delete(`/jobrolelevelskill/${id}`);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw error.response?.data || { message: "Failed to delete job role level skill" };
      throw { message: "Unexpected error occurred" };
    }
  },
};
