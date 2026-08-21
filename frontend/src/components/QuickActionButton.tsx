import {Check} from 'lucide-react';

interface QuickActionButtonProps {
    disabled?: boolean;
    onClick: () => void;
}

export function QuickActionButton({disabled, onClick}: QuickActionButtonProps) {
    return (
        <button
            title="Mark as completed"
            disabled={disabled}
            onClick={(e) => {
                e.stopPropagation();
                onClick();
            }}
            className="p-1.5 rounded-md border border-gray-300 text-gray-600 hover:bg-gray-50 hover:text-emerald-600 disabled:opacity-30 disabled:pointer-events-none transition-colors"
        >
            <Check size={16}/>
        </button>
    );
}