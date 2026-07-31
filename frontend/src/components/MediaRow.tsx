import {useState} from 'react';
import {Pencil, ChevronDown, Trash2} from 'lucide-react';
import {
    type MediaItemResponse,
    type WatchDetailResponse,
    markAsCompleted,
    updateProgress,
    getItemWatchLogs,
    deleteWatchLog,
} from '../api/mediaApi';
import {formatBadgeClass, formatLabel, statusBadgeClass} from '../utils/badges';
import {DateActionButton} from './DateActionButton';

interface MediaRowProps {
    item: MediaItemResponse;
    onItemUpdated: (updated: MediaItemResponse) => void;
}

export function MediaRow({item, onItemUpdated}: MediaRowProps) {
    const [expanded, setExpanded] = useState(false);
    const [logs, setLogs] = useState<WatchDetailResponse[] | null>(null);
    const [logsLoading, setLogsLoading] = useState(false);

    const isSeries = item.contentType === 'SERIES';
    const isCompleted = item.status === 'COMPLETED';
    const progressPct =
        isSeries && item.totalEpisodes ? Math.min(100, Math.round(((item.watchedEpisodes ?? 0) / item.totalEpisodes) * 100)) : 0;

    async function loadLogs() {
        if (!item.id) return;
        setLogsLoading(true);
        try {
            const data = await getItemWatchLogs(item.id);
            setLogs(data);
        } finally {
            setLogsLoading(false);
        }
    }

    function toggleExpanded() {
        const next = !expanded;
        setExpanded(next);
        if (next && logs === null) loadLogs();
    }

    async function handleComplete(watchedAt?: string) {
        if (!item.id) return;
        const updated = await markAsCompleted(item.id, watchedAt);
        onItemUpdated(updated);
        if (expanded) loadLogs();
    }

    async function handleIncrementEpisode(watchedAt?: string) {
        if (!item.id) return;
        const updated = await updateProgress(item.id, 1, watchedAt);
        onItemUpdated(updated);
        loadLogs();
    }

    async function handleDeleteLog(logId?: string) {
        if (!item.id || !logId) return;
        if (!confirm('Delete this watch log entry?')) return;
        const updated = await deleteWatchLog(item.id, logId);
        onItemUpdated(updated);
        loadLogs();
    }

    return (
        <>
            <tr
                onClick={toggleExpanded}
                className={`cursor-pointer border-b border-gray-100 hover:bg-gray-50 transition ${
                    isCompleted ? 'bg-emerald-50 hover:bg-emerald-100' : ''
                }`}
            >
                <td className="py-3 px-4 align-top">
                    <span
                        className={`whitespace-nowrap text-white text-xs font-semibold px-2 py-0.5 rounded-full ${formatBadgeClass(item.format)}`}>
                        {formatLabel(item.format)}
                    </span>
                </td>

                <td className="py-3 px-4 font-semibold text-gray-800 align-top">
                    <div className="flex items-start gap-2 min-w-0">
                        <ChevronDown size={16}
                                     className={`mt-1 shrink-0 text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`}/>
                        <div className="min-w-0">
                            <span className="truncate block">{item.title}</span>
                            {isSeries && (
                                <div className="mt-1 h-1.5 w-28 bg-gray-200 rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-500" style={{width: `${progressPct}%`}}/>
                                </div>
                            )}
                        </div>
                    </div>
                </td>

                <td className="py-3 px-4 text-gray-600 align-top">{item.releaseYear}</td>
                <td className="py-3 px-4 text-gray-600 align-top truncate">{item.directors}</td>
                <td className="py-3 px-4 text-gray-600 align-top">{item.durationMinutes}</td>

                <td className="py-3 px-4 align-top">
                    <span
                        className={`whitespace-nowrap text-white text-xs font-semibold px-2 py-1 rounded-full ${statusBadgeClass(item.status)}`}>
                        {item.status}
                    </span>
                </td>

                <td className="py-3 px-4 align-top">
                    <div className="flex items-center justify-end gap-1">
                        <DateActionButton
                            title="Mark as completed"
                            disabled={isCompleted}
                            onQuickAction={() => handleComplete()}
                            onDatedAction={(d) => handleComplete(d)}
                        />
                        <button
                            onClick={(e) => e.stopPropagation()}
                            title="Edit"
                            className="p-1.5 rounded-full text-gray-400 hover:bg-gray-100 hover:text-blue-600"
                        >
                            <Pencil size={18}/>
                        </button>
                    </div>
                </td>
            </tr>

            {expanded && (
                <tr className="bg-gray-50 border-b border-gray-100">
                    <td colSpan={7} className="p-4">
                        <div className="border-l-4 border-emerald-500 pl-4 flex flex-col gap-4">
                            {isSeries && (
                                <div>
                                    <h5 className="font-semibold text-gray-700 mb-2">Watch Progress</h5>
                                    <div className="flex items-center gap-4">
                                        <span className="font-bold text-lg">
                                            {item.watchedEpisodes ?? 0} / {item.totalEpisodes ?? '?'}
                                        </span>
                                        <div className="flex-1 h-4 bg-gray-200 rounded-full overflow-hidden max-w-xs">
                                            <div
                                                className="h-full bg-emerald-500 flex items-center justify-center text-[10px] text-white"
                                                style={{width: `${progressPct}%`}}
                                            >
                                                {progressPct > 10 ? `${progressPct}%` : ''}
                                            </div>
                                        </div>
                                        <DateActionButton
                                            title="+1 episode"
                                            onQuickAction={() => handleIncrementEpisode()}
                                            onDatedAction={(d) => handleIncrementEpisode(d)}
                                        />
                                    </div>
                                </div>
                            )}

                            <div>
                                <h5 className="font-semibold text-gray-700 mb-2">Watch Logs</h5>
                                {logsLoading && <p className="text-sm text-gray-400">Loading...</p>}
                                {!logsLoading && logs && logs.length === 0 &&
                                    <p className="text-sm text-gray-400">No watch logs yet.</p>}
                                {!logsLoading && logs && logs.length > 0 && (
                                    <ul className="flex flex-col gap-1.5 max-h-52 overflow-y-auto">
                                        {logs.map((l) => (
                                            <li key={l.logId}
                                                className="flex items-center justify-between bg-white rounded-lg px-3 py-2 text-sm shadow-sm">
                                                <span className="text-gray-600">
                                                    {l.watchedAt
                                                        ? new Date(l.watchedAt).toLocaleDateString('en-US', {
                                                            day: 'numeric',
                                                            month: 'short',
                                                            year: 'numeric'
                                                        })
                                                        : '—'}
                                                    {l.episodes ? ` — ${l.episodes} episode(s)` : ''} — {l.minutesWatched} min
                                                </span>
                                                <button onClick={() => handleDeleteLog(l.logId)}
                                                        className="text-gray-400 hover:text-red-600">
                                                    <Trash2 size={16}/>
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>
                    </td>
                </tr>
            )}
        </>
    );
}