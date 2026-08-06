import {apiClient} from './client';
import type {components} from './schema';

export type StatisticsResponse = components['schemas']['StatisticsResponse'];
export type ChartDataResponse = components['schemas']['ChartDataResponse'];
export type WatchDetailResponse = components['schemas']['WatchDetailResponse'];

export async function getOverallStats(): Promise<StatisticsResponse> {
    const response = await apiClient.get('/api/v1/stats');
    return response.data;
}

export async function getChartData(start: string, end: string, grouping: string): Promise<ChartDataResponse[]> {
    const response = await apiClient.get('/api/v1/stats/chart', {params: {start, end, grouping}});
    return response.data;
}

export async function getWatchDetails(dateKey: string, grouping: string): Promise<WatchDetailResponse[]> {
    const response = await apiClient.get('/api/v1/stats/details', {params: {dateKey, grouping}});
    return response.data;
}