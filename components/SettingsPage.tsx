import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { updateUserProfile, reauthenticateUser, updateUserPassword, deleteUserAccount, type User } from '../services/firebaseService';
import { useSettings } from '../contexts/SettingsContext';
import { UserIcon } from './UserIcon';
import { LockIcon } from './icons/LockIcon';
import { DangerIcon } from './icons/DangerIcon';
import { AIPersonalityIcon } from './icons/AIPersonalityIcon';
import { AppearanceIcon } from './icons/AppearanceIcon';
import { DataPrivacyIcon } from './icons/DataPrivacyIcon';
import type { UserSettings, HistoryItem } from '../types';
import { FileExportIcon } from './icons/FileExportIcon';
import { RestartIcon } from './icons/RestartIcon';
import { TrashIcon } from './icons/TrashIcon';

interface SettingsPageProps {
    user: User;
    history: HistoryItem[];
    onClearHistory: () => void;
    onClose: () => void;
    addToast: (message: string, type: 'success' | 'error') => void;
}

const timeFrames = ['Not Specified', '1m', '5m', '15m', '1H', '4H', '1D', '1W'];
const languages = ['English', 'Spanish', 'Mandarin Chinese', 'Hindi', 'French', 'Standard Arabic', 'Bengali', 'Russian', 'Portuguese', 'German', 'Japanese', 'Indonesian', 'Turkish', 'Vietnamese', 'Korean', 'Italian'];
const preferenceQuestions = [
    { key: 'tradingStyle', question: 'What is your trading style?', options: ['Day Trader', 'Swing Trader', 'Position Trader', 'Scalper', 'Not Specified'] },
    { key: 'primaryGoal', question: 'What is your primary goal?', options: ['Entry/Exit', 'Understand Trend', 'Find Patterns', 'Risk Assessment', 'Not Specified'] },
    { key: 'riskTolerance', question: 'What\'s your risk tolerance?', options: ['Low', 'Medium', 'High', 'Not Specified'] },
    { key: 'investmentHorizon', question: 'What is your investment horizon?', options: ['Short-term', 'Long-term', 'Not Specified'] }
];
const tradeStrategies = ['Trend Following', 'Mean Reversion', 'Breakout Trading', 'Range Trading', 'Momentum Trading'];
const tradeBudgets = ['< $1,000', '$1,000 - $5,000', '$5,000 - $25,000', '$25,000+', 'Not Specified'];
const portfolioExposures = ['Low (<2%)', 'Medium (2-5%)', 'High (>5%)', 'Not Specified'];
const accentColors = [
    { name: 'Emerald', value: '#2dd4bf' },
    { name: 'Sky', value: '#38bdf8' },
    { name: 'Rose', value: '#f43f5e' },
    { name: 'Amber', value: '#f59e0b' },
    { name: 'Violet', value: '#8b5cf6' },
];

export const SettingsPage: React.FC<SettingsPageProps> = ({ user, history, onClearHistory, onClose, addToast }) => {
    const { settings, setSettings, resetTour } = useSettings();
    const [localSettings, setLocalSettings] = useState<UserSettings>(settings);
    
    useEffect(() => {
        setLocalSettings(settings);
    }, [settings]);

    const [activeTab, setActiveTab] = useState('profile');
    const [displayName, setDisplayName] = useState(user.displayName || '');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [deleteConfirmText, setDeleteConfirmText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Record<string, string | null>>({});

    const handleSettingsChange = (field: keyof UserSettings, value: any) => {
        setLocalSettings(prev => ({ ...prev, [field]: value }));
    };
    
    const handleUserPreferencesChange = (field: string, value: string) => {
        if (field === 'tradeStrategies') {
            setLocalSettings(prev => {
                const currentStrategies = prev.userPreferences.tradeStrategies || [];
                const newStrategies = currentStrategies.includes(value)
                    ? currentStrategies.filter(s => s !== value)
                    : [...currentStrategies, value];
                return {
                    ...prev,
                    userPreferences: { ...prev.userPreferences, tradeStrategies: newStrategies }
                };
            });
        } else {
             setLocalSettings(prev => ({
                ...prev,
                userPreferences: {
                    ...prev.userPreferences,
                    [field]: value
                }
            }));
        }
    };

    const saveSettings = () => {
        setSettings(localSettings);
        addToast('Settings saved successfully!', 'success');
    };

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (displayName === user.displayName) return;
        setIsLoading(true);
        setError({});
        try {
            await updateUserProfile(user, { displayName });
            addToast('Profile updated successfully!', 'success');
            onClose();
        } catch (err: any) {
            setError({ profile: err.message });
            addToast('Failed to update profile.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setError({ password: "New passwords do not match." });
            return;
        }
        if (newPassword.length < 6) {
            setError({ password: "Password must be at least 6 characters long." });
            return;
        }
        setIsLoading(true);
        setError({});
        try {
            await reauthenticateUser(user, currentPassword);
            await updateUserPassword(user, newPassword);
            addToast('Password changed successfully!', 'success');
            onClose();
        } catch (err: any) {
            setError({ password: "Failed to change password. Please check your current password." });
            addToast('Failed to change password.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteAccount = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError({});
        try {
            await reauthenticateUser(user, currentPassword);
            await deleteUserAccount(user);
            addToast('Account deleted successfully.', 'success');
        } catch (err: any) {
            setError({ delete: "Failed to delete account. Please check your password." });
            addToast('Failed to delete account.', 'error');
        } finally {
            setIsLoading(false);
        }
    };
    
    const exportHistory = () => {
        const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
            JSON.stringify(history, null, 2)
        )}`;
        const link = document.createElement("a");
        link.href = jsonString;
        link.download = `great-trades-ai-history-${new Date().toISOString()}.json`;
        link.click();
        addToast('History exported!', 'success');
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'profile': return (
                <form onSubmit={handleProfileUpdate} className="space-y-4">
                    <h3 className="text-lg font-semibold text-text-primary">Public Profile</h3>
                    <div>
                        <label className="block text-sm font-medium text-text-primary">Display Name</label>
                        <input type="text" value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Enter your name" className="input-style" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-primary">Email</label>
                        <p className="text-text-secondary mt-1">{user.email}</p>
                    </div>
                    {error.profile && <p className="text-red-400 text-sm">{error.profile}</p>}
                    <button type="submit" className="w-full btn-primary" disabled={isLoading}>{isLoading ? 'Saving...' : 'Save Changes'}</button>
                </form>
            );
            case 'ai': return (
                <div className="space-y-6">
                    <div>
                        <h3 className="text-lg font-semibold text-text-primary mb-2">AI Personality</h3>
                        <p className="text-sm text-text-secondary mb-3">Choose how you want the AI to respond.</p>
                        <select value={localSettings.aiPersonality} onChange={e => handleSettingsChange('aiPersonality', e.target.value)} className="input-style w-full">
                            <option value="Detailed">Detailed (Default)</option>
                            <option value="Concise">Concise</option>
                            <option value="Educational">Educational</option>
                        </select>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-text-primary mb-2">Default Language</h3>
                         <select value={localSettings.defaultLanguage} onChange={e => handleSettingsChange('defaultLanguage', e.target.value)} className="input-style w-full">
                            {languages.map(lang => <option key={lang} value={lang}>{lang}</option>)}
                        </select>
                    </div>
                     <div>
                        <h3 className="text-lg font-semibold text-text-primary mb-2">Default Time Frame</h3>
                        <div className="flex flex-wrap gap-2">
                            {timeFrames.map(t => (
                                <button key={t} onClick={() => handleSettingsChange('defaultTimeFrame', t)} className={`btn-chip ${localSettings.defaultTimeFrame === t ? 'active' : ''}`}>{t}</button>
                            ))}
                        </div>
                    </div>
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-text-primary">Your Trading Profile</h3>
                        {preferenceQuestions.map(q => (
                             <div key={q.key}>
                                <p className="font-medium text-text-primary mb-2">{q.question}</p>
                                <div className="flex flex-wrap gap-2">
                                    {q.options.map(opt => (
                                        <button key={opt} onClick={() => handleUserPreferencesChange(q.key, opt)} className={`btn-chip ${localSettings.userPreferences[q.key as keyof typeof localSettings.userPreferences] === opt ? 'active' : ''}`}>{opt}</button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                     <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-text-primary">Financial Context</h3>
                         <div>
                            <p className="font-medium text-text-primary mb-2">Typical Trade Budget</p>
                            <div className="flex flex-wrap gap-2">
                                {tradeBudgets.map(opt => (
                                    <button key={opt} onClick={() => handleUserPreferencesChange('tradeBudget', opt)} className={`btn-chip ${localSettings.userPreferences.tradeBudget === opt ? 'active' : ''}`}>{opt}</button>
                                ))}
                            </div>
                        </div>
                         <div>
                            <p className="font-medium text-text-primary mb-2">Portfolio Exposure per Trade</p>
                            <div className="flex flex-wrap gap-2">
                                {portfolioExposures.map(opt => (
                                    <button key={opt} onClick={() => handleUserPreferencesChange('portfolioExposure', opt)} className={`btn-chip ${localSettings.userPreferences.portfolioExposure === opt ? 'active' : ''}`}>{opt}</button>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-text-primary">Preferred Trading Strategies</h3>
                        <p className="text-sm text-text-secondary mb-3">Select your preferred strategies to tailor the analysis focus.</p>
                        <div className="flex flex-wrap gap-2">
                            {tradeStrategies.map(strategy => (
                                <button key={strategy} onClick={() => handleUserPreferencesChange('tradeStrategies', strategy)} className={`btn-chip ${localSettings.userPreferences.tradeStrategies?.includes(strategy) ? 'active' : ''}`}>{strategy}</button>
                            ))}
                        </div>
                    </div>
                    <button onClick={saveSettings} className="w-full btn-primary">Save AI Settings</button>
                </div>
            );
            case 'appearance': return (
                <div className="space-y-6">
                     <div>
                        <h3 className="text-lg font-semibold text-text-primary mb-2">Accent Color</h3>
                        <div className="flex flex-wrap gap-3">
                            {accentColors.map(color => (
                                <button key={color.name} onClick={() => handleSettingsChange('accentColor', color.value)} className={`w-10 h-10 rounded-full transition-transform transform hover:scale-110 ${localSettings.accentColor === color.value ? 'ring-2 ring-offset-2 ring-offset-bg-color-alt ring-white' : ''}`} style={{ backgroundColor: color.value }} aria-label={color.name}></button>
                            ))}
                        </div>
                    </div>
                     <div>
                        <h3 className="text-lg font-semibold text-text-primary mb-2">UI Density</h3>
                        <div className="flex gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="radio" name="uiDensity" value="Comfortable" checked={localSettings.uiDensity === 'Comfortable'} onChange={() => handleSettingsChange('uiDensity', 'Comfortable')} className="radio-style" />
                                Comfortable
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="radio" name="uiDensity" value="Compact" checked={localSettings.uiDensity === 'Compact'} onChange={() => handleSettingsChange('uiDensity', 'Compact')} className="radio-style" />
                                Compact
                            </label>
                        </div>
                    </div>
                    <button onClick={saveSettings} className="w-full btn-primary">Save Appearance</button>
                </div>
            );
            case 'data': return (
                <div className="space-y-6">
                    <div>
                        <h3 className="text-lg font-semibold text-text-primary mb-2">History Tracking</h3>
                        <div className="flex items-center justify-between bg-bg-color-alt p-3 rounded-lg border border-border-color">
                            <p className="text-sm font-medium text-text-primary">Enable Analysis History</p>
                            <label className="switch">
                                <input type="checkbox" checked={localSettings.historyTrackingEnabled} onChange={e => handleSettingsChange('historyTrackingEnabled', e.target.checked)} />
                                <span className="slider round"></span>
                            </label>
                        </div>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-text-primary mb-2">Export History</h3>
                        <p className="text-sm text-text-secondary mb-3">Download your entire analysis history as a JSON file.</p>
                        <button onClick={exportHistory} disabled={history.length === 0} className="w-full btn-secondary flex items-center justify-center gap-2"><FileExportIcon /> Export Data</button>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-text-primary mb-2">Clear History</h3>
                        <p className="text-sm text-text-secondary mb-3">Permanently delete all saved analysis history.</p>
                        <button onClick={onClearHistory} disabled={history.length === 0} className="w-full btn-danger flex items-center justify-center gap-2"><TrashIcon className="w-5 h-5" /> Clear History</button>
                    </div>
                     <div>
                        <h3 className="text-lg font-semibold text-text-primary mb-2">Onboarding Tour</h3>
                        <p className="text-sm text-text-secondary mb-3">Restart the guided tour to learn about the app's features.</p>
                        <button onClick={() => { resetTour(); onClose(); }} className="w-full btn-secondary flex items-center justify-center gap-2"><RestartIcon /> Restart Tour</button>
                    </div>
                    <button onClick={saveSettings} className="w-full btn-primary mt-4">Save Data & Privacy Settings</button>
                </div>
            );
            case 'security': return (
                <form onSubmit={handlePasswordChange} className="space-y-4">
                    <h3 className="text-lg font-semibold text-text-primary">Change Password</h3>
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
                    {error.password && <p className="text-red-400 text-sm">{error.password}</p>}
                    <button type="submit" className="w-full btn-primary" disabled={isLoading}>{isLoading ? 'Saving...' : 'Save Changes'}</button>
                </form>
            );
            case 'account': return (
                 <form onSubmit={handleDeleteAccount} className="space-y-4">
                    <h3 className="text-lg font-semibold text-red-400">Delete Account</h3>
                    <p className="text-sm text-red-400">This action is irreversible. All your data, including analysis history, will be permanently deleted.</p>
                    <div>
                        <label className="block text-sm font-medium text-text-primary">To confirm, type "delete my account" below:</label>
                         <input type="text" value={deleteConfirmText} onChange={e => setDeleteConfirmText(e.target.value)} className="input-style" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-text-primary">Enter Your Password</label>
                        <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required className="input-style" />
                    </div>
                    {error.delete && <p className="text-red-400 text-sm">{error.delete}</p>}
                    <button type="submit" className="w-full btn-danger" disabled={isLoading || deleteConfirmText !== 'delete my account'}>{isLoading ? 'Deleting...' : 'Delete My Account'}</button>
                </form>
            );
        }
    };

    return (
        <Modal title="Account Settings" onClose={onClose}>
            <div className="flex flex-col md:flex-row">
                <div className="w-full md:w-1/3 pr-0 md:pr-4 mb-6 md:mb-0 border-b md:border-b-0 md:border-r border-border-color">
                    <nav className="flex flex-row md:flex-col md:space-y-1 overflow-x-auto -mx-3 px-3 pb-2 md:pb-0">
                        <TabButton icon={<UserIcon />} label="Profile" active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} />
                        <TabButton icon={<AIPersonalityIcon />} label="AI" active={activeTab === 'ai'} onClick={() => setActiveTab('ai')} />
                        <TabButton icon={<AppearanceIcon />} label="Appearance" active={activeTab === 'appearance'} onClick={() => setActiveTab('appearance')} />
                        <TabButton icon={<DataPrivacyIcon />} label="Data" active={activeTab === 'data'} onClick={() => setActiveTab('data')} />
                        <TabButton icon={<LockIcon />} label="Security" active={activeTab === 'security'} onClick={() => setActiveTab('security')} />
                        <TabButton icon={<DangerIcon />} label="Account" active={activeTab === 'account'} onClick={() => setActiveTab('account')} isDanger />
                    </nav>
                </div>
                <div className="w-full md:w-2/3 md:pl-6">
                    {renderContent()}
                </div>
            </div>
        </Modal>
    );
};

const TabButton: React.FC<{ icon: React.ReactNode, label: string, active: boolean, onClick: () => void, isDanger?: boolean }> = ({ icon, label, active, onClick, isDanger }) => {
    const activeClass = isDanger ? 'bg-red-500/10 text-red-400' : 'bg-[var(--accent-color)]/10 text-[var(--accent-color)]';
    const inactiveClass = isDanger ? 'text-red-400 hover:bg-red-500/10' : 'text-text-secondary hover:bg-bg-color-alt';
    return (
        <button onClick={onClick} className={`flex items-center gap-3 w-full text-left px-3 py-2 rounded-md transition-colors text-sm font-medium flex-shrink-0 ${active ? activeClass : inactiveClass}`}>
            {icon} {label}
        </button>
    );
}