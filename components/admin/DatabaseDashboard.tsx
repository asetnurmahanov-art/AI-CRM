import React, { useState } from 'react';
import CollectionViewer from './CollectionViewer';
import BackupManager from './BackupManager';
import AuditTimeline from './AuditTimeline';

const DatabaseDashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'data' | 'backup' | 'audit'>('data');
    const [selectedCollection, setSelectedCollection] = useState('users');

    const collections = ['users', 'deals', 'products', 'settings', 'companies', 'system_audit_logs'];

    return (
        <div className="space-y-6 animate-fade-in pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-4 px-2">
                <div>
                    <h1 className="text-3xl font-black text-ios-primary tracking-tight">Терминал</h1>
                    <p className="text-[10px] font-bold text-ios-secondary uppercase tracking-widest mt-1">Обозреватель базы данных</p>
                </div>

                {/* Segmented Control */}
                <div className="bg-ios-card p-1 rounded-2xl border border-ios shadow-sm flex">
                    {(['data', 'audit', 'backup'] as const).map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-ios-primary text-ios-bg shadow-md' : 'text-ios-secondary hover:text-ios-primary'
                                }`}
                        >
                            {tab === 'data' ? 'Данные' : tab === 'audit' ? 'Логи' : 'Бэкап'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Area */}
            <div className="bg-ios-card/50 backdrop-blur-xl border border-ios rounded-[3rem] p-6 md:p-8 min-h-[600px] shadow-2xl">
                {activeTab === 'data' && (
                    <div className="space-y-6">
                        <div className="flex items-center gap-4 bg-ios-sub p-2 rounded-2xl border border-ios w-fit">
                            <span className="text-xl pl-2">📁</span>
                            <select
                                value={selectedCollection}
                                onChange={(e) => setSelectedCollection(e.target.value)}
                                className="bg-transparent text-sm font-bold text-ios-primary outline-none pr-4 py-1 cursor-pointer"
                            >
                                {collections.filter(c => c !== 'system_audit_logs').map(c => (
                                    <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                                ))}
                            </select>
                        </div>
                        <CollectionViewer collectionName={selectedCollection} />
                    </div>
                )}

                {activeTab === 'audit' && (
                    <div className="max-w-3xl mx-auto">
                        <div className="text-center mb-8">
                            <h3 className="text-xl font-black text-ios-primary">Хронология событий</h3>
                            <p className="text-xs text-ios-secondary font-medium">История изменений в системе</p>
                        </div>
                        <AuditTimeline />
                    </div>
                )}

                {activeTab === 'backup' && (
                    <div className="max-w-4xl mx-auto pt-10">
                        <BackupManager />
                    </div>
                )}
            </div>
        </div>
    );
};

export default DatabaseDashboard;
