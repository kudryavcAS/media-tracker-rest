import {useRef, useState} from 'react';
import {Link} from 'react-router-dom';
import {ArrowLeft, Download, Upload} from 'lucide-react';
import {exportBackup, importBackup} from '../api/backupApi';

export function Settings() {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [status, setStatus] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);

    async function handleExport() {
        setBusy(true);
        setStatus(null);
        try {
            await exportBackup();
        } catch {
            setStatus('Export failed.');
        } finally {
            setBusy(false);
        }
    }

    async function handleImportChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!confirm('This will wipe all existing data and restore it from this file. Continue?')) {
            e.target.value = '';
            return;
        }

        setBusy(true);
        setStatus(null);
        try {
            await importBackup(file);
            setStatus('Import successful.');
        } catch {
            setStatus('Import failed. Check that the file is a valid backup.');
        } finally {
            setBusy(false);
            e.target.value = '';
        }
    }

    return (
        <div className="max-w-2xl mx-auto p-6">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-extrabold text-gray-900">Settings</h1>
                <Link to="/" className="flex items-center gap-1 text-gray-700 hover:text-gray-900 text-sm font-medium">
                    <ArrowLeft size={16}/> Back to Library
                </Link>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-5">
                <h2 className="font-semibold text-gray-900 mb-1">Data Backup</h2>
                <p className="text-sm text-gray-600 mb-4">Save your entire library to a JSON file, or restore it from
                    one.</p>

                <div className="flex flex-col gap-3">
                    <button
                        onClick={handleExport}
                        disabled={busy}
                        className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50"
                    >
                        <Download size={16}/> Download Backup (JSON)
                    </button>

                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={busy}
                        className="flex items-center justify-center gap-2 bg-amber-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-amber-600 disabled:opacity-50"
                    >
                        <Upload size={16}/> Restore from Backup
                    </button>
                    <input ref={fileInputRef} type="file" accept=".json" onChange={handleImportChange}
                           className="hidden"/>

                    {status && <p className="text-sm text-gray-700">{status}</p>}
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-5 mt-4">
                <h2 className="font-semibold text-gray-900 mb-1">Statistics</h2>
                <p className="text-sm text-gray-600 mb-4">View detailed watch time and library breakdowns.</p>
                <Link
                    to="/stats"
                    className="flex items-center justify-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-emerald-700"
                >
                    Open Statistics
                </Link>
            </div>
        </div>
    );
}