
import React, { useState } from 'react';
import {
    signInWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithPopup,
    sendPasswordResetEmail
} from 'firebase/auth';
import { auth } from '../firebase';

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [isResetting, setIsResetting] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (err: any) {
            console.error(err);
            setError('Ошибка входа: ' + (translateFirebaseError(err.code) || err.message));
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setLoading(true);
        setError('');
        try {
            const provider = new GoogleAuthProvider();
            await signInWithPopup(auth, provider);
        } catch (err: any) {
            console.error(err);
            setError('Ошибка Google входа: ' + (translateFirebaseError(err.code) || err.message));
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) {
            setError('Пожалуйста, введите ваш Email');
            return;
        }
        setLoading(true);
        setError('');
        setSuccessMessage('');

        try {
            await sendPasswordResetEmail(auth, email);
            setSuccessMessage('Ссылка для сброса пароля отправлена на ваш Email');
            setTimeout(() => {
                setIsResetting(false);
                setSuccessMessage('');
            }, 3000);
        } catch (err: any) {
            console.error(err);
            setError('Ошибка сброса: ' + (translateFirebaseError(err.code) || err.message));
        } finally {
            setLoading(false);
        }
    };

    const translateFirebaseError = (code: string) => {
        switch (code) {
            case 'auth/invalid-email': return 'Некорректный Email';
            case 'auth/user-disabled': return 'Пользователь заблокирован';
            case 'auth/user-not-found': return 'Пользователь не найден';
            case 'auth/wrong-password': return 'Неверный пароль';
            case 'auth/email-already-in-use': return 'Email уже используется';
            case 'auth/popup-closed-by-user': return 'Вход отменен пользователем';
            case 'auth/configuration-not-found': return 'Вход через Google не настроен в консоли Firebase';
            case 'auth/operation-not-allowed': return 'Этот метод входа отключен в проекте';
            case 'auth/popup-blocked': return 'Браузер заблокировал всплывающее окно';
            case 'auth/too-many-requests': return 'Слишком много попыток. Попробуйте позже';
            default: return null;
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4 font-sans">
            <div className="bg-white p-8 md:p-10 rounded-3xl shadow-2xl w-full max-w-md border border-white/50 backdrop-blur-xl transition-all hover:shadow-3xl">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2">Умный Бизнес</h1>
                    <p className="text-gray-500 text-sm">Войдите, чтобы управлять вашим бизнесом</p>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl mb-6 text-sm flex items-start animate-fade-in">
                        <span className="mr-2">⚠️</span>
                        {error}
                    </div>
                )}

                {successMessage && (
                    <div className="bg-green-50 border border-green-100 text-green-600 p-4 rounded-xl mb-6 text-sm flex items-start animate-fade-in">
                        <span className="mr-2">✅</span>
                        {successMessage}
                    </div>
                )}

                {isResetting ? (
                    // Reset Password Form
                    <form onSubmit={handleResetPassword} className="space-y-5 animate-fade-in-up">
                        <h2 className="text-xl font-bold text-gray-800">Восстановление пароля</h2>
                        <p className="text-sm text-gray-500 mb-4">Введите ваш email, и мы отправим вам ссылку для сброса пароля.</p>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-gray-300"
                                placeholder="your@email.com"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-3.5 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-600/30 hover:bg-blue-700 hover:shadow-blue-700/40 active:scale-[0.98] transition-all duration-200 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {loading ? 'Отправка...' : 'Отправить ссылку'}
                        </button>
                        <button
                            type="button"
                            onClick={() => { setIsResetting(false); setError(''); }}
                            className="w-full py-2 text-sm text-gray-500 hover:text-gray-800 font-medium transition-colors"
                        >
                            ← Вернуться ко входу
                        </button>
                    </form>
                ) : (
                    // Login Form
                    <div className="space-y-6 animate-fade-in-up">
                        <form onSubmit={handleLogin} className="space-y-5">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">Email</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-gray-300"
                                    placeholder="admin@smart-business.kz"
                                    required
                                />
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-2 ml-1">
                                    <label className="text-sm font-semibold text-gray-700">Пароль</label>
                                    <button
                                        type="button"
                                        onClick={() => { setIsResetting(true); setError(''); }}
                                        className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                                    >
                                        Забыли пароль?
                                    </button>
                                </div>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-gray-300"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full py-3.5 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-600/30 hover:bg-blue-700 hover:shadow-blue-700/40 active:scale-[0.98] transition-all duration-200 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                {loading ? 'Вход...' : 'Войти'}
                            </button>
                        </form>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-200"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-3 bg-white text-gray-500 font-medium">Или войдите через</span>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={handleGoogleLogin}
                            disabled={loading}
                            className={`w-full py-3.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold shadow-sm hover:bg-gray-50 hover:border-gray-300 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-3 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    fill="#4285F4"
                                />
                                <path
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    fill="#34A853"
                                />
                                <path
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                    fill="#FBBC05"
                                />
                                <path
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    fill="#EA4335"
                                />
                            </svg>
                            Google
                        </button>
                    </div>
                )}

                <div className="mt-8 text-center">
                    <p className="text-xs text-gray-400">
                        © 2026 Умный Бизнес CRM. Все права защищены.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
