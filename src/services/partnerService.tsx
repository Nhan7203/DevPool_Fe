// src/services/partnerService.ts
import axios from "../configs/axios";
import { AxiosError } from "axios";

export interface Partner {
  id: number;
  companyName: string;
  taxCode?: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
}

export interface PartnerPayload {
  companyName: string;
  taxCode?: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
}

export const partnerService = {
  async getAll(filter?: { companyName?: string; taxCode?: string; contactPerson?: string }) {
    try {
      const params = new URLSearchParams();
      if (filter?.companyName) params.append("CompanyName", filter.companyName);
      if (filter?.taxCode) params.append("TaxCode", filter.taxCode);
      if (filter?.contactPerson) params.append("ContactPerson", filter.contactPerson);
      const url = `/partner${params.toString() ? `?${params}` : ""}`;
      const response = await axios.get(url);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw error.response?.data || { message: "Failed to fetch partners" };
      throw { message: "Unexpected error occurred" };
    }
  },

  async create(payload: PartnerPayload) {
    try {
      const response = await axios.post(`/partner`, payload);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw error.response?.data || { message: "Failed to create partner" };
      throw { message: "Unexpected error occurred" };
    }
  },

  async update(id: number, payload: PartnerPayload) {
    try {
      const response = await axios.put(`/partner/${id}`, payload);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw error.response?.data || { message: "Failed to update partner" };
      throw { message: "Unexpected error occurred" };
    }
  },

  async deleteById(id: number) {
    try {
      const response = await axios.delete(`/partner/${id}`);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw error.response?.data || { message: "Failed to delete partner" };
      throw { message: "Unexpected error occurred" };
    }
  },
};
