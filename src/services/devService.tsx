import axios from "../configs/axios";
import { AxiosError } from "axios";

interface DevData {
  name: string;
  skills: string[];
  experience: number;
}

export const devService = {
  async getAllDevs(devId: string | null = null, userId: string | null = null) {
    try {
      const params = new URLSearchParams();

      if (devId !== null) params.append("devId", devId);
      if (userId !== null) params.append("userId", userId);

      const url = `/Dev/GetAll${params.toString() ? `?${params}` : ""}`;

      const response = await axios.get(url);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        throw error.response?.data || { message: "Failed to fetch devs" };
      }
      throw { message: "Unexpected error occurred" };
    }
  },

  async getDevById(id: string) {
    try {
      const response = await axios.get(`/Dev/${id}`);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        throw error.response?.data || { message: "Failed to fetch dev" };
      }
      throw { message: "Unexpected error occurred" };
    }
  },

  async createDev(devData: DevData) {
    try {
      const response = await axios.post("/Dev", {
        name: devData.name,
        skills: devData.skills,
        experience: devData.experience,
      });
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        throw error.response?.data || { message: "Failed to create dev" };
      }
      throw { message: "Unexpected error occurred" };
    }
  },

  async updateDev(id: string, devData: DevData) {
    try {
      const response = await axios.put(`/Dev/${id}`, {
        name: devData.name,
        skills: devData.skills,
        experience: devData.experience,
      });
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        throw error.response?.data || { message: "Failed to update dev" };
      }
      throw { message: "Unexpected error occurred" };
    }
  },

  async deleteDev(id: string) {
    try {
      const response = await axios.delete(`/Dev/${id}`);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        throw error.response?.data || { message: "Failed to delete dev" };
      }
      throw { message: "Unexpected error occurred" };
    }
  },
};
