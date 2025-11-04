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
};

