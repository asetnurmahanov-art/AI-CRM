import React, { useState } from 'react';
import { dbService } from '../../services/db';

const BackupManager: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState('');

    const handleBackup = async () => {
        setLoading(true);
        setStatus('Создание резервной копии...');
        try {
            const data = await dbService.backupDatabase();
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = url;
            a.download = `backup-${new Date().toLocaleDateString()}.json`;
            a.click();

            setStatus('Архив успешно скачан.');
        } catch (err: any) {
            setStatus('Ошибка: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleRestore = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!window.confirm('ВНИМАНИЕ: восстановление перезапишет текущие данные. Продолжить?')) return;

        setLoading(true);
        setStatus('Восстановление базы данных...');

        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const json = JSON.parse(event.target?.result as string);
                await dbService.restoreDatabase(json);
                setStatus('Восстановление завершено. Обновите страницу.');
            } catch (err: any) {
                setStatus('Ошибка восстановления: ' + err.message);
            } finally {
                setLoading(false);
            }
        };
        reader.readAsText(file);
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Backup Card */}
            <div className="bg-ios-card p-8 rounded-[2.5rem] border border-ios shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-green-500/20 transition-all"></div>
                <h3 className="text-xl font-black text-ios-primary mb-2">Экспорт</h3>
                <p className="text-[10px] font-medium text-ios-secondary mb-6">Создайте полную копию базы данных в формате JSON для безопасного хранения.</p>

                <button
                    onClick={handleBackup}
                    disabled={loading}
                    className="w-full py-4 bg-ios-primary text-ios-bg rounded-2xl font-black uppercase text-[10px] tracking-widest hover:opacity-90 active:scale-95 transition-all shadow-lg"
                >
                    {loading ? 'Обработка...' : '⬇ Скачать архив'}
                </button>
            </div>

            {/* Restore Card */}
            <div className="bg-ios-card p-8 rounded-[2.5rem] border border-ios shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-red-500/10 transition-all"></div>
                <h3 className="text-xl font-black text-ios-primary mb-2">Импорт</h3>
                <p className="text-[10px] font-medium text-ios-secondary mb-6">Восстановите данные из ранее созданного архива. Осторожно, данные будут перезаписаны.</p>

                <div className="relative">
                    <input
                        type="file"
                        accept=".json"
                        onChange={handleRestore}
                        className="hidden"
                        id="restore-file"
                        disabled={loading}
                    />
                    <label
                        htmlFor="restore-file"
                        className={`w-full block text-center py-4 bg-ios-sub text-ios-primary border border-ios rounded-2xl font-black uppercase text-[10px] tracking-widest cursor-pointer hover:bg-ios-border transition-all ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        ⬆ Загрузить архив
                    </label>
                </div>
            </div>

            {status && (
                <div className="md:col-span-2 p-4 bg-ios-sub rounded-2xl border border-ios text-center">
                    <p className="text-xs font-bold text-ios-primary animate-pulse">{status}</p>
                </div>
            )}
        </div>
    );
};

export default BackupManager;
