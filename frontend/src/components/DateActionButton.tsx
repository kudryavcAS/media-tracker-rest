import {useState} from 'react';
import {Plus, CalendarClock} from 'lucide-react';

interface DateActionButtonProps {
    onQuickAction: () => void;
    onDatedAction: (isoDateTime: string) => void;
    title: string;
    disabled?: boolean;
}

export function DateActionButton({onQuickAction, onDatedAction, title, disabled}: DateActionButtonProps) {
    const [pickerOpen, setPickerOpen] = useState(false);
    const [date, setDate] = useState('');

    function confirmDate() {
        if (!date) return;
        onDatedAction(`${date}T12:00:00`);
        setPickerOpen(false);
        setDate('');
    }

    return (
        <div className="relative inline-flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            <button
                title={title}
                disabled={disabled}
                onClick={onQuickAction}
                className="p-1.5 rounded-full text-gray-500 hover:bg-gray-100 hover:text-emerald-600 disabled:opacity-30 disabled:pointer-events-none"
            >
                <Plus size={18}/>
            </button>

            <button
                title="Pick a retroactive date"
                disabled={disabled}
                onClick={() => setPickerOpen((v) => !v)}
                className="p-1.5 rounded-full text-gray-400 hover:bg-gray-100 hover:text-blue-600 disabled:opacity-30 disabled:pointer-events-none"
            >
                <CalendarClock size={18}/>
            </button>

            {pickerOpen && (
                <div
                    className="absolute top-full right-0 mt-1 z-20 bg-white border border-gray-200 rounded-lg shadow-lg p-3 flex flex-col gap-2 w-52">
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        max={new Date().toISOString().split('T')[0]}
                        className="border border-gray-300 rounded px-2 py-1 text-sm"
                    />
                    <button
                        onClick={confirmDate}
                        disabled={!date}
                        className="bg-blue-600 text-white text-sm rounded py-1 disabled:opacity-40"
                    >
                        Confirm
                    </button>
                </div>
            )}
        </div>
    );
}