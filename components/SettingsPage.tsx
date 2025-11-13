import React, { useState } from 'react';
import { Modal } from './Modal';
import { updateUserProfile, reauthenticateUser, updateUserPassword, deleteUserAccount, type User } from '../services/firebaseService';
import { UserIcon } from './icons/UserIcon';
import { LockIcon } from './icons/LockIcon';
import { DangerIcon } from './icons/DangerIcon';

interface SettingsPageProps {
    user: User;
    onClose: () => void;
    addToast: (message: string, type: 'success' | 'error') => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ user, onClose, addToast }) => {
    const [activeTab, setActiveTab] = useState('profile');
    const [displayName, setDisplayName] = useState(user.displayName || '');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [deleteConfirmText, setDeleteConfirmText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (displayName === user.displayName) return;
        setIsLoading(true);
        setError(null);
        try {
            await updateUserProfile(user, { displayName });
            addToast('Profile updated successfully!', 'success');
            onClose();
        } catch (err: any) {
            setError(err.message);
            addToast('Failed to update profile.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setError("New passwords do not match.");
            return;
        }
        if (newPassword.length < 6) {
            setError("Password must be at least 6 characters long.");
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            await reauthenticateUser(user, currentPassword);
            await updateUserPassword(user, newPassword);
            addToast('Password changed successfully!', 'success');
            onClose();
        } catch (err: any) {
            setError("Failed to change password. Please check your current password.");
            addToast('Failed to change password.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteAccount = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        try {
            await reauthenticateUser(user, currentPassword);
            await deleteUserAccount(user);
            addToast('Account deleted successfully.', 'success');
            // User will be signed out automatically by onAuthChange
        } catch (err: any) {
            setError("Failed to delete account. Please check your password.");
            addToast('Failed to delete account.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'password':
                return (
                    <form onSubmit={handlePasswordChange} className="space-y-4">
                        <p className="text-sm text-text-secondary">For your security, please enter your current password to make changes.</p>
                        <div>
                            <label className="block text-sm font-medium text-text-primary">Current Password</label>
                            <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required className="input-style" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-primary">New Password</label>
                            <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required className="input-style" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-primary">Confirm New Password</label>
                            <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required className="input-style" />
                        </div>
                        {error && <p className="text-red-400 text-sm">{error}</p>}
                        <button type="submit" className="w-full btn-primary" disabled={isLoading}>{isLoading ? 'Saving...' : 'Save Changes'}</button>
                    </form>
                );
            case 'danger':
                return (
                     <form onSubmit={handleDeleteAccount} className="space-y-4">
                        <p className="text-sm text-red-400">This action is irreversible. All your data, including analysis history, will be permanently deleted.</p>
                        <div>
                            <label className="block text-sm font-medium text-text-primary">To confirm, type "delete my account" below:</label>
                             <input type="text" value={deleteConfirmText} onChange={e => setDeleteConfirmText(e.target.value)} className="input-style" />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-text-primary">Enter Your Password</label>
                            <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required className="input-style" />
                        </div>
                        {error && <p className="text-red-400 text-sm">{error}</p>}
                        <button type="submit" className="w-full btn-danger" disabled={isLoading || deleteConfirmText !== 'delete my account'}>{isLoading ? 'Deleting...' : 'Delete My Account'}</button>
                    </form>
                );
            case 'profile':
            default:
                return (
                    <form onSubmit={handleProfileUpdate} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-text-primary">Display Name</label>
                            <input type="text" value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Enter your name" className="input-style" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-primary">Email</label>
                            <p className="text-text-secondary mt-1">{user.email}</p>
                        </div>
                        {error && <p className="text-red-400 text-sm">{error}</p>}
                        <button type="submit" className="w-full btn-primary" disabled={isLoading}>{isLoading ? 'Saving...' : 'Save Changes'}</button>
                    </form>
                );
        }
    };

    return (
        <Modal title="Account Settings" onClose={onClose}>
            <div className="flex">
                <div className="w-1/3 pr-4 border-r border-border-color">
                    <nav className="flex flex-col space-y-1">
                        <TabButton icon={<UserIcon />} label="Profile" active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} />
                        <TabButton icon={<LockIcon />} label="Password" active={activeTab === 'password'} onClick={() => setActiveTab('password')} />
                        <TabButton icon={<DangerIcon />} label="Danger Zone" active={activeTab === 'danger'} onClick={() => setActiveTab('danger')} isDanger />
                    </nav>
                </div>
                <div className="w-2/3 pl-6">
                    {renderContent()}
                </div>
            </div>
        </Modal>
    );
};

const TabButton: React.FC<{ icon: React.ReactNode, label: string, active: boolean, onClick: () => void, isDanger?: boolean }> = ({ icon, label, active, onClick, isDanger }) => {
    const activeClass = isDanger ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400';
    const inactiveClass = isDanger ? 'text-red-400 hover:bg-red-500/10' : 'text-text-secondary hover:bg-bg-color-alt';
    return (
        <button onClick={onClick} className={`flex items-center gap-3 w-full text-left px-3 py-2 rounded-md transition-colors text-sm font-medium ${active ? activeClass : inactiveClass}`}>
            {icon} {label}
        </button>
    );
}