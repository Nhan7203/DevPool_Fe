import axios from "../configs/axios";
import { AxiosError } from "axios";

// Interface cho ClientJobRoleLevel (Model trả về từ API)
export interface ClientJobRoleLevel {
  id: number;
  clientCompanyId: number;
  jobRoleLevelId: number;
  expectedMinRate?: number | null;
  expectedMaxRate?: number | null;
  currency?: string | null;
  notes?: string | null;
}

// Interface cho ClientJobRoleLevelCreate (Payload để tạo mới)
export interface ClientJobRoleLevelCreate {
  clientCompanyId: number;
  jobRoleLevelId: number;
  expectedMinRate?: number | null;
  expectedMaxRate?: number | null;
  currency?: string | null;
  notes?: string | null;
}

// Interface cho ClientJobRoleLevelFilter (Filter để lấy danh sách)
export interface ClientJobRoleLevelFilter {
  clientCompanyId?: number;
  jobRoleLevelId?: number;
  currency?: string;
  excludeDeleted?: boolean;
}

export const clientJobRoleLevelService = {
  // Lấy danh sách ClientJobRoleLevel với filter
  async getAll(filter?: ClientJobRoleLevelFilter) {
    try {
      const params = new URLSearchParams();

      if (filter?.clientCompanyId)
        params.append("ClientCompanyId", filter.clientCompanyId.toString());
      if (filter?.jobRoleLevelId)
        params.append("JobRoleLevelId", filter.jobRoleLevelId.toString());
      if (filter?.currency)
        params.append("Currency", filter.currency);
      if (filter?.excludeDeleted !== undefined)
        params.append("ExcludeDeleted", filter.excludeDeleted ? "true" : "false");

      const url = `/clientjobrolelevel${params.toString() ? `?${params}` : ""}`;
      const response = await axios.get(url);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw error.response?.data || { message: "Không thể tải danh sách job role level khách hàng" };
      throw { message: "Lỗi không xác định khi tải danh sách job role level khách hàng" };
    }
  },

  // Lấy ClientJobRoleLevel theo id
  async getById(id: number) {
    try {
      const response = await axios.get(`/clientjobrolelevel/${id}`);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw error.response?.data || { message: "Không thể tải thông tin job role level khách hàng" };
      throw { message: "Lỗi không xác định khi tải dữ liệu" };
    }
  },

  // Tạo mới ClientJobRoleLevel
  async create(payload: ClientJobRoleLevelCreate) {
    try {
      const response = await axios.post("/clientjobrolelevel", payload);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw error.response?.data || { message: "Không thể tạo job role level khách hàng" };
      throw { message: "Lỗi không xác định khi tạo job role level khách hàng" };
    }
  },
};

