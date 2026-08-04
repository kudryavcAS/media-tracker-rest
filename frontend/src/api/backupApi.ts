import {apiClient} from './client';

export async function exportBackup(): Promise<void> {
    const response = await apiClient.get('/api/v1/backup/export', {responseType: 'blob'});
    const url = URL.createObjectURL(response.data as Blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `media_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
}

export async function importBackup(file: File): Promise<void> {
    const formData = new FormData();
    formData.append('file', file);
    await apiClient.post('/api/v1/backup/import', formData, {
        headers: {'Content-Type': 'multipart/form-data'},
    });
}