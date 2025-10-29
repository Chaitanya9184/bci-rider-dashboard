// FIX: Using namespace import for React to solve JSX intrinsic element errors.
import * as React from 'react';
import type { User } from '../types';
import { BCILogo } from './Icons';

interface LoginProps {
  onLogin: (user: User) => void;
  users: User[];
  logoUrl?: string;
}

const Login: React.FC<LoginProps> = ({ onLogin, users, logoUrl }) => {
  const [phone, setPhone] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const [passwordError, setPasswordError] = React.useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setPasswordError('');

    // Client-side password validation
    if (password.length < 8) {
        setPasswordError('Password must be at least 8 characters long.');
        return;
    }
     if (!/[A-Z]/.test(password)) {
        setPasswordError('Password must contain at least one uppercase letter.');
        return;
    }
    if (!/[a-z]/.test(password)) {
        setPasswordError('Password must contain at least one lowercase letter.');
        return;
    }
    if (!/\d/.test(password)) {
        setPasswordError('Password must contain at least one number.');
        return;
    }

    const user = users.find(u => u.id === phone);

    if (user && user.password === password) {
      onLogin(user);
    } else {
      setError('Invalid phone number or password.');
    }
  };
  
  return (
    <div className="min-h-screen bg-[var(--background-color)] text-gray-200 flex flex-col justify-center items-center p-4">
        <div className="max-w-md w-full bg-gray-800 rounded-xl shadow-lg shadow-black/30 p-8 space-y-6">
            <div className="flex flex-col items-center space-y-4">
                <BCILogo logoUrl={logoUrl} className="h-24 w-24 object-contain rounded-full"/>
                <h1 className="text-3xl font-bold text-[var(--primary-color)]">BCI Rider App</h1>
                <p className="text-gray-400">Please sign in to continue</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="phone" className="text-sm font-bold text-gray-400 block mb-2">
                        Phone Number (ID)
                    </label>
                    <input
                        id="phone"
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full p-3 bg-gray-700 rounded-md border border-gray-600 focus:border-[var(--primary-color)] focus:ring focus:ring-[var(--primary-color)]/50 transition"
                        placeholder="e.g., 9876543210"
                        required
                    />
                </div>
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <label
                            htmlFor="password"
                            className="text-sm font-bold text-gray-400"
                        >
                            Password
                        </label>
                         <span className="text-xs text-gray-500">
                            Contact a Marshal to reset
                         </span>
                    </div>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => {
                            setPassword(e.target.value);
                            setPasswordError(''); // Clear error on new input
                        }}
                        className={`w-full p-3 bg-gray-700 rounded-md border border-gray-600 focus:border-[var(--primary-color)] focus:ring focus:ring-[var(--primary-color)]/50 transition ${passwordError ? 'border-red-500' : ''}`}
                        placeholder="••••••••"
                        required
                    />
                    {passwordError && <p className="text-red-400 text-xs mt-2">{passwordError}</p>}
                </div>
                {error && <p className="text-red-400 text-sm">{error}</p>}
                <button
                    type="submit"
                    className="w-full bg-[var(--primary-color)] text-gray-900 font-bold py-3 px-4 rounded-lg hover:bg-opacity-90 transition-transform duration-150 ease-in-out active:scale-95"
                >
                    Sign In
                </button>
            </form>
        </div>
    </div>
  );
};

export default Login;