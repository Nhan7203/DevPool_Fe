import axios from "../configs/axios";
import type { AxiosError } from "axios";

// NOTE:
// Backend hiện không có endpoint riêng cho PartnerContract trong FE này.
// Để tránh lỗi TypeScript và vẫn hiển thị được thông tin cơ bản cho developer,
// ta tạm thời định nghĩa PartnerContract tối thiểu dựa trên các trường đang được dùng trong UI.
// Nếu backend có model chuẩn, bạn có thể cập nhật lại interface và các hàm service này cho khớp.

export interface PartnerContract {
  id: number;
  contractNumber: string;
  talentId: number;
  partnerId: number;
  status: string;
  startDate: string;
  endDate?: string | null;
  devRate?: number | null;
  rateType?: string | null;
  contractFileUrl?: string | null;
}

export interface PartnerContractFilter {
  talentId?: number;
  excludeDeleted?: boolean;
}

export const partnerContractService = {
  async getAll(filter?: PartnerContractFilter): Promise<PartnerContract[]> {
    try {
      const params = new URLSearchParams();

      if (filter?.talentId) params.append("TalentId", filter.talentId.toString());
      if (filter?.excludeDeleted !== undefined) {
        params.append("ExcludeDeleted", filter.excludeDeleted ? "true" : "false");
      }

      const url = `/partnercontract${params.toString() ? `?${params}` : ""}`;
      const response = await axios.get(url);
      return response.data as PartnerContract[];
    } catch (error: unknown) {
      const axiosError = error as AxiosError;
      throw (
        axiosError.response?.data || {
          message: "Không thể tải danh sách hợp đồng đối tác",
        }
      );
    }
  },

  async getById(id: number): Promise<PartnerContract> {
    try {
      const response = await axios.get(`/partnercontract/${id}`);
      return response.data as PartnerContract;
    } catch (error: unknown) {
      const axiosError = error as AxiosError;
      throw (
        axiosError.response?.data || {
          message: "Không thể tải thông tin hợp đồng đối tác",
        }
      );
    }
  },
};


