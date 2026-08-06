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

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Tooltip, Legend);

const FORMAT_COLORS = {liveAction: '#20c997', anime: '#fd7e14', animation: '#0dcaf0'};

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
    const [splitFormat, setSplitFormat] = useState(true);
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

    const chartJsData = useMemo(
        () => ({
            labels,
            datasets: [
                ...(showTrend
                    ? [
                        {
                            type: 'line' as const,
                            label: 'Trend',
                            data: chartData.map((d) => d.totalMinutes ?? 0),
                            borderColor: 'rgba(37, 99, 235, 0.8)',
                            borderWidth: 2,
                            pointRadius: 0,
                            tension: 0.4,
                        },
                    ]
                    : []),
                ...(splitFormat
                    ? [
                        {
                            type: 'bar' as const,
                            label: 'Live Action',
                            data: chartData.map((d) => d.liveActionMinutes ?? 0),
                            backgroundColor: FORMAT_COLORS.liveAction,
                        },
                        {
                            type: 'bar' as const,
                            label: 'Anime',
                            data: chartData.map((d) => d.animeMinutes ?? 0),
                            backgroundColor: FORMAT_COLORS.anime,
                        },
                        {
                            type: 'bar' as const,
                            label: 'Animation',
                            data: chartData.map((d) => d.animationMinutes ?? 0),
                            backgroundColor: FORMAT_COLORS.animation,
                        },
                    ]
                    : [
                        {
                            type: 'bar' as const,
                            label: 'Total Watched',
                            data: chartData.map((d) => d.totalMinutes ?? 0),
                            backgroundColor: 'rgba(16, 185, 129, 0.8)',
                        },
                    ]),
            ],
        }),
        [labels, chartData, splitFormat, showTrend]
    );

    async function handleBarClick(index: number) {
        const point = chartData[index];
        if (!point?.watchDate) return;
        setSelectedKey({dateKey: point.watchDate, label: labels[index]});
        const data = await getWatchDetails(point.watchDate, grouping);
        setDetails(data);
    }

    return (
        <div className="max-w-6xl mx-auto p-6">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-extrabold text-gray-900">Statistics</h1>
                <Link to="/" className="flex items-center gap-1 text-gray-700 hover:text-gray-900 text-sm font-medium">
                    <ArrowLeft size={16}/> Back to Library
                </Link>
            </div>

            {stats && (
                <>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="bg-emerald-600 text-white rounded-xl shadow-sm p-5 text-center">
                            <p className="text-sm opacity-80 mb-1">Net Watch Time</p>
                            <p className="text-3xl font-extrabold">{formatDuration(stats.watchedDurationMinutes ?? 0)}</p>
                        </div>
                        <div className="bg-gray-600 text-white rounded-xl shadow-sm p-5 text-center">
                            <p className="text-sm opacity-80 mb-1">Total Library Time</p>
                            <p className="text-3xl font-extrabold">{formatDuration(stats.totalDurationMinutes ?? 0)}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-6">
                        <div className="bg-white rounded-xl shadow-sm p-5">
                            <h3 className="font-semibold text-gray-900 mb-3">Time Distribution</h3>
                            <div className="flex flex-col gap-2 text-sm">
                                <div className="flex justify-between border-b border-gray-100 pb-1.5">
                                    <span className="font-medium text-gray-800">Live Action</span>
                                    <span
                                        className="text-gray-600">{formatDuration(stats.liveActionWatchedMinutes ?? 0)}</span>
                                </div>
                                <div className="flex justify-between border-b border-gray-100 pb-1.5">
                                    <span className="font-medium text-gray-800">Anime</span>
                                    <span
                                        className="text-gray-600">{formatDuration(stats.animeWatchedMinutes ?? 0)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-medium text-gray-800">Animation</span>
                                    <span
                                        className="text-gray-600">{formatDuration(stats.animationWatchedMinutes ?? 0)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm p-5 text-center">
                            <h3 className="font-semibold text-gray-900 mb-3">Total Items</h3>
                            <p className="text-4xl font-extrabold text-gray-900 mb-3">{stats.totalItems}</p>
                            <div className="flex gap-2 text-sm">
                                <div className="flex-1 bg-gray-50 rounded-lg p-2">
                                    <p className="font-bold text-blue-600">{stats.movieCount}</p>
                                    <p className="text-gray-600">Movies</p>
                                </div>
                                <div className="flex-1 bg-gray-50 rounded-lg p-2">
                                    <p className="font-bold text-emerald-600">{stats.seriesCount}</p>
                                    <p className="text-gray-600">Series</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm p-5">
                            <h3 className="font-semibold text-gray-900 mb-3">Statuses</h3>
                            <div className="flex flex-col gap-2 text-sm">
                                <div className="flex justify-between">
                                    <span
                                        className="bg-gray-500 text-white text-xs font-semibold px-2 py-0.5 rounded-md">Completed</span>
                                    <span className="font-bold text-gray-900">{stats.completedCount}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span
                                        className="bg-amber-500 text-white text-xs font-semibold px-2 py-0.5 rounded-md">Watching</span>
                                    <span className="font-bold text-gray-900">{stats.watchingCount}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span
                                        className="bg-sky-500 text-white text-xs font-semibold px-2 py-0.5 rounded-md">Planned</span>
                                    <span className="font-bold text-gray-900">{stats.plannedCount}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span
                                        className="bg-red-500 text-white text-xs font-semibold px-2 py-0.5 rounded-md">Dropped</span>
                                    <span className="font-bold text-gray-900">{stats.droppedCount}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}

            <div className="bg-white rounded-xl shadow-sm p-5">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                    <h3 className="font-semibold text-gray-900">
                        Watch Activity{' '}
                        <span
                            className="ml-2 bg-emerald-100 text-emerald-700 text-xs font-semibold px-2 py-1 rounded-full">
                            Total: {formatDuration(totalPeriodMinutes)}
                        </span>
                    </h3>

                    <div className="flex items-center gap-3 text-sm">
                        <label className="flex items-center gap-1.5 text-gray-700">
                            <input type="checkbox" checked={showTrend}
                                   onChange={(e) => setShowTrend(e.target.checked)}/> Trend Line
                        </label>
                        <label className="flex items-center gap-1.5 text-gray-700">
                            <input type="checkbox" checked={splitFormat}
                                   onChange={(e) => setSplitFormat(e.target.checked)}/> Split by Format
                        </label>
                    </div>
                </div>

                <div
                    className="flex flex-wrap items-center gap-2 mb-4 bg-gray-50 border border-gray-200 rounded-lg p-2">
                    <span className="text-xs font-semibold text-gray-600">Period:</span>
                    <input type="date" value={start} onChange={(e) => setStart(e.target.value)}
                           className="border border-gray-300 rounded px-2 py-1 text-sm"/>
                    <span className="text-gray-400">—</span>
                    <input type="date" value={end} onChange={(e) => setEnd(e.target.value)}
                           className="border border-gray-300 rounded px-2 py-1 text-sm"/>
                    <span className="text-xs font-semibold text-gray-600 ml-3">Scale:</span>
                    <select
                        value={grouping}
                        onChange={(e) => setGrouping(e.target.value as typeof grouping)}
                        className="border border-gray-300 rounded px-2 py-1 text-sm font-semibold text-blue-600"
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
                        {details && details.length > 0 && (
                            <ul className="flex flex-col gap-1.5 max-h-52 overflow-y-auto">
                                {details.map((d) => (
                                    <li key={d.logId}
                                        className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2 text-sm">
                                        <span className="font-medium text-gray-800">{d.title}</span>
                                        <span className="text-gray-600">
                                            {d.episodes ? `${d.episodes} episode(s) — ` : ''}
                                            {d.minutesWatched} min
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