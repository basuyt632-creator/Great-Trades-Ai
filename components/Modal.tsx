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
                className="relative bg-bg-color border border-border-color rounded-xl shadow-2xl w-full max-w-4xl animate-fade-in-up"
                style={{ animationDuration: '0.4s' }}
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center justify-between p-4 border-b border-border-color">
                    <h2 className="text-xl font-bold text-text-primary">{title}</h2>
                    <button onClick={onClose} className="p-2 rounded-full text-text-secondary hover:bg-bg-color-alt hover:text-text-primary">
                        <CloseIcon />
                    </button>
                </div>
                <div className="p-6 max-h-[80vh] overflow-y-auto">
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
                    border-color: var(--accent-color);
                    box-shadow: 0 0 0 2px var(--accent-glow);
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
                    background-color: #475569; /* slate-600 */
                    color: #94a3b8; /* slate-400 */
                    cursor: not-allowed;
                }
                .btn-secondary {
                     padding: 10px 16px;
                     background-color: var(--bg-color-alt);
                     color: var(--text-primary);
                     border: 1px solid var(--border-color);
                     font-weight: bold;
                     border-radius: 6px;
                     transition: background-color 0.2s;
                }
                .btn-secondary:hover {
                    background-color: rgba(255, 255, 255, 0.1);
                }
                .btn-secondary:disabled {
                    background-color: #1e293b; /* slate-800 */
                    color: #475569; /* slate-600 */
                    border-color: #334155; /* slate-700 */
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
                .btn-chip {
                    padding: 6px 12px;
                    font-size: 0.875rem;
                    font-weight: 500;
                    border-radius: 9999px;
                    transition: all 0.2s;
                    background-color: var(--bg-color-alt);
                    color: var(--text-secondary);
                }
                .btn-chip:hover {
                     background-color: #334155; /* slate-700 */
                     color: var(--text-primary);
                }
                .btn-chip.active {
                    background-color: var(--accent-color);
                    color: #0c101d;
                    box-shadow: 0 2px 8px var(--accent-glow);
                }

                /* Toggle Switch */
                .switch { position: relative; display: inline-block; width: 40px; height: 22px; }
                .switch input { opacity: 0; width: 0; height: 0; }
                .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #475569; transition: .4s; }
                .slider:before { position: absolute; content: ""; height: 16px; width: 16px; left: 3px; bottom: 3px; background-color: white; transition: .4s; }
                input:checked + .slider { background-color: var(--accent-color); }
                input:checked + .slider:before { transform: translateX(18px); }
                .slider.round { border-radius: 34px; }
                .slider.round:before { border-radius: 50%; }

                /* Custom Radio */
                .radio-style {
                    -webkit-appearance: none;
                    appearance: none;
                    background-color: var(--bg-color);
                    margin: 0;
                    font: inherit;
                    color: var(--text-secondary);
                    width: 1.15em;
                    height: 1.15em;
                    border: 0.15em solid currentColor;
                    border-radius: 50%;
                    transform: translateY(-0.075em);
                    display: grid;
                    place-content: center;
                    cursor: pointer;
                }
                .radio-style::before {
                    content: "";
                    width: 0.65em;
                    height: 0.65em;
                    border-radius: 50%;
                    transform: scale(0);
                    transition: 120ms transform ease-in-out;
                    box-shadow: inset 1em 1em var(--accent-color);
                }
                .radio-style:checked {
                    border-color: var(--accent-color);
                }
                .radio-style:checked::before {
                    transform: scale(1);
                }

            `}</style>
        </div>
    );
};
