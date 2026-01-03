import React, { useState, useEffect } from 'react';
import { dbService, AuditLog } from '../../services/db';

const AuditTimeline: React.FC = () => {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const data = await dbService.getAuditLogs();
                // Sort by timestamp desc
                const sorted = (data as AuditLog[]).sort((a, b) => {
                    const tA = a.timestamp?.seconds || 0;
                    const tB = b.timestamp?.seconds || 0;
                    return tB - tA;
                });
                setLogs(sorted);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchLogs();
    }, []);

    const getActionIcon = (action: string) => {
        switch (action) {
            case 'create': return <span className="text-green-500">✚</span>;
            case 'update': return <span className="text-amber-500">✎</span>;
            case 'delete': return <span className="text-red-500">✕</span>;
            case 'backup': return <span className="text-blue-500">💾</span>;
            case 'restore': return <span className="text-purple-500">♻️</span>;
            default: return <span>•</span>;
        }
    };

    const formatTime = (timestamp: any) => {
        if (!timestamp) return 'Just now';
        // Firestore timestamp to Date
        const date = new Date(timestamp.seconds * 1000);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' ' + date.toLocaleDateString();
    };

    if (loading) return <div className="p-8 text-center opacity-50 text-[10px] font-black uppercase tracking-widest">Загрузка логов...</div>;
    if (logs.length === 0) return <div className="p-8 text-center text-[10px] font-black uppercase tracking-widest opacity-30">История пуста</div>;

    return (
        <div className="relative border-l-2 border-ios-border ml-3 space-y-8 py-2">
            {logs.map((log, idx) => (
                <div key={idx} className="relative pl-6 group">
                    {/* Timestamp Dot */}
                    <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-ios-card border-2 border-ios-border group-hover:border-ios-accent transition-colors"></div>

                    <div className="bg-ios-sub/50 p-4 rounded-2xl border border-transparent hover:border-ios transition-all">
                        <div className="flex justify-between items-start mb-1">
                            <div className="flex items-center gap-2">
                                <span className="text-lg">{getActionIcon(log.action)}</span>
                                <span className="text-[10px] font-black uppercase tracking-widest text-ios-primary">
                                    {log.action} <span className="text-ios-secondary">in</span> {log.collection}
                                </span>
                            </div>
                            <span className="text-[9px] font-bold text-ios-secondary opacity-60 font-mono">
                                {formatTime(log.timestamp)}
                            </span>
                        </div>

                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-5 h-5 rounded-full bg-ios-card border border-ios flex items-center justify-center text-[8px] font-black">
                                {log.performedBy.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-[10px] font-medium text-ios-secondary">{log.performedBy}</span>
                        </div>

                        {log.documentId && (
                            <p className="text-[9px] font-mono text-ios-secondary bg-ios-card px-2 py-1 rounded-lg inline-block border border-ios/50">
                                ID: {log.documentId}
                            </p>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default AuditTimeline;
