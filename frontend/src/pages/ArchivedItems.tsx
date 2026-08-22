import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArchiveRestore } from 'lucide-react';
import { getMediaItems, unarchiveItem, type MediaItemResponse } from '../api/mediaApi';
import { formatBadgeClass, formatLabel } from '../utils/badges';

export function ArchivedItems() {
    const [items, setItems] = useState<MediaItemResponse[]>([]);
    const [loading, setLoading] = useState(true);

    async function load() {
        setLoading(true);
        try {
            const page = await getMediaItems({ includeArchived: true, page: 1, size: 200 });
            setItems((page.content ?? []).filter((i) => i.archived));
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        load();
    }, []);

    async function handleUnarchive(id?: string) {
        if (!id) return;
        await unarchiveItem(id);
        setItems((prev) => prev.filter((i) => i.id !== id));
    }

    return (
        <div className="max-w-3xl mx-auto p-6">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-extrabold text-gray-900">Archived Items</h1>
                <Link to="/settings" className="flex items-center gap-1 text-gray-700 hover:text-gray-900 text-sm font-medium">
                    <ArrowLeft size={16} /> Back to Settings
                </Link>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-5">
                {loading && <p className="text-center text-gray-400 py-8">Loading...</p>}
                {!loading && items.length === 0 && <p className="text-center text-gray-400 py-8">No archived items.</p>}

                {!loading && items.length > 0 && (
                    <ul className="flex flex-col gap-2">
                        {items.map((item) => (
                            <li key={item.id} className="flex items-center justify-between border border-gray-200 rounded-lg px-4 py-3">
                                <div className="flex items-center gap-2 min-w-0">
                                    <span className={`whitespace-nowrap text-white text-xs font-semibold px-2 py-0.5 rounded-md ${formatBadgeClass(item.format)}`}>
                                        {formatLabel(item.format)}
                                    </span>
                                    <span className="font-semibold text-gray-900 truncate">{item.title}</span>
                                    {item.releaseYear && <span className="text-gray-500 text-sm shrink-0">({item.releaseYear})</span>}
                                </div>

                                <button
                                    onClick={() => handleUnarchive(item.id)}
                                    title="Unarchive"
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-gray-300 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-emerald-600 transition-colors shrink-0"
                                >
                                    <ArchiveRestore size={16} /> Unarchive
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}