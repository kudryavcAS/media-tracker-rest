import {ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight} from 'lucide-react';

interface PaginationBarProps {
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export function PaginationBar({page, totalPages, onPageChange}: PaginationBarProps) {
    if (totalPages <= 1) return null;

    const windowStart = Math.max(1, page - 2);
    const windowEnd = Math.min(totalPages, page + 2);
    const pages = Array.from({length: windowEnd - windowStart + 1}, (_, i) => windowStart + i);

    function btnClass(active: boolean) {
        return `w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium ${
            active ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
        }`;
    }

    return (
        <div className="flex items-center justify-center gap-1 py-4">
            <button disabled={page <= 1} onClick={() => onPageChange(1)}
                    className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 disabled:opacity-30">
                <ChevronsLeft size={16}/>
            </button>
            <button disabled={page <= 1} onClick={() => onPageChange(page - 1)}
                    className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 disabled:opacity-30">
                <ChevronLeft size={16}/>
            </button>

            {pages.map((p) => (
                <button key={p} onClick={() => onPageChange(p)} className={btnClass(p === page)}>
                    {p}
                </button>
            ))}

            <button disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}
                    className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 disabled:opacity-30">
                <ChevronRight size={16}/>
            </button>
            <button disabled={page >= totalPages} onClick={() => onPageChange(totalPages)}
                    className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 disabled:opacity-30">
                <ChevronsRight size={16}/>
            </button>
        </div>
    );
}