import axios from "../configs/axios";
import { AxiosError } from "axios";

export interface PartnerPaymentDetail {
  id: number;
  partnerPaymentId: number;
  workReportDetailId: number;
  baseAmount?: number;
  overtimeAmount?: number;
  totalAmount?: number;
}

export interface PartnerPaymentDetailFilter {
  partnerPaymentId?: number;
  workReportDetailId?: number;
  excludeDeleted?: boolean;
}

export interface PartnerPaymentDetailCreate {
  partnerPaymentId: number;
  workReportDetailId: number;
  baseAmount?: number;
  overtimeAmount?: number;
  totalAmount?: number;
}

export const partnerPaymentDetailService = {
  async getAll(filter?: PartnerPaymentDetailFilter) {
    try {
      const params = new URLSearchParams();
      if (filter?.partnerPaymentId) params.append("PartnerPaymentId", filter.partnerPaymentId.toString());
      if (filter?.workReportDetailId) params.append("WorkReportDetailId", filter.workReportDetailId.toString());
      if (filter?.excludeDeleted !== undefined) params.append("ExcludeDeleted", filter.excludeDeleted.toString());
      const url = `/partnerpaymentdetail${params.toString() ? `?${params}` : ""}`;
      const response = await axios.get(url);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw error.response?.data || { message: "Failed to fetch partner payment details" };
      throw { message: "Unexpected error occurred" };
    }
  },

  async getById(id: number) {
    try {
      const response = await axios.get(`/partnerpaymentdetail/${id}`);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw error.response?.data || { message: "Failed to fetch partner payment detail details" };
      throw { message: "Unexpected error occurred" };
    }
  },

  async create(payload: PartnerPaymentDetailCreate) {
    try {
      const response = await axios.post("/partnerpaymentdetail", payload);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw error.response?.data || { message: "Failed to create new partner payment detail" };
      throw { message: "Unexpected error occurred during creation" };
    }
  },

  async update(id: number, payload: Partial<PartnerPaymentDetailCreate>) {
    try {
      const response = await axios.put(`/partnerpaymentdetail/${id}`, payload);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw error.response?.data || { message: "Failed to update partner payment detail" };
      throw { message: "Unexpected error occurred" };
    }
  },

  async deleteById(id: number) {
    try {
      const response = await axios.delete(`/partnerpaymentdetail/${id}`);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw error.response?.data || { message: "Failed to delete partner payment detail" };
      throw { message: "Unexpected error occurred" };
    }
  },
};
