import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { updatePassword, deleteUser, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';

const API_URL = 'http://localhost:3005/api';

const SettingsSecurity: React.FC = () => {
    const { user, logout } = useAuth();

    // Vault State
    const [vaultStatus, setVaultStatus] = useState({ initialized: false, unlocked: false });
    const [masterPassword, setMasterPassword] = useState('');
    const [maskedKeys, setMaskedKeys] = useState<Record<string, string>>({});
    const [vaultLoading, setVaultLoading] = useState(false);
    const [vaultError, setVaultError] = useState('');
    const [editingKey, setEditingKey] = useState<string | null>(null);
    const [newKeyValue, setNewKeyValue] = useState('');

    // Account State
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [currentPassword, setCurrentPassword] = useState(''); // For re-auth
    const [accountLoading, setAccountLoading] = useState(false);
    const [accountMessage, setAccountMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    useEffect(() => {
        checkVaultStatus();
    }, []);

    // --- VAULT ACTIONS ---

    const checkVaultStatus = async () => {
        try {
            const res = await fetch(`${API_URL}/security/status`);
            const data = await res.json();
            setVaultStatus(data);
            if (data.unlocked) fetchKeys();
        } catch (e) {
            console.error('Failed to check vault status', e);
        }
    };

    const fetchKeys = async () => {
        try {
            const res = await fetch(`${API_URL}/security/keys`);
            const data = await res.json();
            if (data.keys) setMaskedKeys(data.keys);
        } catch (e) { console.error(e); }
    };

    const initVault = async () => {
        setVaultLoading(true);
        try {
            const res = await fetch(`${API_URL}/security/init`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ masterPassword })
            });
            const data = await res.json();
            if (data.success) {
                setVaultStatus({ initialized: true, unlocked: true });
                fetchKeys();
                setMasterPassword('');
            } else { setVaultError(data.error); }
        } catch (e) { setVaultError('Error connecting to server'); }
        setVaultLoading(false);
    };

    const unlockVault = async () => {
        setVaultLoading(true); setVaultError('');
        try {
            const res = await fetch(`${API_URL}/security/unlock`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ masterPassword })
            });
            const data = await res.json();
            if (data.success) {
                setVaultStatus(prev => ({ ...prev, unlocked: true }));
                fetchKeys();
            } else { setVaultError(data.error); }
        } catch (e) { setVaultError('Error connecting to server'); }
        setVaultLoading(false);
    };

    const updateKey = async () => {
        if (!editingKey) return;
        try {
            const res = await fetch(`${API_URL}/security/keys`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key: editingKey, value: newKeyValue, masterPassword })
            });
            const data = await res.json();
            if (data.success) {
                setMaskedKeys(data.keys);
                setEditingKey(null);
                setNewKeyValue('');
                alert('Ключ обновлен и зашифрован!'); // Consider better UI feedback
            } else { alert(data.error); }
        } catch (e) { alert('Ошибка сохранения'); }
    };

    // --- ACCOUNT ACTIONS ---

    const handleChangePassword = async () => {
        if (newPassword !== confirmPassword) {
            setAccountMessage({ type: 'error', text: 'Пароли не совпадают' });
            return;
        }
        if (newPassword.length < 6) {
            setAccountMessage({ type: 'error', text: 'Пароль должен быть не менее 6 символов' });
            return;
        }
        if (!user || !user.email) return;

        setAccountLoading(true);
        setAccountMessage(null);

        try {
            // Re-authenticate user first (security best practice)
            // Note: This requires the user to input their CURRENT password.
            // We'll assume 'currentPassword' state holds this.
            // But 'start' flow implies we just update. Firebase might block if login wasn't recent.
            if (currentPassword) {
                const credential = EmailAuthProvider.credential(user.email, currentPassword);
                await reauthenticateWithCredential(user, credential);
            }

            await updatePassword(user, newPassword);
            setAccountMessage({ type: 'success', text: 'Пароль успешно обновлен!' });
            setNewPassword('');
            setConfirmPassword('');
            setCurrentPassword('');
        } catch (error: any) {
            console.error(error);
            if (error.code === 'auth/requires-recent-login') {
                setAccountMessage({ type: 'error', text: 'Пожалуйста, перезайдите в аккаунт, чтобы сменить пароль.' });
            } else {
                setAccountMessage({ type: 'error', text: 'Ошибка при смене пароля: ' + error.message });
            }
        }
        setAccountLoading(false);
    };

    const handleDeleteAccount = async () => {
        if (!user) return;
        setAccountLoading(true);
        try {
            await deleteUser(user);
            // successful deletion will trigger auth state change to null, redirect happens in App or Layout
        } catch (error: any) {
            console.error(error);
            if (error.code === 'auth/requires-recent-login') {
                setAccountMessage({ type: 'error', text: 'Для удаления аккаунта необходим недавний вход. Пожалуйста, перезайдите.' });
                setShowDeleteConfirm(false);
            } else {
                setAccountMessage({ type: 'error', text: 'Ошибка удаления: ' + error.message });
            }
        }
        setAccountLoading(false);
    }


    return (
        <div className="space-y-8 animate-ios-slide max-w-4xl mx-auto pb-12">

            {/* --- HEADER --- */}
            <header className="mb-8">
                <h2 className="text-3xl font-black text-ios-primary tracking-tight">Безопасность</h2>
                <p className="text-ios-secondary font-medium mt-2">Управление защитой аккаунта и системными ключами</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                {/* --- CARD 1: ACCOUNT SECURITY --- */}
                <section className="bg-ios-card p-8 rounded-[2.5rem] border border-ios shadow-sm relative overflow-hidden flex flex-col h-full">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-indigo-500 opacity-80" />

                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-2xl">
                            👤
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-ios-primary">Мой Аккаунт</h3>
                            <p className="text-xs text-ios-secondary font-mono">{user?.email}</p>
                        </div>
                    </div>

                    <div className="space-y-6 flex-1">
                        {/* Change Password Form */}
                        <div className="space-y-3">
                            <h4 className="text-xs font-bold text-ios-secondary uppercase tracking-wider">Смена пароля</h4>
                            <input
                                type="password"
                                placeholder="Текущий пароль (для подтверждения)"
                                className="w-full bg-ios-sub p-3 rounded-xl text-xs font-medium border border-transparent focus:border-blue-500 outline-none transition-colors"
                                value={currentPassword}
                                onChange={e => setCurrentPassword(e.target.value)}
                            />
                            <div className="grid grid-cols-2 gap-2">
                                <input
                                    type="password"
                                    placeholder="Новый пароль"
                                    className="w-full bg-ios-sub p-3 rounded-xl text-xs font-medium border border-transparent focus:border-blue-500 outline-none transition-colors"
                                    value={newPassword}
                                    onChange={e => setNewPassword(e.target.value)}
                                />
                                <input
                                    type="password"
                                    placeholder="Подтвердите"
                                    className="w-full bg-ios-sub p-3 rounded-xl text-xs font-medium border border-transparent focus:border-blue-500 outline-none transition-colors"
                                    value={confirmPassword}
                                    onChange={e => setConfirmPassword(e.target.value)}
                                />
                            </div>

                            {accountMessage && (
                                <div className={`text-[10px] p-2 rounded-lg font-bold text-center ${accountMessage.type === 'success' ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'}`}>
                                    {accountMessage.text}
                                </div>
                            )}

                            <button
                                onClick={handleChangePassword}
                                disabled={accountLoading || !newPassword}
                                className="w-full py-3 bg-ios-primary text-ios-bg rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {accountLoading ? 'Обновление...' : 'Обновить пароль'}
                            </button>
                        </div>

                        <div className="border-t border-ios-border my-6" />

                        {/* Danger Zone */}
                        <div>
                            <h4 className="text-xs font-bold text-red-500/80 uppercase tracking-wider mb-3">Опасная зона</h4>
                            {!showDeleteConfirm ? (
                                <button
                                    onClick={() => setShowDeleteConfirm(true)}
                                    className="w-full py-3 border border-red-200 bg-red-50 text-red-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-100 transition-colors"
                                >
                                    Удалить аккаунт
                                </button>
                            ) : (
                                <div className="bg-red-50 border border-red-100 p-4 rounded-xl animate-fade-in">
                                    <p className="text-[10px] text-red-800 font-bold mb-3 text-center">Вы уверены? Это действие необратимо.</p>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleDeleteAccount}
                                            className="flex-1 py-2 bg-red-600 text-white rounded-lg text-[9px] font-black uppercase shadow hover:bg-red-700"
                                        >
                                            Да, удалить
                                        </button>
                                        <button
                                            onClick={() => setShowDeleteConfirm(false)}
                                            className="flex-1 py-2 bg-white text-gray-700 rounded-lg text-[9px] font-black uppercase border"
                                        >
                                            Отмена
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </section>


                {/* --- CARD 2: SYSTEM VAULT --- */}
                <section className="bg-ios-card p-8 rounded-[2.5rem] border border-ios shadow-sm relative overflow-hidden flex flex-col h-full">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-500 to-teal-500 opacity-80" />

                    <div className="flex justify-between items-start mb-8">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-2xl">
                                🔐
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-ios-primary">System Vault</h3>
                                <p className="text-xs text-ios-secondary font-medium">Безопасное хранилище API ключей</p>
                            </div>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${vaultStatus.unlocked ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-600'}`}>
                            {vaultStatus.unlocked ? 'UNLOCKED' : 'LOCKED'}
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col justify-center">
                        {!vaultStatus.initialized ? (
                            // INITIALIZATION
                            <div className="space-y-4 w-full">
                                <div className="text-center mb-2">
                                    <p className="text-[10px] text-ios-secondary font-bold">Система не инициализирована</p>
                                </div>
                                <input
                                    type="password"
                                    placeholder="Создайте мастер-пароль"
                                    className="w-full bg-ios-sub p-3 rounded-xl text-xs font-bold border border-transparent focus:border-emerald-500 outline-none text-center transition-all"
                                    value={masterPassword}
                                    onChange={e => setMasterPassword(e.target.value)}
                                />
                                <button
                                    onClick={initVault}
                                    disabled={vaultLoading || !masterPassword}
                                    className="w-full py-3 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
                                >
                                    {vaultLoading ? 'Создание...' : 'Инициализировать Vault'}
                                </button>
                                {vaultError && <p className="text-red-500 text-[9px] font-bold text-center">{vaultError}</p>}
                            </div>
                        ) : !vaultStatus.unlocked ? (
                            // UNLOCK
                            <div className="space-y-4 w-full">
                                <div className="text-center mb-2">
                                    <p className="text-[10px] text-ios-secondary font-bold">Введите мастер-пароль для доступа</p>
                                </div>
                                <input
                                    type="password"
                                    placeholder="Мастер-пароль"
                                    className="w-full bg-ios-sub p-3 rounded-xl text-xs font-bold border border-transparent focus:border-emerald-500 outline-none text-center transition-all"
                                    value={masterPassword}
                                    onChange={e => setMasterPassword(e.target.value)}
                                />
                                <button
                                    onClick={unlockVault}
                                    disabled={vaultLoading || !masterPassword}
                                    className="w-full py-3 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
                                >
                                    {vaultLoading ? 'Проверка...' : 'Разблокировать'}
                                </button>
                                {vaultError && <p className="text-red-500 text-[9px] font-bold text-center">{vaultError}</p>}
                            </div>
                        ) : (
                            // MANAGE KEYS
                            <div className="space-y-4 w-full">
                                <div className="flex bg-ios-sub p-4 rounded-xl border border-ios-border items-center justify-between hover:border-emerald-500/30 transition-colors">
                                    <div>
                                        <p className="text-[9px] font-black text-ios-primary uppercase tracking-wider">Gemini API Key</p>
                                        <p className="text-[9px] font-mono text-ios-secondary mt-1 tracking-widest">{maskedKeys.GEMINI_API_KEY || '••••••••••••'}</p>
                                    </div>
                                    <button onClick={() => setEditingKey('GEMINI_API_KEY')} className="text-[10px] text-emerald-600 font-bold uppercase hover:underline">Изменить</button>
                                </div>

                                {editingKey && (
                                    <div className="bg-ios-sub border-2 border-dashed border-emerald-500/30 p-4 rounded-2xl space-y-3 animate-ios-slide">
                                        <p className="text-[10px] font-bold text-ios-primary">
                                            📝 Новый ключ для <span className="text-emerald-600">{editingKey}</span>
                                        </p>
                                        <input
                                            placeholder="sk-..."
                                            className="w-full bg-ios-card p-3 rounded-xl text-xs font-mono outline-none border border-transparent focus:border-emerald-500"
                                            value={newKeyValue}
                                            onChange={e => setNewKeyValue(e.target.value)}
                                        />
                                        <div className="text-[8px] text-ios-secondary font-medium">Ключ будет зашифрован автоматически.</div>

                                        <div className="flex gap-2">
                                            <button onClick={updateKey} className="flex-1 py-2 bg-emerald-600 text-white rounded-lg text-[9px] font-black uppercase shadow hover:bg-emerald-700 transition-colors">Сохранить</button>
                                            <button onClick={() => setEditingKey(null)} className="py-2 px-4 bg-ios-card text-ios-secondary rounded-lg text-[9px] font-black uppercase hover:bg-gray-50 transition-colors">Отмена</button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default SettingsSecurity;
