import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    isLoading?: boolean;
    icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
    children,
    variant = 'primary',
    size = 'md',
    isLoading,
    icon,
    className = '',
    disabled,
    ...props
}) => {
    const baseStyles = "relative font-semibold transition-all duration-200 active:scale-[0.96] disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2";

    const variants = {
        primary: "bg-ios-accent text-white shadow-sm hover:opacity-90",
        secondary: "bg-ios-sub text-ios-active hover:bg-ios-border",
        ghost: "bg-transparent text-ios-active hover:bg-ios-sub",
        destructive: "bg-red-500/10 text-red-500 hover:bg-red-500/20"
    };

    const sizes = {
        sm: "px-3 py-1.5 text-xs rounded-lg",
        md: "px-5 py-2.5 text-sm rounded-xl",
        lg: "px-6 py-3.5 text-base rounded-2xl"
    };

    return (
        <button
            className={`
        ${baseStyles} 
        ${variants[variant]} 
        ${sizes[size]} 
        ${className}
      `}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : icon}
            {children}
        </button>
    );
};
