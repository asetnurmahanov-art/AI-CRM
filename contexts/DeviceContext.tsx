import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type DeviceType = 'mobile' | 'tablet' | 'desktop';
export type Orientation = 'portrait' | 'landscape';

interface DeviceState {
    device: DeviceType;
    isMobile: boolean;
    isTablet: boolean;
    isDesktop: boolean;
    orientation: Orientation;
    width: number;
    height: number;
}

const DeviceContext = createContext<DeviceState | undefined>(undefined);

export const DeviceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [windowSize, setWindowSize] = useState({
        width: typeof window !== 'undefined' ? window.innerWidth : 1200,
        height: typeof window !== 'undefined' ? window.innerHeight : 800,
    });

    const getDeviceType = (width: number): DeviceType => {
        if (width < 768) return 'mobile';
        if (width >= 768 && width < 1024) return 'tablet';
        return 'desktop';
    };

    const getOrientation = (width: number, height: number): Orientation => {
        return width > height ? 'landscape' : 'portrait';
    };

    const [deviceState, setDeviceState] = useState<DeviceState>({
        device: getDeviceType(windowSize.width),
        isMobile: windowSize.width < 768,
        isTablet: windowSize.width >= 768 && windowSize.width < 1024,
        isDesktop: windowSize.width >= 1024,
        orientation: getOrientation(windowSize.width, windowSize.height),
        width: windowSize.width,
        height: windowSize.height,
    });

    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth;
            const height = window.innerHeight;

            setWindowSize({ width, height });

            const device = getDeviceType(width);

            setDeviceState({
                device,
                isMobile: device === 'mobile',
                isTablet: device === 'tablet',
                isDesktop: device === 'desktop',
                orientation: getOrientation(width, height),
                width,
                height,
            });
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <DeviceContext.Provider value={deviceState}>
            {children}
        </DeviceContext.Provider>
    );
};

export const useDevice = () => {
    const context = useContext(DeviceContext);
    if (!context) throw new Error('useDevice must be used within a DeviceProvider');
    return context;
};
