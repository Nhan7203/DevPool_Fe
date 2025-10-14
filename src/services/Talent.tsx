// src/services/talentService.ts
import axios from "../configs/axios";
import { AxiosError } from "axios";

export interface Developer {
    id: number;
    fullName: string;
    email?: string;
    phone?: string;
    level?: string;
    yearsOfExp: number;
    ratePerMonth: number;
    status?: string;
    githubUrl?: string;
    portfolioUrl?: string;
    partnerId?: number;
    currentProjectId?: number;
    currentContractId?: number;
}

export interface TalentPayload {
  partnerId?: number;
  userId?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  currentProjectId?: number;
  currentContractId?: number;
  level?: string;
  yearsOfExp: number;
  ratePerMonth?: number;
  status?: string;
  githubUrl?: string;
  portfolioUrl?: string;
}

export const talentService = {
  async getAll(filter?: { fullName?: string; partnerId?: number; level?: string; status?: string }) {
    try {
      const params = new URLSearchParams();
      if (filter?.fullName) params.append("FullName", filter.fullName);
      if (filter?.partnerId) params.append("PartnerId", filter.partnerId.toString());
      if (filter?.level) params.append("Level", filter.level);
      if (filter?.status) params.append("Status", filter.status);
      const url = `/talent${params.toString() ? `?${params}` : ""}`;
      const response = await axios.get(url);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw error.response?.data || { message: "Failed to fetch talents" };
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

  async update(id: number, payload: TalentPayload) {
    try {
      const response = await axios.put(`/talent/${id}`, payload);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw error.response?.data || { message: "Failed to update talent" };
      throw { message: "Unexpected error occurred" };
    }
  },
};
