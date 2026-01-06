import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    hoverEffect?: boolean;
    onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ children, className = '', hoverEffect = false, onClick }) => {
    return (
        <div
            onClick={onClick}
            className={`
        bg-ios-card/70 backdrop-blur-xl border border-ios rounded-3xl p-6
        ${hoverEffect ? 'transition-all duration-300 hover:shadow-ios-heavy hover:-translate-y-1 cursor-pointer' : 'shadow-ios'}
        ${className}
      `}
        >
            {children}
        </div>
    );
};
