import { useEffect, useState } from 'react';
import { getMediaItems } from '../api/mediaApi';
import type { components } from '../api/schema';

type MediaItemResponse = components['schemas']['MediaItemResponse'];

export function Library() {
    const [items, setItems] = useState<MediaItemResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        getMediaItems()
            .then((page) => {
                setItems(page.content ?? []);
            })
            .catch((err) => {
                setError('Не удалось загрузить библиотеку');
                console.error(err);
            })
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <p>Загрузка...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div>
            <h1>Моя библиотека</h1>
            <table>
                <thead>
                <tr>
                    <th>Название</th>
                    <th>Год</th>
                    <th>Статус</th>
                </tr>
                </thead>
                <tbody>
                {items.map((item) => (
                    <tr key={item.id}>
                        <td>{item.title}</td>
                        <td>{item.releaseYear}</td>
                        <td>{item.status}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}