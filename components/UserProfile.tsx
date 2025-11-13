import React, { useState, useRef, useEffect } from 'react';
import { logout, type User } from '../services/firebaseService';
import { SettingsIcon } from './icons/SettingsIcon';
import { HelpIcon } from './icons/HelpIcon';
import { LogoutIcon } from './icons/LogoutIcon';

interface UserProfileProps {
    user: User;
    onSettingsClick: () => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({ user, onSettingsClick }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    
    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            console.error("Failed to sign out:", error);
        }
    };
    
    const UserMenuItem: React.FC<{ icon: React.ReactNode, text: string, onClick?: () => void }> = ({ icon, text, onClick }) => (
        <button
            onClick={onClick}
            className="w-full flex items-center gap-3 text-left px-4 py-2 text-sm text-text-primary hover:bg-emerald-600/50 hover:text-white rounded-md transition-colors"
        >
            {icon}
            <span>{text}</span>
        </button>
    );

    return (
        <div id="tour-step-5" className="relative" ref={dropdownRef}>
            <button onClick={() => setIsOpen(!isOpen)} className="flex items-center gap-2 focus:outline-none rounded-full focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-bg-color">
                <img 
                    src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName || user.email?.split('@')[0] || 'U'}&background=2dd4bf&color=0c101d&rounded=true`}
                    alt="User Avatar"
                    className="w-9 h-9 rounded-full border-2 border-emerald-400/50"
                />
            </button>
            
            {isOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-bg-color-alt border border-border-color rounded-lg shadow-xl animate-fade-in-up" style={{ animationDuration: '0.2s' }}>
                    <div className="p-4 border-b border-border-color">
                        <p className="font-semibold text-text-primary truncate">{user.displayName || user.email?.split('@')[0] || 'User'}</p>
                        <p className="text-sm text-text-secondary truncate">{user.email}</p>
                    </div>
                    <div className="p-2 space-y-1">
                         <UserMenuItem icon={<SettingsIcon />} text="Account Settings" onClick={() => { onSettingsClick(); setIsOpen(false); }} />
                         <a href="mailto:sujanbasu741103@gmail.com" className="w-full flex items-center gap-3 text-left px-4 py-2 text-sm text-text-primary hover:bg-emerald-600/50 hover:text-white rounded-md transition-colors">
                            <HelpIcon />
                            <span>Help Center</span>
                         </a>
                         <hr className="border-t border-border-color my-1" />
                         <UserMenuItem icon={<LogoutIcon />} text="Sign Out" onClick={handleLogout} />
                    </div>
                </div>
            )}
        </div>
    );
};
