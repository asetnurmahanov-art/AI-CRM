import React, { useState, useEffect } from 'react';
import { dbService } from '../../services/db';

interface CollectionViewerProps {
    collectionName: string;
}

const CollectionViewer: React.FC<CollectionViewerProps> = ({ collectionName }) => {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [expandedRow, setExpandedRow] = useState<string | null>(null);

    useEffect(() => {
        loadData();
    }, [collectionName]);

    const loadData = async () => {
        setLoading(true);
        setError(null);
        try {
            const docs = await dbService.getAll(collectionName);
            setData(docs);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!window.confirm('Are you sure?')) return;
        try {
            await dbService.delete(collectionName, id);
            await loadData();
        } catch (err: any) {
            alert(err.message);
        }
    };

    if (loading) return <div className="p-10 flex justify-center"><div className="w-6 h-6 border-2 border-ios-accent border-t-transparent rounded-full animate-spin"></div></div>;
    if (error) return <div className="p-6 text-center text-red-500 text-xs font-bold bg-red-50 rounded-2xl">{error}</div>;
    if (data.length === 0) return <div className="p-10 text-center text-ios-secondary text-[10px] font-black uppercase tracking-widest opacity-40">Нет данных</div>;

    // Keys to ignore in main view
    const ignoreKeys = ['id', 'password', 'vector', 'history'];
    const allKeys = Array.from(new Set(data.flatMap(Object.keys))).filter(k => !ignoreKeys.includes(k));

    return (
        <div className="space-y-2">
            <div className="overflow-x-auto rounded-[1.5rem] border border-ios shadow-sm">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-ios-sub">
                        <tr>
                            <th className="px-5 py-3 text-[9px] font-black uppercase tracking-widest text-ios-secondary border-b border-ios w-10">#</th>
                            {allKeys.slice(0, 5).map(key => (
                                <th key={key} className="px-5 py-3 text-[9px] font-black uppercase tracking-widest text-ios-secondary border-b border-ios whitespace-nowrap">
                                    {key}
                                </th>
                            ))}
                            <th className="px-5 py-3 text-right text-[9px] font-black uppercase tracking-widest text-ios-secondary border-b border-ios">
                                Действия
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-ios-card divide-y divide-ios-border">
                        {data.map((row, i) => (
                            <React.Fragment key={row.id || i}>
                                <tr
                                    onClick={() => setExpandedRow(expandedRow === row.id ? null : row.id)}
                                    className="hover:bg-ios-sub/50 transition-colors cursor-pointer group"
                                >
                                    <td className="px-5 py-4 text-[10px] font-mono text-ios-secondary opacity-50">{i + 1}</td>
                                    {allKeys.slice(0, 5).map(key => {
                                        const val = row[key];
                                        let display = val;
                                        if (typeof val === 'object') display = <span className="bg-ios-sub px-1.5 py-0.5 rounded text-[8px] font-black uppercase text-ios-accent tracking-wider">Object</span>;
                                        if (typeof val === 'boolean') display = val ? <span className="text-green-500">True</span> : <span className="text-red-500">False</span>;
                                        if (key.toLowerCase().includes('time') || key.toLowerCase().includes('date')) {
                                            display = <span className="font-mono text-[9px] opacity-70">{val?.seconds ? new Date(val.seconds * 1000).toLocaleDateString() : String(val)}</span>;
                                        }

                                        return (
                                            <td key={key} className="px-5 py-4 text-xs font-medium text-ios-primary max-w-[150px] truncate">
                                                {display}
                                            </td>
                                        );
                                    })}
                                    <td className="px-5 py-4 text-right">
                                        <button
                                            onClick={(e) => handleDelete(row.id, e)}
                                            className="opacity-0 group-hover:opacity-100 transition-opacity bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white w-8 h-8 rounded-full flex items-center justify-center"
                                        >
                                            ✕
                                        </button>
                                    </td>
                                </tr>
                                {/* Inspector Drawer */}
                                {expandedRow === row.id && (
                                    <tr className="bg-ios-sub/30 animate-fade-in">
                                        <td colSpan={allKeys.length + 2} className="p-6">
                                            <div className="bg-ios-card rounded-2xl border border-ios p-4 shadow-inner font-mono text-[10px] text-ios-secondary overflow-x-auto">
                                                <pre>{JSON.stringify(row, null, 2)}</pre>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            </div>
            <p className="text-center text-[9px] font-bold text-ios-secondary opacity-40 mt-2">
                Показано {data.length} записей. Нажмите на строку для детального просмотра.
            </p>
        </div>
    );
};

export default CollectionViewer;
