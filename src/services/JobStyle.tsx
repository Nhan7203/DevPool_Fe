import axios from "../configs/axios";
import { AxiosError } from "axios";

export interface JobStyle {
  id: number;
  workingStyleId: number;
  jobRequestId: number;
}

export interface JobStyleFilter {
  workingStyleId?: number;
  jobRequestId?: number;
  excludeDeleted?: boolean;
}

export interface JobStyleCreate {
  workingStyleId: number;
  jobRequestId: number;
}

export const jobStyleService = {
  async getAll(filter?: JobStyleFilter) {
    try {
      const params = new URLSearchParams();
      if (filter?.workingStyleId) params.append("WorkingStyleId", filter.workingStyleId.toString());
      if (filter?.jobRequestId) params.append("JobRequestId", filter.jobRequestId.toString());
      if (filter?.excludeDeleted !== undefined) params.append("ExcludeDeleted", filter.excludeDeleted.toString());
      const url = `/jobstyle${params.toString() ? `?${params}` : ""}`;
      const response = await axios.get(url);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw error.response?.data || { message: "Failed to fetch job styles" };
      throw { message: "Unexpected error occurred" };
    }
  },

  async getById(id: number) {
    try {
      const response = await axios.get(`/jobstyle/${id}`);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw error.response?.data || { message: "Failed to fetch job style details" };
      throw { message: "Unexpected error occurred" };
    }
  },

  async create(payload: JobStyleCreate) {
    try {
      const response = await axios.post("/jobstyle", payload);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw error.response?.data || { message: "Failed to create new job style" };
      throw { message: "Unexpected error occurred during creation" };
    }
  },

  async update(id: number, payload: Partial<JobStyleCreate>) {
    try {
      const response = await axios.put(`/jobstyle/${id}`, payload);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw error.response?.data || { message: "Failed to update job style" };
      throw { message: "Unexpected error occurred" };
    }
  },

  async deleteById(id: number) {
    try {
      const response = await axios.delete(`/jobstyle/${id}`);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError)
        throw error.response?.data || { message: "Failed to delete job style" };
      throw { message: "Unexpected error occurred" };
    }
  },
};
