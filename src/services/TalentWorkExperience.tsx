import axios from "../configs/axios";
import { AxiosError } from "axios";

export interface TalentWorkExperience {
  id: number;
  talentId: number;
  talentCVId: number;
  company: string;
  position: string;
  startDate: string; // DateTime as ISO string
  endDate?: string; // DateTime as ISO string
  description: string;
}

export interface TalentWorkExperienceFilter {
  talentId?: number;
  talentCVId?: number;
  company?: string;
  position?: string;
  excludeDeleted?: boolean;
}

export interface TalentWorkExperienceCreate {
  talentId: number;
  talentCVId: number;
  company: string;
  position: string;
  startDate: string; // DateTime as ISO string
  endDate?: string; // DateTime as ISO string
  description: string;
}

export const talentWorkExperienceService = {
  async getAll(filter?: TalentWorkExperienceFilter) {
    try {
      const params = new URLSearchParams();
      if (filter?.talentId) params.append("TalentId", filter.talentId.toString());
      if (filter?.talentCVId) params.append("TalentCVId", filter.talentCVId.toString());
      if (filter?.company) params.append("Company", filter.company);
      if (filter?.position) params.append("Position", filter.position);
      if (filter?.excludeDeleted !== undefined) params.append("ExcludeDeleted", filter.excludeDeleted.toString());
      const url = `/talentworkexperience${params.toString() ? `?${params}` : ""}`;
      const response = await axios.get(url);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw error.response?.data || { message: "Failed to fetch talent work experiences" };
      throw { message: "Unexpected error occurred" };
    }
  },

  async getById(id: number) {
    try {
      const response = await axios.get(`/talentworkexperience/${id}`);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw error.response?.data || { message: "Failed to fetch talent work experience details" };
      throw { message: "Unexpected error occurred" };
    }
  },

  async create(payload: TalentWorkExperienceCreate) {
    try {
      const response = await axios.post("/talentworkexperience", payload);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw error.response?.data || { message: "Failed to create new talent work experience" };
      throw { message: "Unexpected error occurred during creation" };
    }
  },

  async update(id: number, payload: Partial<TalentWorkExperienceCreate>) {
    try {
      const response = await axios.put(`/talentworkexperience/${id}`, payload);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw error.response?.data || { message: "Failed to update talent work experience" };
      throw { message: "Unexpected error occurred" };
    }
  },

  async deleteById(id: number) {
    try {
      const response = await axios.delete(`/talentworkexperience/${id}`);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw error.response?.data || { message: "Failed to delete talent work experience" };
      throw { message: "Unexpected error occurred" };
    }
  },
};
