import type { ReactNode } from 'react';

export function highlightMatch(text: string | undefined, query: string): ReactNode {
    if (!text) return text;
    if (!query.trim()) return text;

    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const parts = text.split(new RegExp(`(${escaped})`, 'gi'));

    return parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
            <mark key={i} className="bg-yellow-200 text-gray-900 rounded px-0.5">
                {part}
            </mark>
        ) : (
            part
        )
    );
}