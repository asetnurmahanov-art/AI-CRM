import React, { useEffect, useState } from 'react';
import { collection, query, onSnapshot, doc, updateDoc, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';
import { UserProfile, UserRole, SubscriptionPlan } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

const UserManagement: React.FC = () => {
    const { userProfile: currentUserProfile } = useAuth();
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingUser, setEditingUser] = useState<string | null>(null);

    // Temporary state for edits
    const [tempRole, setTempRole] = useState<UserRole>(UserRole.EMPLOYEE);
    const [tempPlan, setTempPlan] = useState<SubscriptionPlan>('free');

    useEffect(() => {
        const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const usersData: UserProfile[] = [];
            querySnapshot.forEach((doc) => {
                usersData.push(doc.data() as UserProfile);
            });
            setUsers(usersData);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleEditClick = (user: UserProfile) => {
        setEditingUser(user.uid);
        setTempRole(user.role);
        setTempPlan(user.plan);
    };

    const handleSave = async (uid: string) => {
        try {
            const userRef = doc(db, 'users', uid);
            await updateDoc(userRef, {
                role: tempRole,
                plan: tempPlan
            });
            setEditingUser(null);
        } catch (error) {
            console.error("Error updating user:", error);
            alert("Failed to update user");
        }
    };

    const handleCancel = () => {
        setEditingUser(null);
    };

    if (loading) return <div className="p-8 text-center text-ios-secondary">Загрузка пользователей...</div>;

    return (
        <div className="space-y-6 animate-ios-slide">
            <header>
                <h3 className="text-2xl font-black text-ios-primary">Пользователи</h3>
                <p className="text-ios-secondary font-bold text-xs uppercase tracking-wide">Управление доступом и подписками</p>
            </header>

            <div className="bg-ios-card rounded-[2rem] border border-ios shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-ios-border/50">
                                <th className="p-6 text-[10px] uppercase tracking-widest text-ios-secondary font-black">Пользователь</th>
                                <th className="p-6 text-[10px] uppercase tracking-widest text-ios-secondary font-black">Роль</th>
                                <th className="p-6 text-[10px] uppercase tracking-widest text-ios-secondary font-black">План</th>
                                <th className="p-6 text-[10px] uppercase tracking-widest text-ios-secondary font-black">Статус</th>
                                <th className="p-6 text-[10px] uppercase tracking-widest text-ios-secondary font-black text-right">Действия</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-ios-border/50">
                            {users.map((user) => (
                                <tr key={user.uid} className="group hover:bg-ios-sub/30 transition-colors">
                                    <td className="p-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-ios-accent to-purple-500 flex items-center justify-center text-white font-black text-sm">
                                                {user.displayName ? user.displayName.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="font-bold text-ios-primary text-sm">{user.displayName || 'Без имени'}</div>
                                                <div className="text-xs text-ios-secondary font-medium">{user.email}</div>
                                            </div>
                                        </div>
                                    </td>

                                    <td className="p-6">
                                        {editingUser === user.uid ? (
                                            <select
                                                value={tempRole}
                                                onChange={(e) => setTempRole(e.target.value as UserRole)}
                                                className="bg-ios-bg border border-ios-border rounded-lg text-xs font-bold p-2 outline-none focus:border-ios-accent"
                                            >
                                                {Object.values(UserRole).map(role => (
                                                    <option key={role} value={role}>{role}</option>
                                                ))}
                                            </select>
                                        ) : (
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wide
                        ${user.role === UserRole.OWNER ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' :
                                                    user.role === UserRole.ADMIN ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                                                        user.role === UserRole.MANAGER ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300' :
                                                            'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'}`}>
                                                {user.role}
                                            </span>
                                        )}
                                    </td>

                                    <td className="p-6">
                                        {editingUser === user.uid ? (
                                            <select
                                                value={tempPlan}
                                                onChange={(e) => setTempPlan(e.target.value as SubscriptionPlan)}
                                                className="bg-ios-bg border border-ios-border rounded-lg text-xs font-bold p-2 outline-none focus:border-ios-accent"
                                            >
                                                <option value="free">Free</option>
                                                <option value="pro">Pro</option>
                                                <option value="premium">Premium</option>
                                            </select>
                                        ) : (
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wide
                        ${user.plan === 'premium' ? 'bg-gradient-to-r from-orange-400 to-pink-500 text-white' :
                                                    user.plan === 'pro' ? 'bg-blue-500 text-white' :
                                                        'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}`}>
                                                {user.plan}
                                            </span>
                                        )}
                                    </td>

                                    <td className="p-6">
                                        <span className={`inline-flex w-2 h-2 rounded-full ${user.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                    </td>

                                    <td className="p-6 text-right">
                                        {editingUser === user.uid ? (
                                            <div className="flex items-center justify-end gap-2">
                                                <button onClick={() => handleSave(user.uid)} className="p-2 text-green-600 hover:bg-green-50 rounded-lg">
                                                    💾
                                                </button>
                                                <button onClick={handleCancel} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                                                    ✕
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => handleEditClick(user)}
                                                disabled={currentUserProfile?.role !== UserRole.OWNER && user.role === UserRole.OWNER}
                                                className="p-2 text-ios-secondary hover:text-ios-primary hover:bg-ios-sub rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                            >
                                                ✏️
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default UserManagement;
