import axios from "../configs/axios";
import type { AxiosError } from "axios";

// NOTE:
// Tương tự PartnerContract, backend hiện được thiết kế chủ yếu quanh ClientContractPayment.
// Ở đây ta chỉ tạo ra model ClientContract tối thiểu để dùng cho các màn hình Developer & Sales.

export interface ClientContract {
  id: number;
  contractNumber: string;
  talentId: number;
  clientCompanyId: number;
  projectId: number;
  status: string;
  startDate: string;
  endDate?: string | null;
  contractFileUrl?: string | null;
}

export interface ClientContractFilter {
  talentId?: number;
  excludeDeleted?: boolean;
}

export const clientContractService = {
  async getAll(filter?: ClientContractFilter): Promise<ClientContract[]> {
    try {
      const params = new URLSearchParams();

      if (filter?.talentId) params.append("TalentId", filter.talentId.toString());
      if (filter?.excludeDeleted !== undefined) {
        params.append("ExcludeDeleted", filter.excludeDeleted ? "true" : "false");
      }

      const url = `/clientcontract${params.toString() ? `?${params}` : ""}`;
      const response = await axios.get(url);
      return response.data as ClientContract[];
    } catch (error: unknown) {
      const axiosError = error as AxiosError;
      throw (
        axiosError.response?.data || {
          message: "Không thể tải danh sách hợp đồng khách hàng",
        }
      );
    }
  },

  async getById(id: number): Promise<ClientContract> {
    try {
      const response = await axios.get(`/clientcontract/${id}`);
      return response.data as ClientContract;
    } catch (error: unknown) {
      const axiosError = error as AxiosError;
      throw (
        axiosError.response?.data || {
          message: "Không thể tải thông tin hợp đồng khách hàng",
        }
      );
    }
  },
};


