import axios from "../configs/axios";
import { AxiosError } from "axios";

export const ApplyActivityType = {
    Interview: 0,
    Test: 1,
    Meeting: 2,
    Review: 3,
};

export type ApplyActivityType = number;

export const ApplyActivityStatus = {
    Scheduled: 0,
    Completed: 1,
    Passed: 2,
    Failed: 3,
    Approved: 4,
    NoShow: 5,
};

export type ApplyActivityStatus = number;



export interface ApplyActivity {
    id: number;
    applyId: number;
    processStepId: number;
    activityType: ApplyActivityType;
    scheduledDate?: string;
    status: ApplyActivityStatus;
    notes: string;
}

export interface ApplyActivityCreate {
    applyId: number;
    processStepId: number;
    activityType: ApplyActivityType;
    scheduledDate?: string;
    status: ApplyActivityStatus;
    notes?: string;
}

export interface ApplyActivityStatusUpdate {
    status: ApplyActivityStatus;
    notes?: string;
}

export interface ApplyActivityFilter {
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
    async getAll(filter?: ApplyActivityFilter) {
        try {
            const params = new URLSearchParams();

            if (filter?.applyId) params.append("ApplyId", filter.applyId.toString());
            if (filter?.processStepId) params.append("ProcessStepId", filter.processStepId.toString());
            if (filter?.activityType !== undefined) params.append("ActivityType", filter.activityType.toString());
            if (filter?.status !== undefined) params.append("Status", filter.status.toString());
            if (filter?.scheduledDateFrom) params.append("ScheduledDateFrom", filter.scheduledDateFrom);
            if (filter?.scheduledDateTo) params.append("ScheduledDateTo", filter.scheduledDateTo);
            if (filter?.excludeDeleted !== undefined)
                params.append("ExcludeDeleted", filter.excludeDeleted ? "true" : "false");

            const url = `/applyactivity${params.toString() ? `?${params}` : ""}`;
            const response = await axios.get(url);

            return response.data as ApplyActivity[];
        } catch (error: unknown) {
            if (error instanceof AxiosError)
                throw error.response?.data || { message: "Cannot fetch apply activities" };
            throw { message: "Unknown error while fetching apply activities" };
        }
    },

    async getById(id: number) {
        try {
            const response = await axios.get(`/applyactivity/${id}`);
            return response.data as ApplyActivity;
        } catch (error: unknown) {
            if (error instanceof AxiosError)
                throw error.response?.data || { message: "Cannot fetch apply activity details" };
            throw { message: "Unknown error while fetching apply activity details" };
        }
    },

    async create(payload: ApplyActivityCreate) {
        try {
            const response = await axios.post("/applyactivity", payload);
            return response.data as ApplyActivity;
        } catch (error: unknown) {
            if (error instanceof AxiosError)
                throw error.response?.data || { message: "Cannot create apply activity" };
            throw { message: "Unknown error while creating apply activity" };
        }
    },

    async update(id: number, payload: Partial<ApplyActivityCreate> & { status?: ApplyActivityStatus }) {
        try {
            const response = await axios.put(`/applyactivity/${id}`, payload);
            return response.data as ApplyActivity;
        } catch (error: unknown) {
            if (error instanceof AxiosError)
                throw error.response?.data || { message: "Cannot update apply activity" };
            throw { message: "Unknown error while updating apply activity" };
        }
    },

    async updateStatus(id: number, payload: ApplyActivityStatusUpdate) {
        try {
            const response = await axios.patch(`/applyactivity/${id}/status`, payload);
            return response.data as ApplyActivity;
        } catch (error: unknown) {
            if (error instanceof AxiosError)
                throw error.response?.data || { message: "Cannot update apply activity status" };
            throw { message: "Unknown error while updating apply activity status" };
        }
    },

    async delete(id: number) {
        try {
            const response = await axios.delete(`/applyactivity/${id}`);
            return response.data;
        } catch (error: unknown) {
            if (error instanceof AxiosError)
                throw error.response?.data || { message: "Cannot delete apply activity" };
            throw { message: "Unknown error while deleting apply activity" };
        }
    },
};
