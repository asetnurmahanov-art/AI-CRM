
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, onSnapshot, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { UserRole, SubscriptionPlan, UserProfile } from '../types';

interface AuthContextType {
    user: User | null;
    userProfile: UserProfile | null;
    loading: boolean;
    logout: () => Promise<void>;
    checkAccess: (requiredRole: UserRole, requiredPlan?: SubscriptionPlan) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let unsubscribeProfile: (() => void) | null = null;
        console.log("AuthProvider: Initializing auth listener...");

        const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
            console.log("AuthProvider: Auth state changed. User:", currentUser?.uid);
            setUser(currentUser);

            // Clean up previous profile listener if exists
            if (unsubscribeProfile) {
                console.log("AuthProvider: Cleaning up previous profile listener");
                unsubscribeProfile();
                unsubscribeProfile = null;
            }

            if (currentUser) {
                console.log("AuthProvider: User logged in. Starting profile fetch...");
                const userRef = doc(db, 'users', currentUser.uid);

                // Strategy: Fetch once with timeout to unblock UI, then listen
                const fetchProfile = async () => {
                    try {
                        console.log("AuthProvider: Fetching profile document...");
                        const docSnap = await getDoc(userRef);
                        console.log("AuthProvider: Fetch complete. Exists:", docSnap.exists());

                        if (docSnap.exists()) {
                            setUserProfile(docSnap.data() as UserProfile);
                        } else {
                            console.log("AuthProvider: Profile missing. Creating default...");
                            const newProfile: UserProfile = {
                                uid: currentUser.uid,
                                email: currentUser.email || '',
                                displayName: currentUser.displayName || '',
                                photoURL: currentUser.photoURL || '',
                                role: UserRole.EMPLOYEE,
                                plan: 'free',
                                status: 'active',
                                createdAt: new Date().toISOString(),
                                lastLogin: new Date().toISOString()
                            };
                            await setDoc(userRef, newProfile);
                            console.log("AuthProvider: Default profile created.");
                            setUserProfile(newProfile);
                        }
                    } catch (e) {
                        console.error("AuthProvider: Initial fetch failed:", e);
                    }
                };

                // Race: Data vs Timeout (4s)
                const timeoutPromise = new Promise(resolve => setTimeout(() => {
                    console.warn("AuthProvider: Profile fetch timed out. Unblocking UI.");
                    resolve(true); // Resolve to unblock
                }, 4000));

                // Wait for either fetch or timeout
                await Promise.race([fetchProfile(), timeoutPromise]);

                setLoading(false); // Guaranteed unblock

                // Setup listener for future updates
                unsubscribeProfile = onSnapshot(userRef, (docSnap) => {
                    if (docSnap.exists()) {
                        setUserProfile(docSnap.data() as UserProfile);
                    }
                }, (error) => {
                    console.error("AuthProvider: Snapshot listener error:", error);
                });
            } else {
                console.log("AuthProvider: User logged out. Clearing profile.");
                setUserProfile(null);
                setLoading(false);
            }
        });

        return () => {
            console.log("AuthProvider: Unmounting. Cleaning up listeners.");
            if (unsubscribeProfile) unsubscribeProfile();
            unsubscribeAuth();
        };
    }, []);

    const logout = async () => {
        await signOut(auth);
    };

    const checkAccess = (requiredRole: UserRole, requiredPlan: SubscriptionPlan = 'free'): boolean => {
        if (!userProfile) return false;
        if (userProfile.status !== 'active') return false;
        if (userProfile.role === UserRole.OWNER) return true; // Owner has full access

        // Role hierarchy
        const roles = [UserRole.EMPLOYEE, UserRole.MANAGER, UserRole.ADMIN, UserRole.OWNER];
        const userRoleIndex = roles.indexOf(userProfile.role);
        const requiredRoleIndex = roles.indexOf(requiredRole);

        // Plan hierarchy
        const plans = ['free', 'pro', 'premium'];
        const userPlanIndex = plans.indexOf(userProfile.plan);
        const requiredPlanIndex = plans.indexOf(requiredPlan);

        return userRoleIndex >= requiredRoleIndex && userPlanIndex >= requiredPlanIndex;
    };

    return (
        <AuthContext.Provider value={{ user, userProfile, loading, logout, checkAccess }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};
