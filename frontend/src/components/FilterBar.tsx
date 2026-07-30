import {Search} from 'lucide-react';

interface FilterBarProps {
    contentType?: string;
    format?: string;
    status?: string;
    query: string;
    onContentTypeChange: (v?: string) => void;
    onFormatChange: (v?: string) => void;
    onStatusChange: (v?: string) => void;
    onQueryChange: (v: string) => void;
}

function ToggleButton({
                          label,
                          active,
                          onClick,
                      }: {
    label: string;
    active: boolean;
    onClick: () => void;
}) {
    return (
        <button
            onClick={onClick}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
                active ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
        >
            {label}
        </button>
    );
}

export function FilterBar({
                              contentType,
                              format,
                              status,
                              query,
                              onContentTypeChange,
                              onFormatChange,
                              onStatusChange,
                              onQueryChange,
                          }: FilterBarProps) {
    function toggle(current: string | undefined, value: string, onChange: (v?: string) => void) {
        onChange(current === value ? undefined : value);
    }

    return (
        <div className="bg-white rounded-xl shadow-sm p-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-1 flex-wrap">
                <ToggleButton label="Movies" active={contentType === 'MOVIE'}
                              onClick={() => toggle(contentType, 'MOVIE', onContentTypeChange)}/>
                <ToggleButton label="Series" active={contentType === 'SERIES'}
                              onClick={() => toggle(contentType, 'SERIES', onContentTypeChange)}/>

                <div className="w-px h-5 bg-gray-200 mx-2"/>

                <ToggleButton label="Anime" active={format === 'ANIME'}
                              onClick={() => toggle(format, 'ANIME', onFormatChange)}/>
                <ToggleButton label="Animation" active={format === 'ANIMATION'}
                              onClick={() => toggle(format, 'ANIMATION', onFormatChange)}/>
                <ToggleButton label="Live Action" active={format === 'LIVE_ACTION'}
                              onClick={() => toggle(format, 'LIVE_ACTION', onFormatChange)}/>
            </div>

            <div className="flex items-center gap-2">
                <div className="relative">
                    <Search size={16} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"/>
                    <input
                        value={query}
                        onChange={(e) => onQueryChange(e.target.value)}
                        placeholder="Search..."
                        className="pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg text-sm w-48"
                    />
                </div>

                <select
                    value={status ?? 'ALL'}
                    onChange={(e) => onStatusChange(e.target.value === 'ALL' ? undefined : e.target.value)}
                    className="border border-gray-200 rounded-lg text-sm px-2 py-1.5"
                >
                    <option value="ALL">Any status</option>
                    <option value="PLANNED">Planned</option>
                    <option value="WATCHING">Watching</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="DROPPED">Dropped</option>
                </select>
            </div>
        </div>
    );
}