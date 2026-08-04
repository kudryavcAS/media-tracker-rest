import {useState, useMemo} from 'react';
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
import {highlightMatch} from '../utils/highlight';
import {Link} from 'react-router-dom';

interface MediaRowProps {
    item: MediaItemResponse;
    query: string;
    onItemUpdated: (updated: MediaItemResponse) => void;
}

export function MediaRow({item, query, onItemUpdated}: MediaRowProps) {
    const [expanded, setExpanded] = useState(false);
    const [logs, setLogs] = useState<WatchDetailResponse[] | null>(null);
    const [logsLoading, setLogsLoading] = useState(false);

    const isSeries = item.contentType === 'SERIES';
    const isCompleted = item.status === 'COMPLETED';
    const progressPct =
        isSeries && item.totalEpisodes ? Math.min(100, Math.round(((item.watchedEpisodes ?? 0) / item.totalEpisodes) * 100)) : 0;

    const groupedLogs = useMemo(() => {
        if (!logs) return null;

        const groups = new Map<string, {
            watchedAt?: string;
            episodes: number;
            minutesWatched: number;
            logIds: string[];
        }>();

        logs.forEach(l => {
            const dateKey = l.watchedAt ? l.watchedAt.split('T')[0] : 'unknown';

            if (!groups.has(dateKey)) {
                groups.set(dateKey, {
                    watchedAt: l.watchedAt,
                    episodes: l.episodes || 0,
                    minutesWatched: l.minutesWatched || 0,
                    logIds: [l.logId!]
                });
            } else {
                const g = groups.get(dateKey)!;
                g.episodes += (l.episodes || 0);
                g.minutesWatched += (l.minutesWatched || 0);
                g.logIds.push(l.logId!);
            }
        });

        return Array.from(groups.values());
    }, [logs]);

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

    async function handleDeleteLogGroup(logIds: string[]) {
        if (!item.id || logIds.length === 0) return;

        const msg = logIds.length > 1
            ? `Delete all ${logIds.length} watch entries for this day?`
            : `Delete this watch log entry?`;

        if (!confirm(msg)) return;

        let updatedItem = item;
        for (const logId of logIds) {
            updatedItem = await deleteWatchLog(item.id, logId);
        }

        onItemUpdated(updatedItem);
        loadLogs();
    }

    return (
        <>
            <tr
                onClick={toggleExpanded}
                className={`cursor-pointer border-b border-gray-100 transition ${
                    isCompleted ? 'bg-emerald-50 hover:bg-emerald-100' : 'hover:bg-gray-50'
                }`}
            >
                <td className="py-3 px-4 align-middle">
                    <span
                        className={`whitespace-nowrap text-white text-xs font-semibold px-2 py-0.5 rounded-full ${formatBadgeClass(item.format)}`}>
                        {formatLabel(item.format)}
                    </span>
                </td>

                <td className="py-3 px-4 font-semibold text-gray-900 align-middle">
                    <div className="flex items-center gap-2 min-w-0">
                        <ChevronDown size={16}
                                     className={`shrink-0 text-gray-500 transition-transform ${expanded ? 'rotate-180' : ''}`}/>
                        <div className="min-w-0">
                            <span className="truncate block">{highlightMatch(item.title, query)}</span>
                            {isSeries && (
                                <div className="mt-1 h-1.5 w-28 bg-gray-200 rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-500" style={{width: `${progressPct}%`}}/>
                                </div>
                            )}
                        </div>
                    </div>
                </td>

                <td className="py-3 px-4 text-gray-800 align-middle">{item.releaseYear}</td>
                <td className="py-3 px-4 text-gray-800 align-middle truncate">{highlightMatch(item.directors, query)}</td>
                <td className="py-3 px-4 text-gray-800 align-middle">{item.durationMinutes}</td>

                <td className="py-3 px-4 align-middle">
                    <span
                        className={`whitespace-nowrap text-white text-xs font-semibold px-2 py-1 rounded-full ${statusBadgeClass(item.status)}`}>
                        {item.status}
                    </span>
                </td>

                <td className="py-3 px-4 align-middle">
                    <div className="flex items-center justify-end gap-1">
                        <DateActionButton
                            title="Mark as completed"
                            disabled={isCompleted}
                            onQuickAction={() => handleComplete()}
                            onDatedAction={(d) => handleComplete(d)}
                        />
                        <Link
                            to={`/media/${item.id}/edit`}
                            onClick={(e) => e.stopPropagation()}
                            title="Edit"
                            className="p-1.5 rounded-full text-gray-400 hover:bg-gray-100 hover:text-blue-600 inline-flex"
                        >
                            <Pencil size={18}/>
                        </Link>
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
                                {!logsLoading && groupedLogs && groupedLogs.length > 0 && (
                                    <ul className="flex flex-col gap-1.5 max-h-52 overflow-y-auto">
                                        {groupedLogs.map((g, idx) => (
                                            <li key={idx}
                                                className="flex items-center justify-between bg-white rounded-lg px-3 py-2 text-sm shadow-sm">
                                             <span className="text-gray-600">
                                                 {g.watchedAt
                                                     ? new Date(g.watchedAt).toLocaleDateString('en-US', {
                                                         day: 'numeric',
                                                         month: 'short',
                                                         year: 'numeric'
                                                     })
                                                     : '—'}
                                                 {g.episodes > 0 ? ` — ${g.episodes} episode(s)` : ''} — {g.minutesWatched} min
                                             </span>
                                                <button onClick={() => handleDeleteLogGroup(g.logIds)}
                                                        className="text-gray-400 hover:text-red-600"
                                                        title="Delete entry">
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