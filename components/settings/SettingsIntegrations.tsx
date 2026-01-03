import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { useSocial } from '../../contexts/SocialContext';

const SettingsIntegrations: React.FC = () => {
    const { aiProvider, setAiProvider, setView, localModelConfig, setLocalModelConfig } = useApp();
    const { accounts, connectAccount, disconnectAccount } = useSocial();
    const [showConnectModal, setShowConnectModal] = useState(false);

    // API Integrations State
    const [maskedKeys, setMaskedKeys] = React.useState<Record<string, string>>({});
    const [selectedProvider, setSelectedProvider] = useState<any>(null);
    const [integrationModalOpen, setIntegrationModalOpen] = useState(false);
    const [apiKeyInput, setApiKeyInput] = useState('');
    const [masterPassword, setMasterPassword] = useState('');
    const [loading, setLoading] = useState(false);

    // Social State
    const [connectPlatform, setConnectPlatform] = useState<'instagram' | 'facebook' | 'whatsapp'>('instagram');
    const [connectUsername, setConnectUsername] = useState('');
    const [connectApiKey, setConnectApiKey] = useState('');
    const [connectApiSecret, setConnectApiSecret] = useState('');

    const API_URL = 'http://localhost:3005/api';

    React.useEffect(() => {
        fetchKeys();
    }, []);

    const fetchKeys = async () => {
        try {
            const res = await fetch(`${API_URL}/security/keys`);
            const data = await res.json();
            if (data.keys) setMaskedKeys(data.keys);
        } catch (e) {
            console.error("Failed to fetch keys", e);
        }
    };

    const providers = [
        { id: 'google', name: 'Google Cloud', key: 'GEMINI_API_KEY', icon: '☁️', desc: 'Gemini AI, Maps, Search' },
        { id: 'huggingface', name: 'Hugging Face', key: 'HUGGINGFACE_TOKEN', icon: '🤗', desc: 'Open Source Models' },
        { id: 'github', name: 'GitHub', key: 'GITHUB_TOKEN', icon: '🐙', desc: 'Repo Sync & Actions' },
        { id: 'facebook', name: 'Meta Graph', key: 'FACEBOOK_ACCESS_TOKEN', icon: '∞', desc: 'Instagram & WhatsApp API' },
    ];

    const localProfiles = [
        { id: 'mobile', name: 'Mobile (Nano)', icon: '📱', desc: 'Fast, Low Mem' },
        { id: 'pc', name: 'PC (Standard)', icon: '💻', desc: 'Balanced' },
        { id: 'imac', name: 'iMac (Pro)', icon: '🖥️', desc: 'Max Quality' },
    ];

    const localDevices = [
        { id: 'ios', name: 'iOS', icon: '🍎' },
        { id: 'android', name: 'Android', icon: '🤖' },
        { id: 'web', name: 'Web / PWA', icon: '🌐' },
    ];

    const handleConnectProvider = async () => {
        if (!selectedProvider || !apiKeyInput || !masterPassword) return;
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/security/keys`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    key: selectedProvider.key,
                    value: apiKeyInput,
                    masterPassword
                })
            });
            const data = await res.json();
            if (data.success) {
                setMaskedKeys(data.keys);
                setIntegrationModalOpen(false);
                setApiKeyInput('');
                setMasterPassword('');
                alert('Интеграция успешно подключена!');
            } else {
                alert('Ошибка: ' + data.error);
            }
        } catch (e) {
            alert('Ошибка сети');
        }
        setLoading(false);
    };

    const openProviderModal = (provider: any) => {
        setSelectedProvider(provider);
        setApiKeyInput('');
        setMasterPassword('');
        setIntegrationModalOpen(true);
    };

    return (
        <div className="space-y-6 animate-ios-slide max-w-5xl pb-20">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-black text-ios-primary tracking-tight">Интеграции</h2>
                    <p className="text-ios-secondary text-sm font-medium mt-1">Оркестрация AI и сервисов</p>
                </div>

                {/* MASTER SWITCH */}
                <div className="bg-ios-sub p-1.5 rounded-2xl border border-ios flex items-center gap-2">
                    <span className="text-[10px] font-bold text-ios-secondary uppercase pl-3 pr-1">Режим AI:</span>
                    <button
                        onClick={() => setAiProvider('api')}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${aiProvider === 'api' ? 'bg-ios-accent text-white shadow-lg' : 'text-ios-secondary hover:text-ios-primary'}`}
                    >
                        Cloud API
                    </button>
                    <button
                        onClick={() => setAiProvider('local')}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${aiProvider === 'local' ? 'bg-green-500 text-white shadow-lg' : 'text-ios-secondary hover:text-ios-primary'}`}
                    >
                        Local Host
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* --- LEFT COL: CLOUD MATRIX --- */}
                <section className={`bg-ios-card p-6 rounded-[2.5rem] border border-ios shadow-sm transition-opacity ${aiProvider === 'local' ? 'opacity-50 grayscale-[0.5]' : ''}`}>
                    <h3 className="text-xs font-black text-ios-primary uppercase tracking-widest mb-6 flex items-center gap-2">
                        ☁️ Cloud Providers
                        {aiProvider === 'api' && <span className="text-[8px] bg-blue-500/10 text-blue-600 px-2 py-0.5 rounded-full">ACTIVE</span>}
                    </h3>
                    <div className="space-y-3">
                        {providers.map(p => {
                            const isConnected = !!maskedKeys[p.key];
                            return (
                                <div key={p.id} className="bg-ios-sub p-4 rounded-3xl border border-ios flex items-center gap-4 hover:shadow-md transition-shadow group">
                                    <div className="w-10 h-10 bg-ios-card rounded-2xl flex items-center justify-center text-xl shadow-sm border border-ios">
                                        {p.icon}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-center mb-0.5">
                                            <p className="text-[10px] font-black text-ios-primary uppercase">{p.name}</p>
                                            {isConnected && <span className="text-[8px] text-green-600 bg-green-500/10 px-2 py-0.5 rounded-full font-black uppercase tracking-widest">Linked</span>}
                                        </div>
                                        <p className="text-[9px] text-ios-secondary font-medium truncate">{p.desc}</p>
                                    </div>
                                    <button
                                        onClick={() => openProviderModal(p)}
                                        className={`w-8 h-8 flex items-center justify-center rounded-xl text-[10px] font-black transition-all ${isConnected
                                            ? 'bg-ios-card text-ios-primary border border-ios'
                                            : 'bg-ios-primary text-ios-bg shadow-lg'
                                            }`}
                                    >
                                        {isConnected ? '✎' : '+'}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* --- RIGHT COL: LOCAL INTELLIGENCE --- */}
                <section className={`bg-ios-card p-6 rounded-[2.5rem] border border-ios shadow-sm transition-opacity ${aiProvider === 'api' ? 'opacity-80' : ''}`}>
                    <h3 className="text-xs font-black text-ios-primary uppercase tracking-widest mb-6 flex items-center gap-2">
                        🧠 Local Intelligence
                        {aiProvider === 'local' && <span className="text-[8px] bg-green-500/10 text-green-600 px-2 py-0.5 rounded-full">ACTIVE</span>}
                    </h3>

                    {/* Model Profile Selector */}
                    <div className="mb-6">
                        <label className="text-[9px] font-black text-ios-secondary uppercase mb-3 block ml-2">Hardware Profile</label>
                        <div className="grid grid-cols-3 gap-2">
                            {localProfiles.map(profile => (
                                <button
                                    key={profile.id}
                                    onClick={() => setLocalModelConfig({ ...localModelConfig, profile: profile.id as any })}
                                    className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all ${localModelConfig.profile === profile.id
                                        ? 'bg-green-500 text-white border-transparent shadow-lg scale-[1.02]'
                                        : 'bg-ios-sub text-ios-secondary border-ios hover:bg-white hover:shadow'
                                        }`}
                                >
                                    <span className="text-2xl mb-1">{profile.icon}</span>
                                    <span className="text-[9px] font-black uppercase">{profile.name.split(' ')[0]}</span>
                                    <span className="text-[8px] opacity-70">{profile.desc.split(' ')[0]}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Device Target Selector */}
                    <div>
                        <label className="text-[9px] font-black text-ios-secondary uppercase mb-3 block ml-2">Platform Target</label>
                        <div className="bg-ios-sub p-1.5 rounded-2xl border border-ios flex">
                            {localDevices.map(device => (
                                <button
                                    key={device.id}
                                    onClick={() => setLocalModelConfig({ ...localModelConfig, device: device.id as any })}
                                    className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-wider transition-all ${localModelConfig.device === device.id
                                        ? 'bg-white text-ios-primary shadow-md'
                                        : 'text-ios-secondary hover:text-ios-primary'
                                        }`}
                                >
                                    <span className="text-lg">{device.icon}</span>
                                    {device.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="mt-6 bg-green-500/5 p-4 rounded-2xl border border-green-500/10">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            <p className="text-[9px] font-mono text-green-700">
                                Running: <span className="font-bold">Llama-3-{localModelConfig.profile === 'mobile' ? 'Nano' : localModelConfig.profile === 'imac' ? '70B' : '8B'}</span>
                                <span className="mx-2">|</span>
                                Target: {localModelConfig.device.toUpperCase()}
                            </p>
                        </div>
                    </div>
                </section>
            </div>

            {/* CONNECTED ACCOUNTS GRID */}
            <h3 className="text-xs font-black text-ios-secondary uppercase tracking-widest mt-8 ml-4">Connected Accounts</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {accounts.map(acc => (
                    <div key={acc.id} className="bg-ios-card p-4 rounded-3xl border border-ios flex items-center gap-3 relative group hover:shadow-md transition-shadow">
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-lg shadow-sm ${acc.platform === 'instagram' ? 'bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 text-white' : 'bg-green-500 text-white'}`}>
                            {acc.platform === 'instagram' ? '📷' : '💬'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-black text-ios-primary truncate">{acc.name}</p>
                            <p className="text-[9px] text-ios-secondary truncate">@{acc.username}</p>
                        </div>
                        <button onClick={() => disconnectAccount(acc.id)} className="w-8 h-8 flex items-center justify-center text-red-500 bg-ios-sub rounded-xl opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50">✕</button>
                    </div>
                ))}
                <button onClick={() => setShowConnectModal(true)} className="bg-ios-sub border-2 border-dashed border-ios-border rounded-3xl flex items-center justify-center gap-2 p-4 min-h-[80px] hover:bg-white transition-colors group">
                    <span className="w-8 h-8 rounded-full bg-ios-primary text-ios-bg flex items-center justify-center text-lg shadow-sm group-hover:scale-110 transition-transform">+</span>
                    <span className="text-[9px] font-black uppercase text-ios-secondary">Link New</span>
                </button>
            </div>

            {/* DATABASE MANAGEMENT COMPACT */}
            <section className="bg-ios-sub/30 p-6 rounded-[2.5rem] border border-ios shadow-sm mt-8 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center text-2xl">🗄️</div>
                    <div>
                        <h3 className="text-xs font-black text-ios-primary uppercase tracking-widest">Database Console</h3>
                        <p className="text-[9px] text-ios-secondary font-medium">Manage backups, schemas, and logs</p>
                    </div>
                </div>
                <button
                    onClick={() => setView('DATABASE' as any)}
                    className="px-6 py-3 bg-ios-primary text-ios-bg rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg hover:rotate-2 transition-transform"
                >
                    Open Console
                </button>
            </section>

            {/* PROVIDER CONNECT MODAL */}
            {integrationModalOpen && selectedProvider && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 modal-backdrop" onClick={() => setIntegrationModalOpen(false)}>
                    <div className="bg-ios-card w-full max-w-sm rounded-[2.5rem] border border-ios shadow-2xl p-8 animate-fade-in-up" onClick={e => e.stopPropagation()}>
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-ios-sub rounded-2xl flex items-center justify-center text-4xl shadow-sm border border-ios mx-auto mb-4">
                                {selectedProvider.icon}
                            </div>
                            <h3 className="text-xl font-black text-ios-primary">{selectedProvider.name}</h3>
                            <p className="text-[10px] text-ios-secondary font-bold uppercase tracking-wide mt-1">Безопасное подключение</p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-[8px] font-black uppercase text-ios-secondary ml-3 block mb-1">API Key / Token</label>
                                <input
                                    value={apiKeyInput}
                                    onChange={e => setApiKeyInput(e.target.value)}
                                    placeholder={maskedKeys[selectedProvider.key] ? '••••••••' : 'sk-...'}
                                    className="w-full bg-ios-sub border-transparent focus:border-ios-accent border rounded-2xl px-4 py-3 text-xs font-mono font-bold outline-none transition-colors"
                                />
                            </div>
                            <div>
                                <label className="text-[8px] font-black uppercase text-ios-secondary ml-3 block mb-1">Мастер-пароль (для шифрования)</label>
                                <input
                                    type="password"
                                    value={masterPassword}
                                    onChange={e => setMasterPassword(e.target.value)}
                                    placeholder="Ваш Vault пароль"
                                    className="w-full bg-ios-sub border-transparent focus:border-ios-accent border rounded-2xl px-4 py-3 text-xs font-bold outline-none transition-colors"
                                />
                            </div>
                        </div>

                        <button
                            onClick={handleConnectProvider}
                            disabled={loading || !apiKeyInput || !masterPassword}
                            className="w-full py-4 bg-ios-accent text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg spring-press mt-8 disabled:opacity-50"
                        >
                            {loading ? 'Защита и сохранение...' : '🔒 Сохранить в Vault'}
                        </button>
                    </div>
                </div>
            )}

            {/* CONNECT MODAL */}
            {showConnectModal && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 modal-backdrop" onClick={() => setShowConnectModal(false)}>
                    <div className="bg-ios-card w-full max-w-md rounded-[2.5rem] border border-ios shadow-2xl p-8 animate-ios-slide" onClick={e => e.stopPropagation()}>
                        <h3 className="text-xl font-black text-ios-primary mb-2">Подключение</h3>
                        <p className="text-[11px] text-ios-secondary font-medium mb-6">Выберите платформу и введите данные аккаунта</p>

                        <div className="flex bg-ios-sub p-1 rounded-2xl border border-ios mb-6">
                            {(['instagram', 'facebook', 'whatsapp'] as const).map(p => (
                                <button key={p} onClick={() => setConnectPlatform(p)} className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${connectPlatform === p ? 'bg-ios-accent text-white shadow-lg' : 'text-ios-secondary'}`}>
                                    {p}
                                </button>
                            ))}
                        </div>

                        <div className="space-y-4 mb-8">
                            <div className="space-y-1">
                                <label className="text-[9px] font-black uppercase text-ios-secondary ml-3">Username / Login</label>
                                <input value={connectUsername} onChange={e => setConnectUsername(e.target.value)} className="w-full bg-ios-sub border-transparent focus:border-ios-accent border rounded-2xl px-4 py-3 text-sm font-bold outline-none transition-colors" placeholder="@username" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[9px] font-black uppercase text-ios-secondary ml-3">API Key / Access Token</label>
                                <input value={connectApiKey} onChange={e => setConnectApiKey(e.target.value)} type="password" className="w-full bg-ios-sub border-transparent focus:border-ios-accent border rounded-2xl px-4 py-3 text-sm font-bold outline-none transition-colors" placeholder="Starts with sk- or EA..." />
                            </div>
                            {connectPlatform === 'instagram' && (
                                <div className="space-y-1">
                                    <label className="text-[9px] font-black uppercase text-ios-secondary ml-3">App Secret (Optional)</label>
                                    <input value={connectApiSecret} onChange={e => setConnectApiSecret(e.target.value)} type="password" className="w-full bg-ios-sub border-transparent focus:border-ios-accent border rounded-2xl px-4 py-3 text-sm font-bold outline-none transition-colors" placeholder="App Secret if needed" />
                                </div>
                            )}
                        </div>

                        <div className="flex gap-3">
                            <button onClick={() => {
                                connectAccount(connectPlatform, {
                                    username: connectUsername,
                                    apiKey: connectApiKey,
                                    apiSecret: connectApiSecret
                                });
                                setShowConnectModal(false);
                                setConnectUsername('');
                                setConnectApiKey('');
                                setConnectApiSecret('');
                            }} className="flex-1 bg-ios-accent text-white py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl spring-press">Подключить</button>
                            <button onClick={() => setShowConnectModal(false)} className="px-6 bg-ios-sub text-ios-secondary py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest border border-ios spring-press">Отмена</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SettingsIntegrations;
