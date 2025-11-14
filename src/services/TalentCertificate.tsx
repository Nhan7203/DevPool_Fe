import axios from "../configs/axios";
import { AxiosError } from "axios";

export interface TalentCertificate {
  id: number;
  talentId: number;
  certificateTypeId: number;
  certificateName: string;
  certificateDescription?: string;
  issuedDate?: string; // DateTime as ISO string
  isVerified: boolean;
  imageUrl: string;
}

export interface TalentCertificateFilter {
  talentId?: number;
  certificateTypeId?: number;
  isVerified?: boolean;
  excludeDeleted?: boolean;
}

export interface TalentCertificateCreate {
  talentId: number;
  certificateTypeId: number;
  certificateName: string;
  certificateDescription?: string;
  issuedDate?: string; // DateTime as ISO string
  isVerified: boolean;
  imageUrl: string;
}

export const talentCertificateService = {
  async getAll(filter?: TalentCertificateFilter) {
    try {
      const params = new URLSearchParams();
      if (filter?.talentId) params.append("TalentId", filter.talentId.toString());
      if (filter?.certificateTypeId) params.append("CertificateTypeId", filter.certificateTypeId.toString());
      if (filter?.isVerified !== undefined) params.append("IsVerified", filter.isVerified.toString());
      if (filter?.excludeDeleted !== undefined) params.append("ExcludeDeleted", filter.excludeDeleted.toString());
      const url = `/talentcertificate${params.toString() ? `?${params}` : ""}`;
      const response = await axios.get(url);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw error.response?.data || { message: "Failed to fetch talent certificates" };
      throw { message: "Unexpected error occurred" };
    }
  },

  async getById(id: number) {
    try {
      const response = await axios.get(`/talentcertificate/${id}`);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw error.response?.data || { message: "Failed to fetch talent certificate details" };
      throw { message: "Unexpected error occurred" };
    }
  },

  async create(payload: TalentCertificateCreate) {
    try {
      const response = await axios.post("/talentcertificate", payload);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw error.response?.data || { message: "Failed to create new talent certificate" };
      throw { message: "Unexpected error occurred during creation" };
    }
  },

  async update(id: number, payload: Partial<TalentCertificateCreate>) {
    try {
      const response = await axios.put(`/talentcertificate/${id}`, payload);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw error.response?.data || { message: "Failed to update talent certificate" };
      throw { message: "Unexpected error occurred" };
    }
  },

  async deleteById(id: number) {
    try {
      const response = await axios.delete(`/talentcertificate/${id}`);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw error.response?.data || { message: "Failed to delete talent certificate" };
      throw { message: "Unexpected error occurred" };
    }
  },
};
