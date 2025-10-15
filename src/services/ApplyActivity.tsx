import axios from "../configs/axios";
import { AxiosError } from "axios";

export const ApplyActivityType = {
    Interview: "Interview",
    Test: "Test",
    Meeting: "Meeting",
    Review: "Review",
} as const;
export type ApplyActivityType = (typeof ApplyActivityType)[keyof typeof ApplyActivityType];

export const ApplyActivityStatus = {
    Scheduled: "Scheduled",
    Completed: "Completed",
    Passed: "Passed",
    Failed: "Failed",
    Considered: "Considered",
    NoShow: "NoShow",
    } as const;
export type ApplyActivityStatus = (typeof ApplyActivityStatus)[keyof typeof ApplyActivityStatus];



export interface ApplyActivityModel {
    id: number;
    applyId: number;
    processStepId: number;
    activityType: ApplyActivityType;
    scheduledDate?: string;
    status: ApplyActivityStatus;
    notes: string;
}

export interface ApplyActivityCreateModel {
    applyId: number;
    processStepId: number;
    activityType: ApplyActivityType;
    scheduledDate?: string;
    status: ApplyActivityStatus;
    notes?: string;
}

export interface ApplyActivityFilterModel {
    applyId?: number;
    processStepId?: number;
    activityType?: ApplyActivityType;
    status?: ApplyActivityStatus;
    scheduledDateFrom?: string;
    scheduledDateTo?: string;
    excludeDeleted?: boolean;
}

// eslint-disable-next-line react-refresh/only-export-components
export const applyActivityService = {
    async getAll(filter?: ApplyActivityFilterModel) {
        try {
            const params = new URLSearchParams();

            if (filter?.applyId) params.append("ApplyId", filter.applyId.toString());
            if (filter?.processStepId) params.append("ProcessStepId", filter.processStepId.toString());
            if (filter?.activityType) params.append("ActivityType", filter.activityType);
            if (filter?.status) params.append("Status", filter.status);
            if (filter?.scheduledDateFrom) params.append("ScheduledDateFrom", filter.scheduledDateFrom);
            if (filter?.scheduledDateTo) params.append("ScheduledDateTo", filter.scheduledDateTo);
            if (filter?.excludeDeleted !== undefined)
                params.append("ExcludeDeleted", filter.excludeDeleted ? "true" : "false");

            const url = `/apply-activity${params.toString() ? `?${params}` : ""}`;
            const response = await axios.get(url);

            return response.data as ApplyActivityModel[];
        } catch (error: unknown) {
            if (error instanceof AxiosError)
                throw error.response?.data || { message: "Cannot fetch apply activities" };
            throw { message: "Unknown error while fetching apply activities" };
        }
    },

    async getById(id: number) {
        try {
            const response = await axios.get(`/apply-activity/${id}`);
            return response.data as ApplyActivityModel;
        } catch (error: unknown) {
            if (error instanceof AxiosError)
                throw error.response?.data || { message: "Cannot fetch apply activity details" };
            throw { message: "Unknown error while fetching apply activity details" };
        }
    },

    async create(payload: ApplyActivityCreateModel) {
        try {
            const response = await axios.post("/apply-activity", payload);
            return response.data as ApplyActivityModel;
        } catch (error: unknown) {
            if (error instanceof AxiosError)
                throw error.response?.data || { message: "Cannot create apply activity" };
            throw { message: "Unknown error while creating apply activity" };
        }
    },

    async update(id: number, payload: Partial<ApplyActivityCreateModel> & { status?: ApplyActivityStatus }) {
        try {
            const response = await axios.put(`/apply-activity/${id}`, payload);
            return response.data as ApplyActivityModel;
        } catch (error: unknown) {
            if (error instanceof AxiosError)
                throw error.response?.data || { message: "Cannot update apply activity" };
            throw { message: "Unknown error while updating apply activity" };
        }
    },

    async delete(id: number) {
        try {
            const response = await axios.delete(`/apply-activity/${id}`);
            return response.data;
        } catch (error: unknown) {
            if (error instanceof AxiosError)
                throw error.response?.data || { message: "Cannot delete apply activity" };
            throw { message: "Unknown error while deleting apply activity" };
        }
    },
};
