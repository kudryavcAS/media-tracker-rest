import { apiClient } from './client';
import type { components } from './schema';

export type MediaItemResponse = components['schemas']['MediaItemResponse'];
export type WatchDetailResponse = components['schemas']['WatchDetailResponse'];
export type PageResponseMediaItemResponse = components['schemas']['PageResponseMediaItemResponse'];

export interface GetMediaItemsParams {
    contentType?: string;
    format?: string[];
    status?: string;
    query?: string;
    includeArchived?: boolean;
    sortBy?: string;
    sortDir?: 'ASC' | 'DESC';
    page?: number;
    size?: number;
}

function toSearchParams(params: GetMediaItemsParams): URLSearchParams {
    const usp = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
        if (value === undefined || value === null) return;
        if (Array.isArray(value)) {
            value.forEach((v) => usp.append(key, String(v)));
        } else {
            usp.append(key, String(value));
        }
    });
    return usp;
}

export async function getMediaItems(params?: GetMediaItemsParams): Promise<PageResponseMediaItemResponse> {
    const response = await apiClient.get('/api/v1/media', {
        params: params ? toSearchParams(params) : undefined,
    });
    return response.data;
}

export async function markAsCompleted(id: string, watchedAt?: string): Promise<MediaItemResponse> {
    const response = await apiClient.post(`/api/v1/media/${id}/complete`, null, {
        params: watchedAt ? { watchedAt } : undefined,
    });
    return response.data;
}

export async function updateProgress(id: string, delta: number, watchedAt?: string): Promise<MediaItemResponse> {
    const response = await apiClient.patch(`/api/v1/media/${id}/progress`, null, {
        params: { delta, ...(watchedAt ? { watchedAt } : {}) },
    });
    return response.data;
}

export async function getItemWatchLogs(id: string): Promise<WatchDetailResponse[]> {
    const response = await apiClient.get(`/api/v1/media/${id}/logs`);
    return response.data;
}

export async function deleteWatchLog(id: string, logId: string): Promise<MediaItemResponse> {
    const response = await apiClient.delete(`/api/v1/media/${id}/logs/${logId}`);
    return response.data;
}