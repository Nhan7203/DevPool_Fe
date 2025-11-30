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

export interface PartnerContractFilter {
  partnerId?: number;
  talentId?: number;
  status?: string;
  startDateFrom?: string;
  startDateTo?: string;
  excludeDeleted?: boolean;
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
        throw error.response?.data || { message: "Không thể tải danh sách hợp đồng đối tác" };
      throw { message: "Lỗi không xác định khi tải danh sách hợp đồng đối tác" };
    }
  },

  async getById(id: number) {
    try {
      const response = await axios.get(`/partnercontract/${id}`);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw error.response?.data || { message: "Không thể tải thông tin hợp đồng đối tác" };
      throw { message: "Lỗi không xác định khi tải thông tin hợp tác đối tác" };
    }
  },
};
