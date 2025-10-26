import axios from "../configs/axios";
import { AxiosError } from "axios";

export const PartnerPaymentStatus = {
  Pending: 0,
  Approved: 1,
  Paid: 2
} as const;

export type PartnerPaymentStatus = typeof PartnerPaymentStatus[keyof typeof PartnerPaymentStatus];

export interface PartnerPayment {
  id: number;
  partnerId: number;
  period: string;
  totalAmount?: number;
  paymentStatus: PartnerPaymentStatus;
  invoiceFromPartnerUrl: string;
  paymentDate?: string; // DateTime as ISO string
}

export interface PartnerPaymentFilter {
  partnerId?: number;
  period?: string;
  paymentStatus?: PartnerPaymentStatus;
  paymentDateFrom?: string; // DateTime as ISO string
  paymentDateTo?: string; // DateTime as ISO string
  excludeDeleted?: boolean;
}

export interface PartnerPaymentCreate {
  partnerId: number;
  period: string; // YYYY-MM format
  totalAmount?: number;
  paymentStatus: PartnerPaymentStatus;
  invoiceFromPartnerUrl: string;
  paymentDate?: string; // DateTime as ISO string
}

export const partnerPaymentService = {
  async getAll(filter?: PartnerPaymentFilter) {
    try {
      const params = new URLSearchParams();
      if (filter?.partnerId) params.append("PartnerId", filter.partnerId.toString());
      if (filter?.period) params.append("Period", filter.period);
      if (filter?.paymentStatus !== undefined) params.append("PaymentStatus", filter.paymentStatus.toString());
      if (filter?.paymentDateFrom) params.append("PaymentDateFrom", filter.paymentDateFrom);
      if (filter?.paymentDateTo) params.append("PaymentDateTo", filter.paymentDateTo);
      if (filter?.excludeDeleted !== undefined) params.append("ExcludeDeleted", filter.excludeDeleted.toString());
      const url = `/partnerpayment${params.toString() ? `?${params}` : ""}`;
      const response = await axios.get(url);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw error.response?.data || { message: "Failed to fetch partner payments" };
      throw { message: "Unexpected error occurred" };
    }
  },

  async getById(id: number) {
    try {
      const response = await axios.get(`/partnerpayment/${id}`);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw error.response?.data || { message: "Failed to fetch partner payment details" };
      throw { message: "Unexpected error occurred" };
    }
  },

  async create(payload: PartnerPaymentCreate) {
    try {
      const response = await axios.post("/partnerpayment", payload);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw error.response?.data || { message: "Failed to create new partner payment" };
      throw { message: "Unexpected error occurred during creation" };
    }
  },

  async update(id: number, payload: Partial<PartnerPaymentCreate>) {
    try {
      const response = await axios.put(`/partnerpayment/${id}`, payload);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw error.response?.data || { message: "Failed to update partner payment" };
      throw { message: "Unexpected error occurred" };
    }
  },

  async deleteById(id: number) {
    try {
      const response = await axios.delete(`/partnerpayment/${id}`);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw error.response?.data || { message: "Failed to delete partner payment" };
      throw { message: "Unexpected error occurred" };
    }
  },
};
