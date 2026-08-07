import {useEffect, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {ArrowLeft} from 'lucide-react';
import {createItem, getMediaItemById, updateItem, type MediaItemRequest} from '../api/mediaApi';

const emptyForm: MediaItemRequest = {
    contentType: 'MOVIE',
    title: '',
    format: 'LIVE_ACTION',
    releaseYear: undefined,
    durationMinutes: undefined,
    directors: '',
    status: 'PLANNED',
    totalEpisodes: undefined,
    watchedEpisodes: undefined,
};

export function MediaForm() {
    const {id, contentType: routeContentType} = useParams();
    const navigate = useNavigate();
    const isEdit = !!id;

    const [form, setForm] = useState<MediaItemRequest>(emptyForm);
    const [loading, setLoading] = useState(isEdit);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isEdit && id) {
            getMediaItemById(id)
                .then((item) => {
                    setForm({
                        contentType: item.contentType ?? 'MOVIE',
                        title: item.title ?? '',
                        format: item.format ?? 'LIVE_ACTION',
                        releaseYear: item.releaseYear,
                        durationMinutes: item.durationMinutes,
                        directors: item.directors ?? '',
                        status: item.status ?? 'PLANNED',
                        totalEpisodes: item.totalEpisodes,
                        watchedEpisodes: item.watchedEpisodes,
                    });
                })
                .catch(() => setError('Failed to load item'))
                .finally(() => setLoading(false));
        } else {
            setForm({...emptyForm, contentType: (routeContentType ?? 'movie').toUpperCase()});
        }
    }, [id, isEdit, routeContentType]);

    const isSeries = form.contentType === 'SERIES';

    function updateField<K extends keyof MediaItemRequest>(key: K, value: MediaItemRequest[K]) {
        setForm((prev) => ({...prev, [key]: value}));
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);
        setError(null);
        try {
            if (isEdit && id) {
                await updateItem(id, form);
            } else {
                await createItem(form);
            }
            navigate('/');
        } catch {
            setError('Failed to save. Check the form for issues.');
        } finally {
            setSaving(false);
        }
    }

    if (loading) return <p className="text-center text-gray-500 py-10 text-base">Loading...</p>;

    return (
        <div className="max-w-xl mx-auto p-6">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
                    {isEdit ? 'Edit' : 'Add'} {isSeries ? 'Series' : 'Movie'}
                </h1>
                <button onClick={() => navigate('/')}
                        className="flex items-center gap-1.5 text-gray-600 hover:text-gray-900 text-base font-semibold transition-colors">
                    <ArrowLeft size={18}/> Cancel
                </button>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 flex flex-col gap-5">
                {error && <p className="text-base text-red-600">{error}</p>}

                <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-1.5">Title</label>
                    <input
                        required
                        value={form.title}
                        onChange={(e) => updateField('title', e.target.value)}
                        className="w-full h-10 border border-gray-300 rounded-lg px-3 text-base text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-shadow"
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-1.5">Director(s)</label>
                    <input
                        value={form.directors ?? ''}
                        onChange={(e) => updateField('directors', e.target.value)}
                        className="w-full h-10 border border-gray-300 rounded-lg px-3 text-base text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-shadow"
                    />
                </div>

                <div className="grid grid-cols-2 gap-5">
                    <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-1.5">Release Year</label>
                        <input
                            type="number"
                            value={form.releaseYear ?? ''}
                            onChange={(e) => updateField('releaseYear', e.target.value ? Number(e.target.value) : undefined)}
                            className="w-full h-10 border border-gray-300 rounded-lg px-3 text-base text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-shadow"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-1.5">
                            {isSeries ? 'Total Duration (min)' : 'Duration (min)'}
                        </label>
                        <input
                            type="number"
                            value={form.durationMinutes ?? ''}
                            onChange={(e) => updateField('durationMinutes', e.target.value ? Number(e.target.value) : undefined)}
                            className="w-full h-10 border border-gray-300 rounded-lg px-3 text-base text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-shadow"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-1.5">Format</label>
                    <select
                        value={form.format}
                        onChange={(e) => updateField('format', e.target.value as MediaItemRequest['format'])}
                        className="w-full h-10 border border-gray-300 rounded-lg px-3 text-base text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-shadow"
                    >
                        <option value="LIVE_ACTION">Live Action</option>
                        <option value="ANIME">Anime</option>
                        <option value="ANIMATION">Animation</option>
                    </select>
                </div>

                {isSeries && (
                    <div className="grid grid-cols-2 gap-5">
                        <div>
                            <label className="block text-sm font-semibold text-gray-800 mb-1.5">Total Episodes</label>
                            <input
                                type="number"
                                value={form.totalEpisodes ?? ''}
                                onChange={(e) => updateField('totalEpisodes', e.target.value ? Number(e.target.value) : undefined)}
                                className="w-full h-10 border border-gray-300 rounded-lg px-3 text-base text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-shadow"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-800 mb-1.5">Watched Episodes</label>
                            <input
                                type="number"
                                value={form.watchedEpisodes ?? ''}
                                onChange={(e) => updateField('watchedEpisodes', e.target.value ? Number(e.target.value) : undefined)}
                                className="w-full h-10 border border-gray-300 rounded-lg px-3 text-base text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-shadow"
                            />
                        </div>
                    </div>
                )}

                <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-1.5">Status</label>
                    <select
                        value={form.status}
                        onChange={(e) => updateField('status', e.target.value as MediaItemRequest['status'])}
                        className="w-full h-10 border border-gray-300 rounded-lg px-3 text-base text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-shadow"
                    >
                        <option value="PLANNED">Planned</option>
                        <option value="WATCHING">Watching</option>
                        <option value="COMPLETED">Completed</option>
                        <option value="DROPPED">Dropped</option>
                    </select>
                </div>

                <button
                    type="submit"
                    disabled={saving}
                    className="mt-2 h-10 bg-blue-600 text-white px-4 rounded-lg text-base font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                    {saving ? 'Saving...' : 'Save'}
                </button>
            </form>
        </div>
    );
}