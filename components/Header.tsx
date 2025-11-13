import React from 'react';
import { LogoIcon } from './icons/LogoIcon';
import { UserProfile } from './UserProfile';
import type { User } from '../services/firebaseService';
import { ThemeSwitcher } from './ThemeSwitcher';

interface HeaderProps {
    user: User | null;
    onSettingsClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ user, onSettingsClick }) => {
    return (
        <header className="py-3 px-6 border-b border-border-color bg-panel-color backdrop-blur-lg sticky top-0 z-20">
            <div className="container mx-auto flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <LogoIcon className="w-8 h-8 text-emerald-400" />
                    <h1 className="text-2xl font-bold text-text-primary tracking-tight">
                        Great Trades <span className="text-emerald-400">AI</span>
                    </h1>
                </div>
                <div className="flex items-center gap-4">
                    <ThemeSwitcher />
                    {user && <UserProfile user={user} onSettingsClick={onSettingsClick} />}
                </div>
            </div>
        </header>
    );
};