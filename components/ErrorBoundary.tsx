import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex flex-col items-center justify-center bg-red-50 p-6 text-center">
                    <h1 className="text-3xl font-black text-red-600 mb-4">Что-то пошло не так</h1>
                    <p className="text-gray-700 mb-6 max-w-md">
                        Произошла критическая ошибка. Пожалуйста, перезагрузите страницу или обратитесь к администратору.
                    </p>
                    <pre className="bg-white p-4 rounded-xl border border-red-200 text-left text-xs text-red-500 overflow-auto max-w-full">
                        {this.state.error?.toString()}
                    </pre>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-6 bg-red-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-red-700 transition-colors"
                    >
                        Перезагрузить
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
