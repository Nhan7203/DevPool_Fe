import axios from "../configs/axios";
import { AxiosError } from "axios";

// Interface cho PartnerContractPayment (Model trả về từ API)
export interface PartnerContractPaymentModel {
  id: number;
  projectPeriodId: number;
  talentAssignmentId: number;

  // Contract Info
  contractNumber: string;
  monthlyRate: number;
  contractStatus: string;

  // Payment Info
  reportedHours?: number | null;
  manMonthCoefficient?: number | null;
  finalAmount?: number | null;
  totalPaidAmount: number;
  paymentDate?: string | null; // ISO string
  paymentStatus: string;

  // Rejection
  rejectionReason?: string | null;
  notes?: string | null;
  createdAt: string; // ISO string
  updatedAt?: string | null; // ISO string
}

// Interface cho PartnerContractPaymentCreate (Payload để tạo mới)
export interface PartnerContractPaymentCreateModel {
  projectPeriodId: number;
  talentAssignmentId: number;
  contractNumber: string;
  monthlyRate: number;
  contractStatus: string;
  reportedHours?: number | null;
  manMonthCoefficient?: number | null;
  finalAmount?: number | null;
  totalPaidAmount: number;
  paymentDate?: string | null; // ISO string
  paymentStatus: string;
  rejectionReason?: string | null;
  notes?: string | null;
}

// Interface cho PartnerContractPaymentFilter (Filter để lấy danh sách)
export interface PartnerContractPaymentFilter {
  projectPeriodId?: number;
  talentAssignmentId?: number;
  talentId?: number;
  contractStatus?: string;
  paymentStatus?: string;
  paymentDateFrom?: string; // ISO string
  paymentDateTo?: string; // ISO string
  excludeDeleted?: boolean;
}

// Interface cho PartnerContractPaymentCalculateModel (Payload để tính toán)
export interface PartnerContractPaymentCalculateModel {
  actualWorkHours: number;
  otHours?: number | null;
  notes?: string | null;
}

// Interface cho MarkAsPaidModel (Payload để ghi nhận đã chi trả)
export interface PartnerContractPaymentMarkAsPaidModel {
  paidAmount: number;
  paymentDate: string; // ISO string
  notes?: string | null;
}

export const partnerContractPaymentService = {
  // Lấy danh sách PartnerContractPayment với filter
  async getAll(filter?: PartnerContractPaymentFilter) {
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
      if (filter?.paymentDateFrom)
        params.append("PaymentDateFrom", filter.paymentDateFrom);
      if (filter?.paymentDateTo)
        params.append("PaymentDateTo", filter.paymentDateTo);
      if (filter?.excludeDeleted !== undefined)
        params.append("ExcludeDeleted", filter.excludeDeleted ? "true" : "false");

      const url = `/partnercontractpayment${params.toString() ? `?${params}` : ""}`;
      const response = await axios.get(url);
      return response.data as PartnerContractPaymentModel[];
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw error.response?.data || { message: "Không thể tải danh sách thanh toán hợp đồng đối tác" };
      throw { message: "Lỗi không xác định khi tải danh sách thanh toán hợp đồng đối tác" };
    }
  },

  // Lấy PartnerContractPayment theo id
  async getById(id: number) {
    try {
      const response = await axios.get(`/partnercontractpayment/${id}`);
      return response.data as PartnerContractPaymentModel;
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw error.response?.data || { message: "Không thể tải thông tin thanh toán hợp đồng đối tác" };
      throw { message: "Lỗi không xác định khi tải thông tin thanh toán hợp đồng đối tác" };
    }
  },

  // Tạo mới PartnerContractPayment
  async create(payload: PartnerContractPaymentCreateModel) {
    try {
      const response = await axios.post("/partnercontractpayment", payload);
      return response.data as PartnerContractPaymentModel;
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw error.response?.data || { message: "Không thể tạo thanh toán hợp đồng đối tác" };
      throw { message: "Lỗi không xác định khi tạo thanh toán hợp đồng đối tác" };
    }
  },

  // Cập nhật PartnerContractPayment
  async update(id: number, payload: Partial<PartnerContractPaymentCreateModel>) {
    try {
      const response = await axios.put(`/partnercontractpayment/${id}`, payload);
      return response.data as PartnerContractPaymentModel;
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw error.response?.data || { message: "Không thể cập nhật thanh toán hợp đồng đối tác" };
      throw { message: "Lỗi không xác định khi cập nhật thanh toán hợp đồng đối tác" };
    }
  },

  // Verify contract - Xác minh hợp đồng
  async verifyContract(id: number) {
    try {
      const response = await axios.post(`/partnercontractpayment/${id}/verify-contract`);
      return response.data as PartnerContractPaymentModel;
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw error.response?.data || { message: "Không thể xác minh hợp đồng" };
      throw { message: "Lỗi không xác định khi xác minh hợp đồng" };
    }
  },

  // Approve contract - Phê duyệt hợp đồng
  async approveContract(id: number) {
    try {
      const response = await axios.post(`/partnercontractpayment/${id}/approve-contract`);
      return response.data as PartnerContractPaymentModel;
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw error.response?.data || { message: "Không thể phê duyệt hợp đồng" };
      throw { message: "Lỗi không xác định khi phê duyệt hợp đồng" };
    }
  },

  // Start billing - Bắt đầu thanh toán
  async startBilling(id: number, payload: PartnerContractPaymentCalculateModel) {
    try {
      const response = await axios.post(`/partnercontractpayment/${id}/start-billing`, payload);
      return response.data as PartnerContractPaymentModel;
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw error.response?.data || { message: "Không thể bắt đầu thanh toán" };
      throw { message: "Lỗi không xác định khi bắt đầu thanh toán" };
    }
  },

  // Mark as paid - Đánh dấu đã thanh toán
  async markAsPaid(id: number, payload: PartnerContractPaymentMarkAsPaidModel) {
    try {
      const response = await axios.post(`/partnercontractpayment/${id}/mark-as-paid`, payload);
      return response.data as PartnerContractPaymentModel;
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw error.response?.data || { message: "Không thể đánh dấu đã thanh toán" };
      throw { message: "Lỗi không xác định khi đánh dấu đã thanh toán" };
    }
  },
};
