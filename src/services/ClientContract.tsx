import axios from "../configs/axios";
import { AxiosError } from "axios";

export interface ClientContract {
  id: number;
  clientCompanyId: number;
  talentId: number;
  projectId: number;
  contractNumber: string;
  status: string;
  startDate: string;
  endDate?: string | null;
  contractFileUrl?: string | null;
}

export interface ClientContractPayload {
  clientCompanyId: number;
  talentId: number;
  projectId: number;
  contractNumber: string;
  status: string;
  startDate: string;
  endDate?: string | null;
  contractFileUrl?: string | null;
}

export interface ClientContractUpdatePayload {
  id: number;
  clientCompanyId: number;
  talentId: number;
  projectId: number;
  contractNumber: string;
  status: string;
  startDate: string;
  endDate?: string | null;
  contractFileUrl?: string | null;
}

export interface ClientContractFilter {
  clientCompanyId?: number;
  talentId?: number;
  projectId?: number;
  status?: string;
  startDateFrom?: string;
  startDateTo?: string;
  excludeDeleted?: boolean;
}

export interface ContractAdvancedStatusUpdateModel {
  newStatus: string;
  notes?: string | null;
  updatedBy?: string | null;
  effectiveDate?: string | null;
  reason?: string | null;
}

export interface ContractStatusTransitionResult {
  success: boolean;
  message: string;
  oldStatus?: string;
  newStatus?: string;
  additionalInfo?: any;
  errors?: string[];
}

export const clientContractService = {
  async getAll(filter?: ClientContractFilter) {
    try {
      const params = new URLSearchParams();

      if (filter?.clientCompanyId)
        params.append("ClientCompanyId", filter.clientCompanyId.toString());
      if (filter?.talentId)
        params.append("TalentId", filter.talentId.toString());
      if (filter?.projectId)
        params.append("ProjectId", filter.projectId.toString());
      if (filter?.status)
        params.append("Status", filter.status);
      if (filter?.startDateFrom)
        params.append("StartDateFrom", filter.startDateFrom);
      if (filter?.startDateTo)
        params.append("StartDateTo", filter.startDateTo);
      if (filter?.excludeDeleted !== undefined)
        params.append("ExcludeDeleted", filter.excludeDeleted ? "true" : "false");

      const url = `/clientcontract${params.toString() ? `?${params}` : ""}`;
      const response = await axios.get(url);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw (
          error.response?.data || { message: "Không thể tải danh sách hợp đồng khách hàng" }
        );
      throw { message: "Lỗi không xác định khi tải danh sách hợp đồng khách hàng" };
    }
  },

  async getById(id: number) {
    try {
      const response = await axios.get(`/clientcontract/${id}`);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw (
          error.response?.data || { message: "Không thể tải thông tin hợp đồng khách hàng" }
        );
      throw { message: "Lỗi không xác định khi tải thông tin hợp đồng khách hàng" };
    }
  },

  async create(payload: ClientContractPayload) {
    try {
      const response = await axios.post("/clientcontract", payload);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw (
          error.response?.data || { message: "Không thể tạo hợp đồng khách hàng mới" }
        );
      throw { message: "Lỗi không xác định khi tạo hợp đồng khách hàng" };
    }
  },

  async update(id: number, payload: Partial<ClientContractUpdatePayload>) {
    try {
      const response = await axios.put(`/clientcontract/${id}`, payload);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw (
          error.response?.data || { message: "Không thể cập nhật thông tin hợp đồng khách hàng" }
        );
      throw { message: "Lỗi không xác định khi cập nhật hợp đồng khách hàng" };
    }
  },

  async delete(id: number) {
    try {
      const response = await axios.delete(`/clientcontract/${id}`);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw (
          error.response?.data || { message: "Không thể xóa hợp đồng khách hàng" }
        );
      throw { message: "Lỗi không xác định khi xóa hợp đồng khách hàng" };
    }
  },

  async changeStatus(
    id: number,
    payload: ContractAdvancedStatusUpdateModel
  ): Promise<ContractStatusTransitionResult> {
    try {
      const response = await axios.patch(
        `/clientcontract/${id}/change-status`,
        payload
      );
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        if (error.response?.data) {
          throw error.response.data;
        }
        throw {
          success: false,
          message: "Không thể thay đổi trạng thái hợp đồng khách hàng",
        };
      }
      throw {
        success: false,
        message: "Lỗi không xác định khi thay đổi trạng thái hợp đồng khách hàng",
      };
    }
  },
};

