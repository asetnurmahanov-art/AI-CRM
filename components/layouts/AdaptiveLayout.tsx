import React, { useState } from 'react';
import { useDevice } from '../../contexts/DeviceContext';
import { useAuth } from '../../contexts/AuthContext';
import NavRail from '../navigation/NavRail';
import BottomNav from '../navigation/BottomNav';
import MobileMenu from '../navigation/MobileMenu';
import Sidebar from '../Sidebar';
import MobileHeader from '../MobileHeader';

interface AdaptiveLayoutProps {
    children: React.ReactNode;
}

const AdaptiveLayout: React.FC<AdaptiveLayoutProps> = ({ children }) => {
    const { isMobile, isTablet, isDesktop } = useDevice();
    const { logout } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleLogout = async () => {
        await logout();
    };

    return (
        <div className="flex min-h-screen bg-ios-bg selection:bg-ios-accent selection:text-white transition-colors duration-500 overflow-hidden">

            {/* --- DESKTOP LAYOUT --- */}
            {isDesktop && (
                <div className="fixed inset-y-0 left-0 w-64 z-40">
                    <Sidebar onLogout={handleLogout} />
                </div>
            )}

            {/* --- TABLET LAYOUT --- */}
            {isTablet && (
                <NavRail onLogout={handleLogout} />
            )}

            {/* --- MAIN CONTENT WRAPPER --- */}
            <div
                className={`flex-1 flex flex-col h-screen transition-all duration-300
          ${isDesktop ? 'pl-64' : ''} 
          ${isTablet ? 'pl-20' : ''}
        `}
            >
                {/* Mobile Header (Only on Mobile) */}
                {isMobile && <MobileHeader />}

                <main className={`flex-1 overflow-y-auto scroll-smooth no-scrollbar
          ${isMobile ? 'pb-24 pt-16 px-3' : 'p-6'}
        `}>
                    <div className="max-w-[1600px] mx-auto pb-10">
                        {children}
                    </div>
                </main>

                {/* --- MOBILE NAVIGATION --- */}
                {isMobile && (
                    <>
                        <BottomNav onMenuClick={() => setIsMobileMenuOpen(true)} />
                        <MobileMenu
                            isOpen={isMobileMenuOpen}
                            onClose={() => setIsMobileMenuOpen(false)}
                            onLogout={handleLogout}
                        />
                    </>
                )}
            </div>

        </div>
    );
};

export default AdaptiveLayout;
