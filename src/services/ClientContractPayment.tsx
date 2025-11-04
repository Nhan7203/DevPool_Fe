import axios from "../configs/axios";
import { AxiosError } from "axios";

// Interface cho ClientContractPayment (Model trả về từ API)
export interface ClientContractPayment {
  id: number;
  clientPeriodId: number;
  clientContractId: number;
  billableHours: number;
  calculatedAmount?: number | null;
  invoicedAmount?: number | null;
  receivedAmount?: number | null;
  invoiceNumber?: string | null;
  invoiceDate?: string | null; // DateTime được trả về dưới dạng string ISO
  paymentDate?: string | null; // DateTime được trả về dưới dạng string ISO
  status: string;
  notes?: string | null;
}

// Interface cho ClientContractPaymentCreate (Payload để tạo mới)
export interface ClientContractPaymentCreate {
  clientPeriodId: number;
  clientContractId: number;
  billableHours: number;
  calculatedAmount?: number | null;
  invoicedAmount?: number | null;
  receivedAmount?: number | null;
  invoiceNumber?: string | null;
  invoiceDate?: string | null; // DateTime dưới dạng string ISO
  paymentDate?: string | null; // DateTime dưới dạng string ISO
  status: string;
  notes?: string | null;
}

// Interface cho ClientContractPaymentFilter (Filter để lấy danh sách)
export interface ClientContractPaymentFilter {
  clientPeriodId?: number;
  clientContractId?: number;
  status?: string;
  invoiceDateFrom?: string; // DateTime dưới dạng string ISO
  invoiceDateTo?: string; // DateTime dưới dạng string ISO
  paymentDateFrom?: string; // DateTime dưới dạng string ISO
  paymentDateTo?: string; // DateTime dưới dạng string ISO
  excludeDeleted?: boolean;
}

export const clientContractPaymentService = {
  // Lấy danh sách ClientContractPayment với filter
  async getAll(filter?: ClientContractPaymentFilter) {
    try {
      const params = new URLSearchParams();

      if (filter?.clientPeriodId)
        params.append("ClientPeriodId", filter.clientPeriodId.toString());
      if (filter?.clientContractId)
        params.append("ClientContractId", filter.clientContractId.toString());
      if (filter?.status)
        params.append("Status", filter.status);
      if (filter?.invoiceDateFrom)
        params.append("InvoiceDateFrom", filter.invoiceDateFrom);
      if (filter?.invoiceDateTo)
        params.append("InvoiceDateTo", filter.invoiceDateTo);
      if (filter?.paymentDateFrom)
        params.append("PaymentDateFrom", filter.paymentDateFrom);
      if (filter?.paymentDateTo)
        params.append("PaymentDateTo", filter.paymentDateTo);
      if (filter?.excludeDeleted !== undefined)
        params.append("ExcludeDeleted", filter.excludeDeleted ? "true" : "false");

      const url = `/clientcontractpayment${params.toString() ? `?${params}` : ""}`;
      const response = await axios.get(url);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw error.response?.data || { message: "Không thể tải danh sách thanh toán hợp đồng khách hàng" };
      throw { message: "Lỗi không xác định khi tải danh sách thanh toán hợp đồng khách hàng" };
    }
  },

  // Lấy ClientContractPayment theo id
  async getById(id: number) {
    try {
      const response = await axios.get(`/clientcontractpayment/${id}`);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw error.response?.data || { message: "Không thể tải thông tin thanh toán hợp đồng khách hàng" };
      throw { message: "Lỗi không xác định khi tải dữ liệu" };
    }
  },

  // Tạo mới ClientContractPayment
  async create(payload: ClientContractPaymentCreate) {
    try {
      const response = await axios.post("/clientcontractpayment", payload);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw error.response?.data || { message: "Không thể tạo thanh toán hợp đồng khách hàng" };
      throw { message: "Lỗi không xác định khi tạo thanh toán hợp đồng khách hàng" };
    }
  },

  // Cập nhật ClientContractPayment
  async update(id: number, payload: Partial<ClientContractPaymentCreate>) {
    try {
      const response = await axios.put(`/clientcontractpayment/${id}`, payload);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw error.response?.data || { message: "Không thể cập nhật thanh toán hợp đồng khách hàng" };
      throw { message: "Lỗi không xác định khi cập nhật thanh toán hợp đồng khách hàng" };
    }
  },
};

