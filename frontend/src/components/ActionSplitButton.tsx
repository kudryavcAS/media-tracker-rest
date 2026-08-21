import {useState} from 'react';
import {Check, Plus, Minus, ChevronDown} from 'lucide-react';

interface ActionSplitButtonProps {
    mode: 'complete' | 'addEpisodes';
    disabled?: boolean;
    onConfirm: (quantity: number, watchedAt?: string) => void;
}

export function ActionSplitButton({mode, disabled, onConfirm}: ActionSplitButtonProps) {
    const [open, setOpen] = useState(false);
    const [quantity, setQuantity] = useState(1);
    const [date, setDate] = useState('');

    const Icon = mode === 'complete' ? Check : Plus;
    const label = mode === 'complete' ? 'Watched' : 'Add';

    function quickAction() {
        onConfirm(1);
    }

    function confirmAdvanced() {
        const watchedAt = date ? `${date}T12:00:00` : undefined;
        onConfirm(mode === 'addEpisodes' ? quantity : 1, watchedAt);
        setOpen(false);
        setQuantity(1);
        setDate('');
    }

    return (
        <div className="relative inline-flex" onClick={(e) => e.stopPropagation()}>
            <div className="inline-flex rounded-md border border-gray-300 overflow-hidden divide-x divide-gray-300">
                <button
                    title={mode === 'complete' ? 'Mark as completed' : '+1 episode'}
                    disabled={disabled}
                    onClick={quickAction}
                    className="flex items-center gap-1 px-2.5 py-1.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                >
                    <Icon size={16}/> {label}
                </button>
                <button
                    title="Advanced options"
                    disabled={disabled}
                    onClick={() => setOpen((v) => !v)}
                    className="px-2 py-1.5 text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                >
                    <ChevronDown size={16} className={`transition-transform ${open ? 'rotate-180' : ''}`}/>
                </button>
            </div>

            {open && (
                <div
                    className="absolute top-full left-0 mt-1 z-20 bg-white border border-gray-300 rounded-md shadow-lg p-3 flex flex-col gap-3 w-64">       {mode === 'addEpisodes' && (
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Episodes</label>
                        <div
                            className="inline-flex rounded-md border border-gray-300 overflow-hidden divide-x divide-gray-300 w-full">
                            <button
                                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                                className="px-3 py-1.5 text-gray-600 hover:bg-gray-50 transition-colors"
                            >
                                <Minus size={14}/>
                            </button>
                            <input
                                type="number"
                                min={1}
                                value={quantity}
                                onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
                                className="w-full text-center text-sm outline-none"
                            />
                            <button
                                onClick={() => setQuantity((q) => q + 1)}
                                className="px-3 py-1.5 text-gray-600 hover:bg-gray-50 transition-colors"
                            >
                                <Plus size={14}/>
                            </button>
                        </div>
                    </div>
                )}

                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Date</label>
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            max={new Date().toISOString().split('T')[0]}
                            className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm"
                        />
                    </div>

                    <button
                        onClick={confirmAdvanced}
                        className="bg-blue-600 text-white text-sm font-semibold rounded-md py-1.5 hover:bg-blue-700 transition-colors"
                    >
                        Confirm
                    </button>
                </div>
            )}
        </div>
    );
}