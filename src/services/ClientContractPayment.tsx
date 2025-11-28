import axios from "../configs/axios";
import { AxiosError } from "axios";

// Interface cho ClientContractPayment (Model trả về từ API)
export interface ClientContractPaymentModel {
  id: number;
  projectPeriodId: number;
  talentAssignmentId: number;

  // Contract Info
  contractNumber: string;

  // Currency & Exchange Rate
  unitPriceForeignCurrency: number;
  currencyCode: string;
  exchangeRate: number;

  // Calculation Method
  calculationMethod: string;
  percentageValue?: number | null;

  // Legacy fields (for backward compatibility)
  monthlyRate: number;
  standardHours: number;
  sowDescription?: string | null;

  // Contract Dates
  contractStartDate: string; // ISO string
  contractEndDate: string; // ISO string

  contractStatus: string;

  // Payment Info
  reportedHours?: number | null;
  billableHours?: number | null;
  manMonthCoefficient?: number | null;
  finalAmount?: number | null;
  finalAmountVND?: number | null;
  plannedAmount?: number | null;
  invoiceNumber?: string | null;
  invoiceDate?: string | null; // ISO string
  totalPaidAmount: number;
  lastPaymentDate?: string | null; // ISO string
  paymentStatus: string;

  // Rejection
  rejectionReason?: string | null;
  notes?: string | null;
  createdAt: string; // ISO string
  updatedAt?: string | null; // ISO string

  // Computed Property
  isFinished: boolean;

  // Navigation Properties (for display)
  projectName?: string | null;
  clientCompanyName?: string | null;
  talentName?: string | null;
  partnerName?: string | null;
}

// Interface cho ClientContractPaymentCreate (Payload để tạo mới)
export interface ClientContractPaymentCreateModel {
  projectPeriodId: number;
  talentAssignmentId: number;
  contractNumber: string;

  // Currency & Exchange Rate
  unitPriceForeignCurrency: number;
  currencyCode: string;
  exchangeRate: number;

  // Calculation Method
  calculationMethod: string;
  percentageValue?: number | null;

  // Contract Dates
  contractStartDate: string; // ISO string
  contractEndDate: string; // ISO string

  // Legacy fields
  monthlyRate: number;
  standardHours: number;
  sowDescription?: string | null;

  contractStatus: string;

  plannedAmount?: number | null;
  finalAmountVND?: number | null;
  reportedHours?: number | null;
  billableHours?: number | null;
  manMonthCoefficient?: number | null;
  finalAmount?: number | null;
  invoiceNumber?: string | null;
  invoiceDate?: string | null; // ISO string
  totalPaidAmount: number;
  lastPaymentDate?: string | null; // ISO string
  paymentStatus: string;
  rejectionReason?: string | null;
  notes?: string | null;
}

// Interface cho ClientContractPaymentFilter (Filter để lấy danh sách)
export interface ClientContractPaymentFilter {
  projectPeriodId?: number;
  talentAssignmentId?: number;
  talentId?: number;
  contractStatus?: string;
  paymentStatus?: string;
  isFinished?: boolean;
  contractDateFrom?: string; // ISO string
  contractDateTo?: string; // ISO string
  invoiceDateFrom?: string; // ISO string
  invoiceDateTo?: string; // ISO string
  paymentDateFrom?: string; // ISO string
  paymentDateTo?: string; // ISO string
  excludeDeleted?: boolean;
}

// Interface cho ClientContractPaymentCalculateModel (Payload để tính toán)
export interface ClientContractPaymentCalculateModel {
  billableHours: number;
  notes?: string | null;
}

// Interface cho SubmitContractModel (Payload để submit contract với SOW)
export interface SubmitContractModel {
  unitPriceForeignCurrency: number;
  currencyCode: string;
  exchangeRate: number;
  calculationMethod: string;
  percentageValue?: number | null;
  fixedAmount?: number | null;
  plannedAmount?: number | null;
  sowDescription?: string | null;
  sowExcelFileUrl: string;
  monthlyRate: number;
  standardHours: number;
  notes?: string | null;
}

// Interface cho VerifyContractModel (Payload để verify contract)
export interface VerifyContractModel {
  notes?: string | null;
  // File hợp đồng chuẩn sẽ được upload riêng
}

// Interface cho RecordPaymentModel (Payload để ghi nhận thanh toán)
export interface RecordPaymentModel {
  receivedAmount: number;
  paymentDate: string; // ISO string
  notes?: string | null;
}

// Interface cho CreateInvoiceModel (Payload để tạo hóa đơn)
export interface CreateInvoiceModel {
  invoiceNumber: string;
  invoiceDate: string; // ISO string
  notes?: string | null;
  // File invoice sẽ được upload riêng
}

// Interface cho RejectContractModel (Payload để reject contract)
export interface RejectContractModel {
  rejectionReason: string;
}

export const clientContractPaymentService = {
  // Lấy danh sách ClientContractPayment với filter
  async getAll(filter?: ClientContractPaymentFilter) {
    try {
      const params = new URLSearchParams();

      if (filter?.projectPeriodId)
        params.append("ProjectPeriodId", filter.projectPeriodId.toString());
      if (filter?.talentAssignmentId)
        params.append("TalentAssignmentId", filter.talentAssignmentId.toString());
      if (filter?.talentId)
        params.append("TalentId", filter.talentId.toString());
      if (filter?.contractStatus)
        params.append("ContractStatus", filter.contractStatus);
      if (filter?.paymentStatus)
        params.append("PaymentStatus", filter.paymentStatus);
      if (filter?.isFinished !== undefined)
        params.append("IsFinished", filter.isFinished ? "true" : "false");
      if (filter?.contractDateFrom)
        params.append("ContractDateFrom", filter.contractDateFrom);
      if (filter?.contractDateTo)
        params.append("ContractDateTo", filter.contractDateTo);
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
      return response.data as ClientContractPaymentModel[];
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw error.response?.data || { message: "Không thể tải danh sách hợp đồng thanh toán khách hàng" };
      throw { message: "Lỗi không xác định khi tải danh sách hợp đồng thanh toán khách hàng" };
    }
  },

  // Lấy ClientContractPayment theo id
  async getById(id: number) {
    try {
      const response = await axios.get(`/clientcontractpayment/${id}`);
      return response.data as ClientContractPaymentModel;
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw error.response?.data || { message: "Không thể tải thông tin hợp đồng thanh toán khách hàng" };
      throw { message: "Lỗi không xác định khi tải thông tin hợp đồng thanh toán khách hàng" };
    }
  },

  // Tạo mới ClientContractPayment
  async create(payload: ClientContractPaymentCreateModel) {
    try {
      const response = await axios.post("/clientcontractpayment", payload);
      return response.data as ClientContractPaymentModel;
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw error.response?.data || { message: "Không thể tạo hợp đồng thanh toán khách hàng" };
      throw { message: "Lỗi không xác định khi tạo hợp đồng thanh toán khách hàng" };
    }
  },

  // Cập nhật ClientContractPayment
  async update(id: number, payload: Partial<ClientContractPaymentCreateModel>) {
    try {
      const response = await axios.put(`/clientcontractpayment/${id}`, payload);
      return response.data as ClientContractPaymentModel;
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw error.response?.data || { message: "Không thể cập nhật hợp đồng thanh toán khách hàng" };
      throw { message: "Lỗi không xác định khi cập nhật hợp đồng thanh toán khách hàng" };
    }
  },

  // Request more information - Yêu cầu thêm thông tin
  async requestMoreInformation(id: number) {
    try {
      const response = await axios.post(`/clientcontractpayment/${id}/request-more-information`);
      return response.data as ClientContractPaymentModel;
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw error.response?.data || { message: "Không thể yêu cầu thêm thông tin" };
      throw { message: "Lỗi không xác định khi yêu cầu thêm thông tin" };
    }
  },

  // Submit contract - Sales gửi hợp đồng kèm SOW
  async submitContract(id: number, payload: SubmitContractModel) {
    try {
      const response = await axios.post(`/clientcontractpayment/${id}/submit-contract`, payload);
      return response.data as ClientContractPaymentModel;
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw error.response?.data || { message: "Không thể gửi hợp đồng" };
      throw { message: "Lỗi không xác định khi gửi hợp đồng" };
    }
  },

  // Verify contract - Accountant xác minh hợp đồng
  async verifyContract(id: number, payload: VerifyContractModel) {
    try {
      const response = await axios.post(`/clientcontractpayment/${id}/verify-contract`, payload);
      return response.data as ClientContractPaymentModel;
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw error.response?.data || { message: "Không thể xác minh hợp đồng" };
      throw { message: "Lỗi không xác định khi xác minh hợp đồng" };
    }
  },

  // Approve contract - Manager duyệt hợp đồng
  async approveContract(id: number) {
    try {
      const response = await axios.post(`/clientcontractpayment/${id}/approve-contract`);
      return response.data as ClientContractPaymentModel;
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw error.response?.data || { message: "Không thể duyệt hợp đồng" };
      throw { message: "Lỗi không xác định khi duyệt hợp đồng" };
    }
  },

  // Reject contract - Từ chối hợp đồng
  async rejectContract(id: number, payload: RejectContractModel) {
    try {
      const response = await axios.post(`/clientcontractpayment/${id}/reject-contract`, payload);
      return response.data as ClientContractPaymentModel;
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw error.response?.data || { message: "Không thể từ chối hợp đồng" };
      throw { message: "Lỗi không xác định khi từ chối hợp đồng" };
    }
  },

  // Start billing - Bắt đầu tính toán
  async startBilling(id: number, payload: ClientContractPaymentCalculateModel) {
    try {
      const response = await axios.post(`/clientcontractpayment/${id}/start-billing`, payload);
      return response.data as ClientContractPaymentModel;
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw error.response?.data || { message: "Không thể bắt đầu tính toán" };
      throw { message: "Lỗi không xác định khi bắt đầu tính toán" };
    }
  },

  // Create invoice - Tạo hóa đơn
  async createInvoice(id: number, payload: CreateInvoiceModel) {
    try {
      const response = await axios.post(`/clientcontractpayment/${id}/create-invoice`, payload);
      return response.data as ClientContractPaymentModel;
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw error.response?.data || { message: "Không thể tạo hóa đơn" };
      throw { message: "Lỗi không xác định khi tạo hóa đơn" };
    }
  },

  // Record payment - Ghi nhận thanh toán
  async recordPayment(id: number, payload: RecordPaymentModel) {
    try {
      const response = await axios.post(`/clientcontractpayment/${id}/record-payment`, payload);
      return response.data as ClientContractPaymentModel;
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw error.response?.data || { message: "Không thể ghi nhận thanh toán" };
      throw { message: "Lỗi không xác định khi ghi nhận thanh toán" };
    }
  },
};
