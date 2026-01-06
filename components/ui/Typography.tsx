import React from 'react';

interface TextProps {
    children: React.ReactNode;
    className?: string;
}

export const Title: React.FC<TextProps> = ({ children, className = '' }) => (
    <h2 className={`text-2xl md:text-3xl font-bold tracking-tight text-ios-primary ${className}`}>
        {children}
    </h2>
);

export const Subtitle: React.FC<TextProps> = ({ children, className = '' }) => (
    <h3 className={`text-lg font-semibold text-ios-primary ${className}`}>
        {children}
    </h3>
);

export const Caption: React.FC<TextProps> = ({ children, className = '' }) => (
    <p className={`text-xs font-medium text-ios-secondary uppercase tracking-wider ${className}`}>
        {children}
    </p>
);
