export function formatBadgeClass(contentType?: string, format?: string): string {
    if (contentType === 'MOVIE' && format === 'LIVE_ACTION') {
        return 'bg-blue-600';
    }
    switch (format) {
        case 'ANIME': return 'bg-orange-500';
        case 'ANIMATION': return 'bg-cyan-500';
        default: return 'bg-emerald-600';
    }
}

export function formatLabel(contentType?: string, format?: string): string {
    if (contentType === 'MOVIE') {
        if (format === 'ANIME') return 'Anime Movie';
        if (format === 'ANIMATION') return 'Anim Movie';
        return 'Movie';
    }
    if (format === 'ANIME') return 'Anime';
    if (format === 'ANIMATION') return 'Animation';
    return 'Series';
}

export function statusBadgeClass(status?: string): string {
    switch (status) {
        case 'COMPLETED': return 'bg-gray-500';
        case 'WATCHING': return 'bg-amber-500';
        case 'DROPPED': return 'bg-red-500';
        default: return 'bg-sky-500';
    }
}