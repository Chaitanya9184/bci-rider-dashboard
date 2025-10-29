// FIX: Using namespace import for React to solve JSX intrinsic element errors.
import * as React from 'react';
import type { User } from '../types';
import { BCILogo, EditIcon, GearIcon } from './Icons';

interface HeaderProps {
  currentUser: User;
  onLogout: () => void;
  onAvatarChange: (newAvatarUrl: string) => void;
  onOpenSettings: () => void;
  logoUrl?: string;
  isSaving: boolean; // Renamed from isUploading
}

const Header: React.FC<HeaderProps> = ({ currentUser, onLogout, onAvatarChange, onOpenSettings, logoUrl, isSaving }) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleAvatarClick = () => {
    if (isSaving) return;

    const useFileUpload = window.confirm(
      "Do you want to upload a new profile picture from your device?\n\nClick 'Cancel' to paste an image URL instead."
    );

    if (useFileUpload) {
      fileInputRef.current?.click();
    } else {
      const newAvatarUrl = window.prompt("Please paste the direct URL of your new profile picture:");
      if (newAvatarUrl && newAvatarUrl.trim() !== '') {
        try {
            // Basic URL validation
            new URL(newAvatarUrl);
            onAvatarChange(newAvatarUrl);
        } catch (e) {
            alert("Invalid URL. Please provide a valid, direct link to an image.");
        }
      } else if (newAvatarUrl !== null) { // User clicked OK with empty input
        alert("Avatar URL cannot be empty.");
      }
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onAvatarChange(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const isMarshal = currentUser.clubRole === 'Marshal';

  return (
    <header className="bg-gray-800/50 backdrop-blur-sm p-4 sticky top-0 z-10 shadow-lg shadow-black/20">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-3">
            <BCILogo logoUrl={logoUrl} className="h-14 w-14 object-contain rounded-full"/>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right hidden sm:block">
            <p className="font-bold text-gray-200">{currentUser.name}</p>
            <p className="text-xs text-gray-400">{currentUser.id}</p>
          </div>
          <div 
            className={`relative group ${isSaving ? 'cursor-not-allowed' : 'cursor-pointer'}`}
            onClick={handleAvatarClick}
            title="Change profile picture"
          >
            <img src={currentUser.avatarUrl} alt={currentUser.name} className="w-12 h-12 rounded-full border-2 border-[var(--primary-color)] object-cover" />
            
            {!isSaving && (
                <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <EditIcon className="w-6 h-6 text-white"/>
                </div>
            )}

            {isSaving && (
                <div className="absolute inset-0 bg-black/70 rounded-full flex items-center justify-center">
                    <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                </div>
            )}
          </div>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange}
            className="hidden" 
            accept="image/*"
            disabled={isSaving}
          />
          {isMarshal && (
             <button onClick={onOpenSettings} title="App Settings" className="bg-gray-700 hover:bg-gray-600 p-3 rounded-full transition-colors duration-300">
                <GearIcon className="w-5 h-5"/>
             </button>
          )}
          <button onClick={onLogout} title="Logout" className="bg-gray-700 hover:bg-red-600/50 p-3 rounded-full transition-colors duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;