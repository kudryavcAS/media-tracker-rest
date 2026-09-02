import { apiClient } from './client';

export async function shutdownServer(): Promise<void> {
    await apiClient.post('/api/v1/admin/shutdown');
}