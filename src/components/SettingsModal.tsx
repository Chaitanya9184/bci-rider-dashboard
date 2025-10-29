// FIX: Using namespace import for React to solve JSX intrinsic element errors.
import * as React from 'react';
import type { Theme } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: Theme;
  onThemeChange: (newTheme: Partial<Theme>) => void;
  onReset: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, theme, onThemeChange, onReset }) => {
    const modalRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [onClose]);

    const handleOutsideClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
            onClose();
        }
    };
    
    const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                onThemeChange({ logo: reader.result as string });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleResetClick = () => {
        if (window.confirm("Are you sure you want to reset all theme settings to their default values? This action cannot be undone.")) {
            onReset();
        }
    };

    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={handleOutsideClick}
        >
            <div 
                ref={modalRef}
                className="bg-gray-800 rounded-xl shadow-lg w-full max-w-2xl border border-gray-700 max-h-[90vh] overflow-y-auto custom-scrollbar"
                onClick={e => e.stopPropagation()} // Prevent click from bubbling to the backdrop
            >
                <div className="p-6 border-b border-gray-700 sticky top-0 bg-gray-800 z-10 flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-white">App Settings</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">&times;</button>
                </div>
                <div className="p-6 space-y-8">
                    {/* Logo Section */}
                    <div>
                        <h3 className="text-lg font-semibold text-[var(--primary-color)] mb-2">Login Logo</h3>
                        <div className="flex items-center gap-4">
                            <img src={theme.logo} alt="Current logo" className="w-16 h-16 rounded-full bg-gray-700 object-contain p-1"/>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleLogoChange}
                                className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[var(--primary-color)] file:text-gray-900 hover:file:bg-opacity-90"
                            />
                        </div>
                    </div>

                    {/* Colors Section */}
                    <div>
                        <h3 className="text-lg font-semibold text-[var(--primary-color)] mb-2">Color Scheme</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <label className="block">
                                <span className="text-gray-300">Primary Color</span>
                                <input
                                    type="color"
                                    value={theme.primaryColor}
                                    onChange={e => onThemeChange({ primaryColor: e.target.value })}
                                    className="mt-1 block w-full h-10 rounded-md border-gray-600 bg-gray-700"
                                />
                            </label>
                            <label className="block">
                                <span className="text-gray-300">Background Color</span>
                                <input
                                    type="color"
                                    value={theme.backgroundColor}
                                    onChange={e => onThemeChange({ backgroundColor: e.target.value })}
                                    className="mt-1 block w-full h-10 rounded-md border-gray-600 bg-gray-700"
                                />
                            </label>
                        </div>
                    </div>

                    {/* Fonts Section */}
                    <div>
                        <h3 className="text-lg font-semibold text-[var(--primary-color)] mb-2">Typography</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                             <label className="block">
                                <span className="text-gray-300">Heading Font</span>
                                <select 
                                    value={theme.headingFontFamily}
                                    onChange={e => onThemeChange({ headingFontFamily: e.target.value })}
                                    className="mt-1 block w-full p-2 rounded-md border-gray-600 bg-gray-700"
                                >
                                    <option value="'Teko', sans-serif">Teko (Default)</option>
                                    <option value="'Oswald', sans-serif">Oswald</option>
                                    <option value="'Roboto', sans-serif">Roboto</option>
                                </select>
                            </label>
                             <label className="block">
                                <span className="text-gray-300">Body Font</span>
                                <select 
                                    value={theme.fontFamily}
                                    onChange={e => onThemeChange({ fontFamily: e.target.value })}
                                    className="mt-1 block w-full p-2 rounded-md border-gray-600 bg-gray-700"
                                >
                                    <option value="'Barlow', sans-serif">Barlow (Default)</option>
                                    <option value="'Roboto', sans-serif">Roboto</option>
                                    <option value="'Lato', sans-serif">Lato</option>
                                </select>
                            </label>
                        </div>
                        <label className="block mt-4">
                            <span className="text-gray-300">Base Font Size: {theme.baseFontSize}</span>
                            <input
                                type="range"
                                min="14"
                                max="18"
                                step="1"
                                value={parseInt(theme.baseFontSize)}
                                onChange={e => onThemeChange({ baseFontSize: `${e.target.value}px` })}
                                className="mt-1 block w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[var(--primary-color)]"
                            />
                        </label>
                    </div>
                </div>
                 <div className="p-6 border-t border-gray-700 sticky bottom-0 bg-gray-800 z-10 flex justify-end gap-4">
                    <button onClick={handleResetClick} className="px-4 py-2 rounded-md bg-red-600/50 hover:bg-red-600 text-white font-semibold">Reset to Default</button>
                    <button onClick={onClose} className="px-4 py-2 rounded-md bg-[var(--primary-color)] hover:bg-opacity-90 text-gray-900 font-semibold">Done</button>
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;