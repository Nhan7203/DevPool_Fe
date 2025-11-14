import axios from "../configs/axios";
import { AxiosError } from "axios";

export interface PartnerContract {
  id: number;
  partnerId: number;
  talentId: number;
  devRate?: number | null;
  rateType: string;
  contractNumber: string;
  status: string;
  startDate: string;
  endDate?: string | null;
  contractFileUrl?: string | null;
}

export interface PartnerContractPayload {
  partnerId: number;
  talentId: number;
  devRate?: number | null;
  rateType: string;
  contractNumber: string;
  status: string;
  startDate: string;
  endDate?: string | null;
  contractFileUrl?: string | null;
}

export interface PartnerContractUpdatePayload {
  id: number;
  partnerId: number;
  talentId: number;
  devRate?: number | null;
  rateType: string;
  contractNumber: string;
  status: string;
  startDate: string;
  endDate?: string | null;
  contractFileUrl?: string | null;
}

export interface PartnerContractFilter {
  partnerId?: number;
  talentId?: number;
  status?: string;
  rateType?: string;
  startDateFrom?: string;
  startDateTo?: string;
  excludeDeleted?: boolean;
}

export interface PartnerContractAdvancedStatusUpdateModel {
  newStatus: string;
  notes?: string | null;
  updatedBy?: string | null;
  effectiveDate?: string | null;
  reason?: string | null;
}

export interface PartnerContractStatusTransitionResult {
  success: boolean;
  message: string;
  oldStatus?: string;
  newStatus?: string;
  additionalInfo?: any;
  errors?: string[];
}

export const partnerContractService = {
  async getAll(filter?: PartnerContractFilter) {
    try {
      const params = new URLSearchParams();

      if (filter?.partnerId)
        params.append("PartnerId", filter.partnerId.toString());
      if (filter?.talentId)
        params.append("TalentId", filter.talentId.toString());
      if (filter?.status)
        params.append("Status", filter.status);
      if (filter?.rateType)
        params.append("RateType", filter.rateType);
      if (filter?.startDateFrom)
        params.append("StartDateFrom", filter.startDateFrom);
      if (filter?.startDateTo)
        params.append("StartDateTo", filter.startDateTo);
      if (filter?.excludeDeleted !== undefined)
        params.append("ExcludeDeleted", filter.excludeDeleted ? "true" : "false");

      const url = `/partnercontract${params.toString() ? `?${params}` : ""}`;
      const response = await axios.get(url);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw (
          error.response?.data || { message: "Không thể tải danh sách hợp đồng đối tác" }
        );
      throw { message: "Lỗi không xác định khi tải danh sách hợp đồng đối tác" };
    }
  },

  async getById(id: number) {
    try {
      const response = await axios.get(`/partnercontract/${id}`);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw (
          error.response?.data || { message: "Không thể tải thông tin hợp đồng đối tác" }
        );
      throw { message: "Lỗi không xác định khi tải thông tin hợp đồng đối tác" };
    }
  },

  async create(payload: PartnerContractPayload) {
    try {
      const response = await axios.post("/partnercontract", payload);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw (
          error.response?.data || { message: "Không thể tạo hợp đồng đối tác mới" }
        );
      throw { message: "Lỗi không xác định khi tạo hợp đồng đối tác" };
    }
  },

  async update(id: number, payload: Partial<PartnerContractUpdatePayload>) {
    try {
      const response = await axios.put(`/partnercontract/${id}`, payload);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw (
          error.response?.data || { message: "Không thể cập nhật thông tin hợp đồng đối tác" }
        );
      throw { message: "Lỗi không xác định khi cập nhật hợp đồng đối tác" };
    }
  },

  async delete(id: number) {
    try {
      const response = await axios.delete(`/partnercontract/${id}`);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw (
          error.response?.data || { message: "Không thể xóa hợp đồng đối tác" }
        );
      throw { message: "Lỗi không xác định khi xóa hợp đồng đối tác" };
    }
  },

  async changeStatus(
    id: number,
    payload: PartnerContractAdvancedStatusUpdateModel
  ): Promise<PartnerContractStatusTransitionResult> {
    try {
      const response = await axios.patch(
        `/partnercontract/${id}/change-status`,
        payload
      );
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        // Trả về lỗi từ server với đầy đủ thông tin
        if (error.response?.data) {
          throw error.response.data;
        }
        throw {
          success: false,
          message: "Không thể thay đổi trạng thái hợp đồng đối tác",
        };
      }
      throw {
        success: false,
        message: "Lỗi không xác định khi thay đổi trạng thái hợp đồng đối tác",
      };
    }
  },
};

