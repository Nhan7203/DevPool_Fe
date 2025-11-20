import axios from "../configs/axios";
import { AxiosError } from "axios";

// Interface cho PartnerContractPayment (Model trả về từ API)
export interface PartnerContractPayment {
  id: number;
  partnerPeriodId: number;
  partnerContractId: number;
  talentId: number;
  actualWorkHours: number;
  otHours?: number | null;
  calculatedAmount?: number | null;
  paidAmount?: number | null;
  paymentDate?: string | null; // DateTime được trả về dưới dạng string ISO
  status: string;
  notes?: string | null;
}

// Interface cho PartnerContractPaymentCreate (Payload để tạo mới)
export interface PartnerContractPaymentCreate {
  partnerPeriodId: number;
  partnerContractId: number;
  talentId: number;
  actualWorkHours: number;
  otHours?: number | null;
  calculatedAmount?: number | null;
  paidAmount?: number | null;
  paymentDate?: string | null; // DateTime dưới dạng string ISO
  status: string;
  notes?: string | null;
}

// Interface cho PartnerContractPaymentFilter (Filter để lấy danh sách)
export interface PartnerContractPaymentFilter {
  partnerPeriodId?: number;
  partnerContractId?: number;
  talentId?: number;
  status?: string;
  paymentDateFrom?: string; // DateTime dưới dạng string ISO
  paymentDateTo?: string; // DateTime dưới dạng string ISO
  excludeDeleted?: boolean;
}

// Interface cho PartnerContractPaymentCalculateModel (Payload để tính toán và submit)
export interface PartnerContractPaymentCalculateModel {
  actualWorkHours: number;
  otHours?: number | null;
  notes?: string | null;
}

// Interface cho PartnerContractPaymentApproveModel (Payload để approve)
export interface PartnerContractPaymentApproveModel {
  notes?: string | null;
}

// Interface cho PartnerContractPaymentRejectModel (Payload để reject)
export interface PartnerContractPaymentRejectModel {
  rejectionReason: string;
}

// Interface cho PartnerContractPaymentMarkAsPaidModel (Payload để ghi nhận đã chi trả)
export interface PartnerContractPaymentMarkAsPaidModel {
  paidAmount: number;
  paymentDate: string; // DateTime dưới dạng string ISO
  notes?: string | null;
}

export const partnerContractPaymentService = {
  // Lấy danh sách PartnerContractPayment với filter
  async getAll(filter?: PartnerContractPaymentFilter) {
    try {
      const params = new URLSearchParams();

      if (filter?.partnerPeriodId)
        params.append("PartnerPeriodId", filter.partnerPeriodId.toString());
      if (filter?.partnerContractId)
        params.append("PartnerContractId", filter.partnerContractId.toString());
      if (filter?.talentId)
        params.append("TalentId", filter.talentId.toString());
      if (filter?.status)
        params.append("Status", filter.status);
      if (filter?.paymentDateFrom)
        params.append("PaymentDateFrom", filter.paymentDateFrom);
      if (filter?.paymentDateTo)
        params.append("PaymentDateTo", filter.paymentDateTo);
      if (filter?.excludeDeleted !== undefined)
        params.append("ExcludeDeleted", filter.excludeDeleted ? "true" : "false");

      const url = `/partnercontractpayment${params.toString() ? `?${params}` : ""}`;
      const response = await axios.get(url);
      return response.data;
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
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw error.response?.data || { message: "Không thể tải thông tin thanh toán hợp đồng đối tác" };
      throw { message: "Lỗi không xác định khi tải dữ liệu" };
    }
  },

  // Tạo mới PartnerContractPayment
  async create(payload: PartnerContractPaymentCreate) {
    try {
      const response = await axios.post("/partnercontractpayment", payload);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw error.response?.data || { message: "Không thể tạo thanh toán hợp đồng đối tác" };
      throw { message: "Lỗi không xác định khi tạo thanh toán hợp đồng đối tác" };
    }
  },

  // Cập nhật PartnerContractPayment
  async update(id: number, payload: Partial<PartnerContractPaymentCreate>) {
    try {
      const response = await axios.put(`/partnercontractpayment/${id}`, payload);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw error.response?.data || { message: "Không thể cập nhật thanh toán hợp đồng đối tác" };
      throw { message: "Lỗi không xác định khi cập nhật thanh toán hợp đồng đối tác" };
    }
  },

  // Tính toán và submit PartnerContractPayment
  async calculateAndSubmit(id: number, payload: PartnerContractPaymentCalculateModel) {
    try {
      const requestPayload = {
        ActualWorkHours: payload.actualWorkHours,
        OTHours: payload.otHours ?? null,
        Notes: payload.notes ?? null
      };
      const response = await axios.post(`/partnercontractpayment/${id}/calculate-and-submit`, requestPayload);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw error.response?.data || { message: "Không thể tính toán và submit thanh toán hợp đồng đối tác" };
      throw { message: "Lỗi không xác định khi tính toán và submit thanh toán hợp đồng đối tác" };
    }
  },

  // Approve PartnerContractPayment
  async approve(id: number, payload: PartnerContractPaymentApproveModel) {
    try {
      const requestPayload = {
        Notes: payload.notes ?? null
      };
      const response = await axios.post(`/partnercontractpayment/${id}/approve`, requestPayload);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw error.response?.data || { message: "Không thể duyệt thanh toán hợp đồng đối tác" };
      throw { message: "Lỗi không xác định khi duyệt thanh toán hợp đồng đối tác" };
    }
  },

  // Reject PartnerContractPayment
  async reject(id: number, payload: PartnerContractPaymentRejectModel) {
    try {
      const requestPayload = {
        RejectionReason: payload.rejectionReason
      };
      const response = await axios.post(`/partnercontractpayment/${id}/reject`, requestPayload);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw error.response?.data || { message: "Không thể từ chối thanh toán hợp đồng đối tác" };
      throw { message: "Lỗi không xác định khi từ chối thanh toán hợp đồng đối tác" };
    }
  },

  // Mark as paid - Ghi nhận đã chi trả
  async markAsPaid(id: number, payload: PartnerContractPaymentMarkAsPaidModel) {
    try {
      const requestPayload = {
        PaidAmount: payload.paidAmount,
        PaymentDate: payload.paymentDate,
        Notes: payload.notes ?? null
      };
      const response = await axios.post(`/partnercontractpayment/${id}/mark-as-paid`, requestPayload);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw error.response?.data || { message: "Không thể ghi nhận đã chi trả" };
      throw { message: "Lỗi không xác định khi ghi nhận đã chi trả" };
    }
  },
};

