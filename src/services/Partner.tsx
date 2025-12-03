// src/services/partnerService.ts
import axios from "../configs/axios";
import { AxiosError } from "axios";

export const PartnerType = {
  OwnCompany: 1,
  Partner: 2,
  Individual: 3,
} as const;

export type PartnerType = typeof PartnerType[keyof typeof PartnerType];

export interface Partner {
  id: number;
  code: string;
  partnerType: PartnerType;
  companyName: string;
  taxCode?: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
}

export interface PartnerPayload {
  code: string;
  partnerType: PartnerType;
  companyName: string;
  taxCode?: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
}

export interface PartnerContractModel {
  id: number;
  partnerId: number;
  talentId: number;
  devRate?: number | null;
  rateType: string;
  contractNumber: string;
  status: string;
  startDate: string; // DateTime as ISO string
  endDate?: string | null; // DateTime as ISO string
  contractFileUrl?: string | null;
}

export interface PartnerTalentModel {
  id: number;
  partnerId: number;
  talentId: number;
  startDate: string; // DateTime as ISO string
  endDate?: string | null; // DateTime as ISO string
  status?: string | null;
  notes?: string | null;
}

export interface PartnerPaymentPeriodModel {
  id: number;
  partnerId: number;
  periodMonth: number;
  periodYear: number;
  status: string;
}

export interface PartnerDetailedModel {
  id: number;
  code: string;
  partnerType: PartnerType;
  companyName: string;
  taxCode?: string | null;
  contactPerson?: string | null;
  email?: string | null;
  phoneNumber?: string | null;
  address?: string | null;
  notes?: string | null;
  createdAt: string; // DateTime as ISO string
  updatedAt: string; // DateTime as ISO string
  contracts: PartnerContractModel[];
  talents: PartnerTalentModel[];
  paymentPeriods: PartnerPaymentPeriodModel[];
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

  async getDetailedById(id: number) {
    try {
      const response = await axios.get(`/partner/${id}/detailed`);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw error.response?.data || { message: "Failed to fetch partner detailed information" };
      throw { message: "Unexpected error occurred" };
    }
  },
};
