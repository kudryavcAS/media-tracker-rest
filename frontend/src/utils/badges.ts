export function contentTypeBadgeClass(contentType?: string): string {
    return contentType === 'SERIES' ? 'bg-purple-600' : 'bg-blue-600';
}

export function contentTypeLabel(contentType?: string): string {
    return contentType === 'SERIES' ? 'Series' : 'Movie';
}

export function formatBadgeClass(format?: string): string {
    switch (format) {
        case 'ANIME': return 'bg-orange-500';
        case 'ANIMATION': return 'bg-cyan-500';
        default: return 'bg-emerald-600';
    }
}

export function formatLabel(format?: string): string {
    switch (format) {
        case 'ANIME': return 'Anime';
        case 'ANIMATION': return 'Animation';
        default: return 'Live Action';
    }
}

export function statusBadgeClass(status?: string): string {
    switch (status) {
        case 'COMPLETED': return 'bg-gray-500';
        case 'WATCHING': return 'bg-amber-500';
        case 'DROPPED': return 'bg-red-500';
        default: return 'bg-sky-500';
    }
}