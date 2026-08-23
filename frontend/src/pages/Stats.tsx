import {useEffect, useMemo, useState} from 'react';
import {Link} from 'react-router-dom';
import {ArrowLeft} from 'lucide-react';
import {Chart} from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    Tooltip,
    Legend,
} from 'chart.js';
import {
    getOverallStats,
    getChartData,
    getWatchDetails,
    type StatisticsResponse,
    type ChartDataResponse,
    type WatchDetailResponse,
} from '../api/statsApi';
import {formatDuration} from '../utils/duration';
import {CHART_COLORS} from '../utils/chartColors';
import {ToggleSwitch} from '../components/ToggleSwitch';
import {SegmentedControl} from '../components/SegmentedControl';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Tooltip, Legend);

type GroupMode = 'FORMAT' | 'TYPE';

function todayIso(): string {
    return new Date().toISOString().split('T')[0];
}

function daysAgoIso(days: number): string {
    const d = new Date();
    d.setDate(d.getDate() - days);
    return d.toISOString().split('T')[0];
}

export function Stats() {
    const [stats, setStats] = useState<StatisticsResponse | null>(null);
    const [chartData, setChartData] = useState<ChartDataResponse[]>([]);
    const [grouping, setGrouping] = useState<'DAY' | 'WEEK' | 'MONTH' | 'YEAR'>('DAY');
    const [start, setStart] = useState(daysAgoIso(14));
    const [end, setEnd] = useState(todayIso());
    const [groupMode, setGroupMode] = useState<GroupMode>('TYPE');
    const [showTrend, setShowTrend] = useState(true);

    const [selectedKey, setSelectedKey] = useState<{ dateKey: string; label: string } | null>(null);
    const [details, setDetails] = useState<WatchDetailResponse[] | null>(null);

    useEffect(() => {
        getOverallStats().then(setStats).catch(console.error);
    }, []);

    useEffect(() => {
        getChartData(start, end, grouping).then(setChartData).catch(console.error);
        setSelectedKey(null);
        setDetails(null);
    }, [start, end, grouping]);

    const totalPeriodMinutes = useMemo(() => chartData.reduce((acc, d) => acc + (d.totalMinutes ?? 0), 0), [chartData]);

    const labels = useMemo(
        () =>
            chartData.map((d) => {
                if (!d.watchDate) return '';
                if (grouping === 'YEAR') return d.watchDate;
                if (grouping === 'MONTH') return new Date(d.watchDate + '-01').toLocaleString('en-US', {
                    month: 'short',
                    year: 'numeric'
                });
                const formatted = new Date(d.watchDate).toLocaleString('en-US', {month: 'short', day: 'numeric'});
                return grouping === 'WEEK' ? 'Week ' + formatted : formatted;
            }),
        [chartData, grouping]
    );

    const chartJsData = useMemo(() => {
        const trendDataset = showTrend
            ? [
                {
                    type: 'line' as const,
                    label: 'Trend',
                    data: chartData.map((d) => d.totalMinutes ?? 0),
                    borderColor: 'rgba(30, 41, 59, 0.6)',
                    borderWidth: 2,
                    pointRadius: 0,
                    tension: 0.4,
                },
            ]
            : [];

        const barDatasets =
            groupMode === 'FORMAT'
                ? [
                    {
                        type: 'bar' as const,
                        label: 'Live Action',
                        data: chartData.map((d) => d.liveActionMinutes ?? 0),
                        backgroundColor: CHART_COLORS.liveAction
                    },
                    {
                        type: 'bar' as const,
                        label: 'Anime',
                        data: chartData.map((d) => d.animeMinutes ?? 0),
                        backgroundColor: CHART_COLORS.anime
                    },
                    {
                        type: 'bar' as const,
                        label: 'Animation',
                        data: chartData.map((d) => d.animationMinutes ?? 0),
                        backgroundColor: CHART_COLORS.animation
                    },
                ]
                : [
                    {
                        type: 'bar' as const,
                        label: 'Movies',
                        data: chartData.map((d) => d.movieMinutes ?? 0),
                        backgroundColor: CHART_COLORS.movie
                    },
                    {
                        type: 'bar' as const,
                        label: 'Series',
                        data: chartData.map((d) => d.seriesMinutes ?? 0),
                        backgroundColor: CHART_COLORS.series
                    },
                ];

        return {labels, datasets: [...trendDataset, ...barDatasets]};
    }, [labels, chartData, groupMode, showTrend]);

    const groupedDetails = useMemo(() => {
        if (!details) return null;

        const groups = new Map<string, {
            title: string;
            mediaItemId?: string;
            episodes: number;
            minutesWatched: number;
        }>();

        details.forEach((d) => {
            const key = `${d.mediaItemId}`;
            if (!groups.has(key)) {
                groups.set(key, {
                    title: d.title ?? '',
                    mediaItemId: d.mediaItemId,
                    episodes: d.episodes ?? 0,
                    minutesWatched: d.minutesWatched ?? 0,
                });
            } else {
                const g = groups.get(key)!;
                g.episodes += d.episodes ?? 0;
                g.minutesWatched += d.minutesWatched ?? 0;
            }
        });

        return Array.from(groups.values()).sort((a, b) => b.minutesWatched - a.minutesWatched);
    }, [details]);

    async function handleBarClick(index: number) {
        const point = chartData[index];
        if (!point?.watchDate) return;
        setSelectedKey({dateKey: point.watchDate, label: labels[index]});
        const data = await getWatchDetails(point.watchDate, grouping);
        setDetails(data);
    }

    return (
        <div className="max-w-7xl mx-auto p-6">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Statistics</h1>
                <Link to="/"
                      className="flex items-center gap-1.5 text-gray-600 hover:text-gray-900 text-base font-semibold transition-colors">
                    <ArrowLeft size={18}/> Back to Library
                </Link>
            </div>

            {stats && (
                <>
                    <div className="grid grid-cols-2 gap-5 mb-5">
                        <div className="bg-emerald-600 text-white rounded-xl shadow-sm p-7 text-center">
                            <p className="text-base font-medium opacity-90 mb-2">Net Watch Time</p>
                            <p className="text-5xl font-extrabold">{formatDuration(stats.watchedDurationMinutes ?? 0)}</p>
                        </div>
                        <div className="bg-gray-700 text-white rounded-xl shadow-sm p-7 text-center">
                            <p className="text-base font-medium opacity-90 mb-2">Total Library Time</p>
                            <p className="text-5xl font-extrabold">{formatDuration(stats.totalDurationMinutes ?? 0)}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-5 mb-6">
                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <h3 className="font-bold text-gray-900 text-lg mb-4">Time Distribution</h3>
                            <div className="flex flex-col gap-3 text-base">
                                <div className="flex justify-between border-b border-gray-100 pb-2">
                                    <span className="font-medium text-gray-800">Live Action</span>
                                    <span
                                        className="text-gray-700 font-semibold">{formatDuration(stats.liveActionWatchedMinutes ?? 0)}</span>
                                </div>
                                <div className="flex justify-between border-b border-gray-100 pb-2">
                                    <span className="font-medium text-gray-800">Anime</span>
                                    <span
                                        className="text-gray-700 font-semibold">{formatDuration(stats.animeWatchedMinutes ?? 0)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-medium text-gray-800">Animation</span>
                                    <span
                                        className="text-gray-700 font-semibold">{formatDuration(stats.animationWatchedMinutes ?? 0)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm p-6 text-center">
                            <h3 className="font-bold text-gray-900 text-lg mb-4">Total Items</h3>
                            <p className="text-5xl font-extrabold text-gray-900 mb-4">{stats.totalItems}</p>
                            <div className="flex gap-3 text-base">
                                <div className="flex-1 bg-gray-50 rounded-lg p-3">
                                    <p className="font-bold text-blue-600 text-xl">{stats.movieCount}</p>
                                    <p className="text-gray-600">Movies</p>
                                </div>
                                <div className="flex-1 bg-gray-50 rounded-lg p-3">
                                    <p className="font-bold text-emerald-600 text-xl">{stats.seriesCount}</p>
                                    <p className="text-gray-600">Series</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <h3 className="font-bold text-gray-900 text-lg mb-4">Statuses</h3>
                            <div className="flex flex-col gap-3 text-base">
                                <div className="flex justify-between items-center">
                                    <span
                                        className="bg-gray-500 text-white text-sm font-semibold px-2.5 py-1 rounded-md">Completed</span>
                                    <span className="font-bold text-gray-900 text-lg">{stats.completedCount}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span
                                        className="bg-amber-500 text-white text-sm font-semibold px-2.5 py-1 rounded-md">Watching</span>
                                    <span className="font-bold text-gray-900 text-lg">{stats.watchingCount}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span
                                        className="bg-sky-500 text-white text-sm font-semibold px-2.5 py-1 rounded-md">Planned</span>
                                    <span className="font-bold text-gray-900 text-lg">{stats.plannedCount}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span
                                        className="bg-red-500 text-white text-sm font-semibold px-2.5 py-1 rounded-md">Dropped</span>
                                    <span className="font-bold text-gray-900 text-lg">{stats.droppedCount}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}

            <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                    <h3 className="font-bold text-gray-900 text-lg">
                        Watch Activity{' '}
                        <span
                            className="ml-2 bg-emerald-100 text-emerald-700 text-sm font-semibold px-2.5 py-1 rounded-full">
                            Total: {formatDuration(totalPeriodMinutes)}
                        </span>
                    </h3>

                    <div className="flex items-center gap-5">
                        <SegmentedControl
                            value={groupMode}
                            onChange={setGroupMode}
                            options={[
                                {value: 'FORMAT', label: 'By Format'},
                                {value: 'TYPE', label: 'By Type'},
                            ]}
                        />
                        <ToggleSwitch label="Trend Line" checked={showTrend} onChange={setShowTrend}/>
                    </div>
                </div>

                <div
                    className="flex flex-wrap items-center gap-3 mb-6 bg-white border border-gray-200 rounded-xl p-3 shadow-sm">
                    <span className="text-sm font-semibold text-gray-700 ml-1">Period:</span>
                    <input
                        type="date"
                        value={start}
                        onChange={(e) => setStart(e.target.value)}
                        className="h-10 border border-gray-300 rounded-lg px-3 text-base text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-shadow"
                    />
                    <span className="text-gray-400">—</span>
                    <input
                        type="date"
                        value={end}
                        onChange={(e) => setEnd(e.target.value)}
                        className="h-10 border border-gray-300 rounded-lg px-3 text-base text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-shadow"
                    />

                    <div className="w-px h-6 bg-gray-200 mx-2"/>

                    <span className="text-sm font-semibold text-gray-700">Scale:</span>
                    <select
                        value={grouping}
                        onChange={(e) => setGrouping(e.target.value as typeof grouping)}
                        className="h-10 border border-gray-300 rounded-lg px-3 text-base font-semibold text-blue-600 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-shadow"
                    >
                        <option value="DAY">Daily</option>
                        <option value="WEEK">Weekly</option>
                        <option value="MONTH">Monthly</option>
                        <option value="YEAR">Yearly</option>
                    </select>
                </div>

                <Chart
                    type="bar"
                    data={chartJsData}
                    options={{
                        responsive: true,
                        interaction: {mode: 'index', intersect: false},
                        onClick: (_e, elements) => {
                            if (elements.length > 0) handleBarClick(elements[0].index);
                        },
                        scales: {x: {stacked: true}, y: {stacked: true, beginAtZero: true}},
                    }}
                />

                {selectedKey && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                        <h4 className="font-semibold text-gray-700 mb-2">Activity for {selectedKey.label}</h4>
                        {details === null && <p className="text-sm text-gray-400">Loading...</p>}
                        {details && details.length === 0 &&
                            <p className="text-sm text-gray-400">No details available.</p>}
                        {groupedDetails && groupedDetails.length > 0 && (
                            <ul className="flex flex-col gap-1.5 max-h-52 overflow-y-auto">
                                {groupedDetails.map((g) => (
                                    <li key={g.mediaItemId} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2 text-sm">
                                        <span className="font-medium text-gray-800">{g.title}</span>
                                        <span className="text-gray-600">
                    {g.episodes > 0 ? `${g.episodes} episode(s) — ` : ''}
                                            {g.minutesWatched} min
                </span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}