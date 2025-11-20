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

// Interface cho ClientContractPaymentCalculateModel (Payload để tính toán và submit)
export interface ClientContractPaymentCalculateModel {
  billableHours?: number | null;
  notes?: string | null;
}

// Interface cho ApproveForInvoicingModel (Payload để approve for invoicing)
export interface ApproveForInvoicingModel {
  paymentIds: number[];
  notes?: string | null;
}

// Interface cho RecordInvoiceModel (Payload để ghi nhận hóa đơn)
export interface RecordInvoiceModel {
  invoiceNumber: string;
  invoiceDate: string; // DateTime dưới dạng string ISO
  invoicedAmount: number;
  notes?: string | null;
}

// Interface cho RecordPaymentModel (Payload để ghi nhận thanh toán)
export interface RecordPaymentModel {
  receivedAmount: number;
  paymentDate: string; // DateTime dưới dạng string ISO
  notes?: string | null;
}

// Interface cho RejectModel (Payload để reject)
export interface RejectModel {
  rejectionReason: string;
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

  // Tính toán và submit ClientContractPayment
  async calculateAndSubmit(id: number, payload: ClientContractPaymentCalculateModel) {
    try {
      // Map sang PascalCase để khớp với C# model
      const requestPayload = {
        BillableHours: payload.billableHours ?? null,
        Notes: payload.notes ?? null
      };
      const response = await axios.post(`/clientcontractpayment/${id}/calculate-and-submit`, requestPayload);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw error.response?.data || { message: "Không thể tính toán và submit thanh toán hợp đồng khách hàng" };
      throw { message: "Lỗi không xác định khi tính toán và submit thanh toán hợp đồng khách hàng" };
    }
  },

  // Approve for invoicing - Duyệt để xuất hóa đơn
  async approveForInvoicing(payload: ApproveForInvoicingModel) {
    try {
      const requestPayload = {
        PaymentIds: payload.paymentIds,
        Notes: payload.notes ?? null
      };
      const response = await axios.post("/clientcontractpayment/approve-for-invoicing", requestPayload);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw error.response?.data || { message: "Không thể duyệt để xuất hóa đơn" };
      throw { message: "Lỗi không xác định khi duyệt để xuất hóa đơn" };
    }
  },

  // Record invoice - Ghi nhận hóa đơn
  async recordInvoice(id: number, payload: RecordInvoiceModel) {
    try {
      const requestPayload = {
        InvoiceNumber: payload.invoiceNumber,
        InvoiceDate: payload.invoiceDate,
        InvoicedAmount: payload.invoicedAmount,
        Notes: payload.notes ?? null
      };
      const response = await axios.post(`/clientcontractpayment/${id}/record-invoice`, requestPayload);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw error.response?.data || { message: "Không thể ghi nhận hóa đơn" };
      throw { message: "Lỗi không xác định khi ghi nhận hóa đơn" };
    }
  },

  // Record payment - Ghi nhận thanh toán
  async recordPayment(id: number, payload: RecordPaymentModel) {
    try {
      const requestPayload = {
        ReceivedAmount: payload.receivedAmount,
        PaymentDate: payload.paymentDate,
        Notes: payload.notes ?? null
      };
      const response = await axios.post(`/clientcontractpayment/${id}/record-payment`, requestPayload);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw error.response?.data || { message: "Không thể ghi nhận thanh toán" };
      throw { message: "Lỗi không xác định khi ghi nhận thanh toán" };
    }
  },

  // Reject - Từ chối xuất hóa đơn
  async reject(id: number, payload: RejectModel) {
    try {
      const requestPayload = {
        RejectionReason: payload.rejectionReason
      };
      const response = await axios.post(`/clientcontractpayment/${id}/reject`, requestPayload);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw error.response?.data || { message: "Không thể từ chối xuất hóa đơn" };
      throw { message: "Lỗi không xác định khi từ chối xuất hóa đơn" };
    }
  },
};

