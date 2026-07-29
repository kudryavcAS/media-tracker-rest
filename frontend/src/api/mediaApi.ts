import { apiClient } from './client';
import type { components } from './schema';

type MediaItemResponse = components['schemas']['MediaItemResponse'];
type PageResponseMediaItemResponse = components['schemas']['PageResponseMediaItemResponse'];
export async function getMediaItems(params?: {
    contentType?: string;
    format?: string;
    status?: string;
    query?: string;
    includeArchived?: boolean;
    page?: number;
    size?: number;
}): Promise<PageResponseMediaItemResponse> {
    const response = await apiClient.get('/api/v1/media', { params });
    return response.data;
}

export async function getMediaItemById(id: string): Promise<MediaItemResponse> {
    const response = await apiClient.get(`/api/v1/media/${id}`);
    return response.data;
}