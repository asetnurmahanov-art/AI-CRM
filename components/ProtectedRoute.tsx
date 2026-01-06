import React, { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useApp } from '../contexts/AppContext';
import { UserRole, SubscriptionPlan, View } from '../types';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requiredRole?: UserRole;
    requiredPlan?: SubscriptionPlan;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
    children,
    requiredRole = UserRole.EMPLOYEE,
    requiredPlan = 'free'
}) => {
    const { checkAccess, loading } = useAuth();
    const { setView } = useApp();

    const hasAccess = checkAccess(requiredRole, requiredPlan);

    useEffect(() => {
        if (!loading && !hasAccess) {
            // Redirect to dashboard if access denied
            // We can also show a toast notification here
            console.warn("Access Denied. Redirecting to Dashboard.");
        }
    }, [loading, hasAccess]);

    if (loading) {
        return <div className="flex items-center justify-center h-full text-ios-secondary">Проверка прав...</div>;
    }

    if (!hasAccess) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center animate-ios-slide">
                <div className="text-6xl mb-4">🔒</div>
                <h2 className="text-2xl font-black text-ios-primary mb-2">Доступ ограничен</h2>
                <p className="text-ios-secondary font-medium mb-6 max-w-md">
                    У вас недостаточно прав для просмотра этой страницы. <br />
                    Необходима роль <b>{requiredRole}</b> или план <b>{requiredPlan}</b>.
                </p>
                <button
                    onClick={() => setView(View.DASHBOARD)}
                    className="bg-ios-primary text-ios-bg px-6 py-3 rounded-xl font-black active:scale-95 transition-transform"
                >
                    На главную
                </button>
            </div>
        );
    }

    return <>{children}</>;
};

export default ProtectedRoute;
