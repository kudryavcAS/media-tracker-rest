import { useEffect, useState } from 'react';
import { Power, Plus, Settings } from 'lucide-react';
import { getMediaItems, type MediaItemResponse } from '../api/mediaApi';
import { FilterBar } from '../components/FilterBar';
import { MediaRow } from '../components/MediaRow';

export function Library() {
    const [items, setItems] = useState<MediaItemResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [contentType, setContentType] = useState<string>();
    const [formats, setFormats] = useState<string[]>([]);
    const [status, setStatus] = useState<string>();
    const [query, setQuery] = useState('');

    useEffect(() => {
        const timeout = setTimeout(() => {
            setLoading(true);
            getMediaItems({
                contentType,
                format: formats.length > 0 ? formats : undefined,
                status,
                query: query || undefined,
                page: 1,
                size: 100,
            })
                .then((page) => setItems(page.content ?? []))
                .catch((err) => {
                    setError('Failed to load library');
                    console.error(err);
                })
                .finally(() => setLoading(false));
        }, 300);

        return () => clearTimeout(timeout);
    }, [contentType, formats, status, query]);

    function handleItemUpdated(updated: MediaItemResponse) {
        setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
    }

    return (
        <div className="max-w-7xl mx-auto p-6">
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-3xl font-extrabold text-gray-800">Media Tracker</h1>
                <div className="flex items-center gap-2">
                    <button className="p-2 rounded-lg border border-red-300 text-red-500 hover:bg-red-50">
                        <Power size={18} />
                    </button>
                    <button className="flex items-center gap-1 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700">
                        <Plus size={16} /> Movie
                    </button>
                    <button className="flex items-center gap-1 bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-emerald-700">
                        <Plus size={16} /> Series
                    </button>
                    <button className="flex items-center gap-1 bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-700">
                        <Settings size={16} /> Settings
                    </button>
                </div>
            </div>

            <div className="mb-4">
                <FilterBar
                    contentType={contentType}
                    formats={formats}
                    status={status}
                    query={query}
                    onContentTypeChange={setContentType}
                    onFormatsChange={setFormats}
                    onStatusChange={setStatus}
                    onQueryChange={setQuery}
                />
            </div>

            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                    <tr>
                        <th className="py-3 pl-4">Title</th>
                        <th className="py-3">Year</th>
                        <th className="py-3">Director</th>
                        <th className="py-3">Duration (min)</th>
                        <th className="py-3">Status</th>
                        <th className="py-3 pr-4 text-right">Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {items.map((item) => (
                        <MediaRow key={item.id} item={item} onItemUpdated={handleItemUpdated} />
                    ))}
                    </tbody>
                </table>

                {loading && <p className="text-center text-gray-400 py-8">Loading...</p>}
                {error && <p className="text-center text-red-500 py-8">{error}</p>}
                {!loading && !error && items.length === 0 && <p className="text-center text-gray-400 py-8">Nothing found 🦕</p>}
            </div>
        </div>
    );
}