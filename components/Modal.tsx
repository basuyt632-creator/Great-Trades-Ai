import React, { useEffect } from 'react';
import { CloseIcon } from './icons/CloseIcon';

interface ModalProps {
    title: string;
    onClose: () => void;
    children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ title, onClose, children }) => {
    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleEsc);
        return () => {
            window.removeEventListener('keydown', handleEsc);
        };
    }, [onClose]);

    return (
        <div 
            className="fixed inset-0 bg-black/60 z-40 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in-up" 
            style={{ animationDuration: '0.3s' }}
            onClick={onClose}
        >
            <div 
                className="relative bg-bg-color border border-border-color rounded-xl shadow-2xl w-full max-w-2xl animate-fade-in-up"
                style={{ animationDuration: '0.4s' }}
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center justify-between p-4 border-b border-border-color">
                    <h2 className="text-xl font-bold text-text-primary">{title}</h2>
                    <button onClick={onClose} className="p-2 rounded-full text-text-secondary hover:bg-bg-color-alt hover:text-text-primary">
                        <CloseIcon />
                    </button>
                </div>
                <div className="p-6">
                    {children}
                </div>
            </div>
             <style>{`
                .input-style {
                    margin-top: 4px;
                    display: block;
                    width: 100%;
                    padding: 8px 12px;
                    background-color: var(--bg-color-alt);
                    border: 1px solid var(--border-color);
                    border-radius: 6px;
                    color: var(--text-primary);
                }
                .input-style:focus {
                    outline: none;
                    box-shadow: 0 0 0 2px var(--accent-color);
                }
                .btn-primary {
                     padding: 10px 16px;
                     background-color: var(--accent-color);
                     color: #0c101d; /* dark text on accent */
                     font-weight: bold;
                     border-radius: 6px;
                     transition: opacity 0.2s;
                }
                 .btn-primary:hover {
                    opacity: 0.9;
                }
                 .btn-primary:disabled {
                    background-color: #94a3b8; /* slate-400 */
                    cursor: not-allowed;
                }
                .btn-danger {
                     padding: 10px 16px;
                     background-color: #ef4444; /* red-500 */
                     color: white;
                     font-weight: bold;
                     border-radius: 6px;
                     transition: opacity 0.2s;
                }
                .btn-danger:hover {
                    opacity: 0.9;
                }
                .btn-danger:disabled {
                    background-color: #94a3b8; /* slate-400 */
                    cursor: not-allowed;
                }
            `}</style>
        </div>
    );
};
