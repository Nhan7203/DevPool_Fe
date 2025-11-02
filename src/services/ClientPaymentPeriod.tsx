import axios from "../configs/axios";
import { AxiosError } from "axios";

// Interface cho ClientPaymentPeriod (Model trả về từ API)
export interface ClientPaymentPeriod {
  id: number;
  clientCompanyId: number;
  periodMonth: number;
  periodYear: number;
  status: string;
}

// Interface cho ClientPaymentPeriodCreate (Payload để tạo mới)
export interface ClientPaymentPeriodCreate {
  clientCompanyId: number;
  periodMonth: number;
  periodYear: number;
  status: string;
}

// Interface cho ClientPaymentPeriodFilter (Filter để lấy danh sách)
export interface ClientPaymentPeriodFilter {
  clientCompanyId?: number;
  periodMonth?: number;
  periodYear?: number;
  status?: string;
  excludeDeleted?: boolean;
}

export const clientPaymentPeriodService = {
  // Lấy danh sách ClientPaymentPeriod với filter
  async getAll(filter?: ClientPaymentPeriodFilter) {
    try {
      const params = new URLSearchParams();

      if (filter?.clientCompanyId)
        params.append("ClientCompanyId", filter.clientCompanyId.toString());
      if (filter?.periodMonth)
        params.append("PeriodMonth", filter.periodMonth.toString());
      if (filter?.periodYear)
        params.append("PeriodYear", filter.periodYear.toString());
      if (filter?.status)
        params.append("Status", filter.status);
      if (filter?.excludeDeleted !== undefined)
        params.append("ExcludeDeleted", filter.excludeDeleted ? "true" : "false");

      const url = `/clientpaymentperiod${params.toString() ? `?${params}` : ""}`;
      const response = await axios.get(url);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw error.response?.data || { message: "Không thể tải danh sách kỳ thanh toán khách hàng" };
      throw { message: "Lỗi không xác định khi tải danh sách kỳ thanh toán khách hàng" };
    }
  },

  // Lấy ClientPaymentPeriod theo id
  async getById(id: number) {
    try {
      const response = await axios.get(`/clientpaymentperiod/${id}`);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw error.response?.data || { message: "Không thể tải thông tin kỳ thanh toán khách hàng" };
      throw { message: "Lỗi không xác định khi tải dữ liệu" };
    }
  },

  // Tạo mới ClientPaymentPeriod
  async create(payload: ClientPaymentPeriodCreate) {
    try {
      const response = await axios.post("/clientpaymentperiod", payload);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw error.response?.data || { message: "Không thể tạo kỳ thanh toán khách hàng" };
      throw { message: "Lỗi không xác định khi tạo kỳ thanh toán khách hàng" };
    }
  },
};

