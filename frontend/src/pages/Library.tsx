import {useEffect, useState} from 'react';
import {Link} from 'react-router-dom';
import {Power, Plus, Settings as SettingsIcon} from 'lucide-react';
import {getMediaItems, type MediaItemResponse} from '../api/mediaApi';
import {FilterBar} from '../components/FilterBar';
import {MediaRow} from '../components/MediaRow';
import {PaginationBar} from '../components/PaginationBar';
import {SortableHeader} from '../components/SortableHeader';
import {shutdownServer} from "../api/adminAPI.ts";

const PAGE_SIZE = 50;

export function Library() {
    const [items, setItems] = useState<MediaItemResponse[]>([]);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [contentType, setContentType] = useState<string>();
    const [formats, setFormats] = useState<string[]>([]);
    const [status, setStatus] = useState<string>();
    const [query, setQuery] = useState('');
    const [page, setPage] = useState(1);

    const [sortBy, setSortBy] = useState<string>();
    const [sortDir, setSortDir] = useState<'ASC' | 'DESC'>();

    useEffect(() => {
        setPage(1);
    }, [contentType, formats, status, query, sortBy, sortDir]);

    useEffect(() => {
        const timeout = setTimeout(() => {
            setLoading(true);
            getMediaItems({
                contentType,
                format: formats.length > 0 ? formats : undefined,
                status,
                query: query || undefined,
                sortBy,
                sortDir,
                page,
                size: PAGE_SIZE,
            })
                .then((pageData) => {
                    setItems(pageData.content ?? []);
                    setTotalPages(pageData.totalPages ?? 1);
                })
                .catch((err) => {
                    setError('Failed to load library');
                    console.error(err);
                })
                .finally(() => setLoading(false));
        }, 300);

        return () => clearTimeout(timeout);
    }, [contentType, formats, status, query, sortBy, sortDir, page]);

    function handleItemUpdated(updated: MediaItemResponse) {
        setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
    }

    function handleSort(field: string, dir: 'ASC' | 'DESC') {
        setSortBy(field);
        setSortDir(dir);
    }

    async function handleShutdown() {
        if (!confirm('Shut down the server? You will need to relaunch it to use the app again.')) return;
        try {
            await shutdownServer();
        } catch {
        }
        document.body.innerHTML =
            '<div style="display:flex;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;color:#6b7280;font-size:1.25rem;">Server stopped. You can close this tab.</div>';
    }

    return (
        <div className="max-w-7xl mx-auto p-6">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Media Tracker</h1>

                <div className="flex items-center gap-2.5">
                    <button
                        onClick={handleShutdown}
                        className="p-2 rounded-lg border border-red-300 text-red-500 hover:bg-red-50"
                        title="Shut down server"
                    >
                        <Power size={18}/>
                    </button>
                    <Link to="/media/new/movie"
                          className="h-10 flex items-center gap-1.5 bg-blue-600 text-white px-4 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors">
                        <Plus size={18}/> Movie
                    </Link>
                    <Link to="/media/new/series"
                          className="h-10 flex items-center gap-1.5 bg-emerald-600 text-white px-4 rounded-lg text-sm font-semibold hover:bg-emerald-700 transition-colors">
                        <Plus size={18}/> Series
                    </Link>
                    <Link to="/settings"
                          className="h-10 flex items-center gap-1.5 bg-gray-600 text-white px-4 rounded-lg text-sm font-semibold hover:bg-gray-700 transition-colors">
                        <SettingsIcon size={18}/> Settings
                    </Link>
                </div>
            </div>

            <div className="mb-4">
                <FilterBar
                    contentType={contentType}
                    formats={formats}
                    status={status}
                    query={query}
                    sortBy={sortBy}
                    onContentTypeChange={setContentType}
                    onFormatsChange={setFormats}
                    onStatusChange={setStatus}
                    onQueryChange={setQuery}
                    onSortReset={() => {
                        setSortBy(undefined);
                        setSortDir(undefined);
                    }}
                />
            </div>

            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <table className="w-full table-fixed text-left">
                    <colgroup>
                        <col className="w-[9%]"/>
                        <col className="w-[34%]"/>
                        <col className="w-[6%]"/>
                        <col className="w-[21%]"/>
                        <col className="w-[9%]"/>
                        <col className="w-[7%]"/>
                        <col className="w-[14%]"/>
                    </colgroup>
                    <thead className="bg-gray-50 text-gray-700 text-sm font-semibold">
                    <tr>
                        <th className="py-3 px-4 text-left">Format</th>
                        <th className="py-3 px-4 text-left">
                            <SortableHeader label="Title" field="title" activeField={sortBy} activeDir={sortDir}
                                            defaultDir="ASC" onSort={handleSort}/>
                        </th>
                        <th className="py-3 px-4 text-left">
                            <SortableHeader label="Year" field="releaseYear" activeField={sortBy} activeDir={sortDir}
                                            defaultDir="DESC" onSort={handleSort}/>
                        </th>
                        <th className="py-3 px-4 text-left">
                            <SortableHeader label="Director" field="directors" activeField={sortBy} activeDir={sortDir}
                                            defaultDir="ASC" onSort={handleSort}/>
                        </th>
                        <th className="py-3 px-4 text-left">
                            <SortableHeader label="Duration" field="durationMinutes" activeField={sortBy}
                                            activeDir={sortDir} defaultDir="DESC" onSort={handleSort}/>
                        </th>
                        <th className="py-3 px-4 text-left">
                            <SortableHeader label="Status" field="status" activeField={sortBy} activeDir={sortDir}
                                            defaultDir="DESC" onSort={handleSort}/>
                        </th>
                        <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {items.map((item) => (
                        <MediaRow key={item.id} item={item} query={query} onItemUpdated={handleItemUpdated}/>
                    ))}
                    </tbody>
                </table>

                {loading && <p className="text-center text-gray-400 py-8">Loading...</p>}
                {error && <p className="text-center text-red-500 py-8">{error}</p>}
                {!loading && !error && items.length === 0 &&
                    <p className="text-center text-gray-400 py-8">Nothing found 🦕</p>}

                {!loading && !error && items.length > 0 &&
                    <PaginationBar page={page} totalPages={totalPages} onPageChange={setPage}/>}
            </div>
        </div>
    );
}