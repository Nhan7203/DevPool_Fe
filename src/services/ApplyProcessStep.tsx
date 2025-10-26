import axios from "../configs/axios";
import { AxiosError } from "axios";

export interface ApplyProcessStep {
  id: number;
  templateId: number;
  stepOrder: number;
  stepName: string;
  description: string;
  estimatedDays: number;
}

export interface ApplyProcessStepFilter {
  templateId?: number;
  stepName?: string;
  minEstimatedDays?: number;
  maxEstimatedDays?: number;
  excludeDeleted?: boolean;
}

export interface ApplyProcessStepCreate {
  templateId: number;
  stepOrder: number;
  stepName: string;
  description: string;
  estimatedDays: number;
}

export const applyProcessStepService = {
  async getAll(filter?: ApplyProcessStepFilter) {
    try {
      const params = new URLSearchParams();
      if (filter?.templateId) params.append("TemplateId", filter.templateId.toString());
      if (filter?.stepName) params.append("StepName", filter.stepName);
      if (filter?.minEstimatedDays) params.append("MinEstimatedDays", filter.minEstimatedDays.toString());
      if (filter?.maxEstimatedDays) params.append("MaxEstimatedDays", filter.maxEstimatedDays.toString());
      if (filter?.excludeDeleted !== undefined) params.append("ExcludeDeleted", filter.excludeDeleted.toString());
      const url = `/applyprocessstep${params.toString() ? `?${params}` : ""}`;
      const response = await axios.get(url);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw error.response?.data || { message: "Failed to fetch apply process steps" };
      throw { message: "Unexpected error occurred" };
    }
  },

  async getById(id: number) {
    try {
      const response = await axios.get(`/applyprocessstep/${id}`);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw error.response?.data || { message: "Failed to fetch apply process step details" };
      throw { message: "Unexpected error occurred" };
    }
  },

  async create(payload: ApplyProcessStepCreate) {
    try {
      const response = await axios.post("/applyprocessstep", payload);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw error.response?.data || { message: "Failed to create new apply process step" };
      throw { message: "Unexpected error occurred during creation" };
    }
  },

  async update(id: number, payload: Partial<ApplyProcessStepCreate>) {
    try {
      const response = await axios.put(`/applyprocessstep/${id}`, payload);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw error.response?.data || { message: "Failed to update apply process step" };
      throw { message: "Unexpected error occurred" };
    }
  },

  async deleteById(id: number) {
    try {
      const response = await axios.delete(`/applyprocessstep/${id}`);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw error.response?.data || { message: "Failed to delete apply process step" };
      throw { message: "Unexpected error occurred" };
    }
  },
};
