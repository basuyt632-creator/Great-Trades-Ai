import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import type { UserSettings, UserPreferences, AIPersonality, UIDensity } from '../types';
import { onAuthChange, type User } from '../services/firebaseService';

interface SettingsContextType {
    settings: UserSettings;
    setSettings: (settings: UserSettings) => void;
    isSettingsLoaded: boolean;
    resetTour: () => void;
    tourKey: number;
}

const defaultUserPreferences: UserPreferences = {
    tradingStyle: 'Not Specified',
    primaryGoal: 'Not Specified',
    riskTolerance: 'Not Specified',
    investmentHorizon: 'Not Specified',
    tradeStrategies: [],
    tradeBudget: 'Not Specified',
    portfolioExposure: 'Not Specified',
};

export const defaultSettings: UserSettings = {
    userPreferences: defaultUserPreferences,
    aiPersonality: 'Detailed',
    defaultLanguage: 'English',
    defaultTimeFrame: 'Not Specified',
    accentColor: '#2dd4bf', // Emerald
    uiDensity: 'Comfortable',
    historyTrackingEnabled: true,
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [settings, setSettingsState] = useState<UserSettings>(defaultSettings);
    const [isSettingsLoaded, setIsSettingsLoaded] = useState(false);
    const [tourKey, setTourKey] = useState(0);

    useEffect(() => {
        const unsubscribe = onAuthChange(setUser);
        return () => unsubscribe();
    }, []);

    const getSettingsKey = useCallback(() => {
        if (!user) return null;
        return `userSettings_${user.uid}`;
    }, [user]);

    useEffect(() => {
        const settingsKey = getSettingsKey();
        if (settingsKey) {
            try {
                const savedSettings = localStorage.getItem(settingsKey);
                if (savedSettings) {
                    // Merge saved settings with defaults to ensure all keys are present
                    const parsedSettings = JSON.parse(savedSettings);
                    setSettingsState(prev => ({ ...defaultSettings, ...parsedSettings }));
                } else {
                    setSettingsState(defaultSettings);
                }
            } catch (err) {
                console.error("Failed to load settings from localStorage", err);
                setSettingsState(defaultSettings);
            }
        } else {
            setSettingsState(defaultSettings);
        }
        setIsSettingsLoaded(true);
    }, [user, getSettingsKey]);
    
    const setSettings = (newSettings: UserSettings) => {
        const settingsKey = getSettingsKey();
        if (settingsKey) {
            setSettingsState(newSettings);
            localStorage.setItem(settingsKey, JSON.stringify(newSettings));
        }
    };
    
    const resetTour = () => {
        localStorage.removeItem('great-trades-ai-tour-completed');
        setTourKey(prevKey => prevKey + 1);
    };

    return (
        <SettingsContext.Provider value={{ settings, setSettings, isSettingsLoaded, resetTour, tourKey }}>
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = (): SettingsContextType => {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
};