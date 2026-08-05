import {Search, X} from 'lucide-react';

interface FilterBarProps {
    contentType?: string;
    formats: string[];
    status?: string;
    query: string;
    sortBy?: string;
    onContentTypeChange: (v?: string) => void;
    onFormatsChange: (v: string[]) => void;
    onStatusChange: (v?: string) => void;
    onQueryChange: (v: string) => void;
    onSortReset: () => void;
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
            className={`px-3 py-1.5 rounded-md text-base font-medium transition ${
                active ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'
            }`}
        >
            {label}
        </button>
    );
}

export function FilterBar({
                              contentType,
                              formats,
                              status,
                              query,
                              sortBy,
                              onContentTypeChange,
                              onFormatsChange,
                              onStatusChange,
                              onQueryChange,
                              onSortReset,
                          }: FilterBarProps) {
    function toggleSingle(current: string | undefined, value: string, onChange: (v?: string) => void) {
        onChange(current === value ? undefined : value);
    }

    function toggleInArray(value: string) {
        onFormatsChange(formats.includes(value) ? formats.filter((f) => f !== value) : [...formats, value]);
    }

    const hasActiveFilters = !!contentType || formats.length > 0 || !!status || query.length > 0 || !!sortBy;

    function resetFilters() {
        onContentTypeChange(undefined);
        onFormatsChange([]);
        onStatusChange(undefined);
        onQueryChange('');
        onSortReset();
    }

    return (
        <div className="bg-white rounded-xl shadow-sm p-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-1 flex-wrap">
                <ToggleButton label="Movies" active={contentType === 'MOVIE'}
                              onClick={() => toggleSingle(contentType, 'MOVIE', onContentTypeChange)}/>
                <ToggleButton label="Series" active={contentType === 'SERIES'}
                              onClick={() => toggleSingle(contentType, 'SERIES', onContentTypeChange)}/>

                <div className="w-px h-5 bg-gray-200 mx-2"/>

                <ToggleButton label="Anime" active={formats.includes('ANIME')} onClick={() => toggleInArray('ANIME')}/>
                <ToggleButton label="Animation" active={formats.includes('ANIMATION')}
                              onClick={() => toggleInArray('ANIMATION')}/>
                <ToggleButton label="Live Action" active={formats.includes('LIVE_ACTION')}
                              onClick={() => toggleInArray('LIVE_ACTION')}/>

                {hasActiveFilters && (
                    <>
                        <div className="w-px h-5 bg-gray-200 mx-1"/>
                        <button
                            onClick={resetFilters}
                            title="Reset all filters"
                            className="flex items-center gap-1 px-3 py-1.5 rounded-md text-base font-medium text-red-600 hover:bg-red-50 transition-colors"
                        >
                            <X size={16}/> Reset
                        </button>
                    </>
                )}
            </div>

            <div className="flex items-center gap-2">
                <div className="relative">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                    <input
                        value={query}
                        onChange={(e) => onQueryChange(e.target.value)}
                        placeholder="Search..."
                        className="pl-9 pr-3 h-10 border border-gray-300 rounded-lg text-base w-56 text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                    />
                </div>

                <select
                    value={status ?? 'ALL'}
                    onChange={(e) => onStatusChange(e.target.value === 'ALL' ? undefined : e.target.value)}
                    className="h-10 border border-gray-300 rounded-lg text-base px-3 text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
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