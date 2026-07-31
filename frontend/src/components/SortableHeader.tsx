import { ChevronUp, ChevronDown } from 'lucide-react';

interface SortableHeaderProps {
    label: string;
    field: string;
    activeField?: string;
    activeDir?: 'ASC' | 'DESC';
    defaultDir: 'ASC' | 'DESC';
    onSort: (field: string, dir: 'ASC' | 'DESC') => void;
}

export function SortableHeader({ label, field, activeField, activeDir, defaultDir, onSort }: SortableHeaderProps) {
    const isActive = activeField === field;

    function handleClick() {
        if (!isActive) {
            onSort(field, defaultDir);
        } else {
            onSort(field, activeDir === 'ASC' ? 'DESC' : 'ASC');
        }
    }

    return (
        <button onClick={handleClick} className="flex items-center gap-1 hover:text-gray-800">
            {label}
            {isActive && (activeDir === 'ASC' ? <ChevronUp size={12} /> : <ChevronDown size={12} />)}
        </button>
    );
}