interface ToggleSwitchProps {
    label: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
}

export function ToggleSwitch({ label, checked, onChange }: ToggleSwitchProps) {
    return (
        <label className="flex items-center gap-2 cursor-pointer select-none">
            <span className="text-sm font-medium text-gray-700">{label}</span>
            <button
                type="button"
                onClick={() => onChange(!checked)}
                className={`relative w-10 h-5.5 rounded-full transition-colors ${checked ? 'bg-blue-600' : 'bg-gray-300'}`}
            >
                <span
                    className={`absolute top-0.5 left-0.5 w-4.5 h-4.5 bg-white rounded-full shadow transition-transform ${
                        checked ? 'translate-x-4.5' : 'translate-x-0'
                    }`}
                />
            </button>
        </label>
    );
}