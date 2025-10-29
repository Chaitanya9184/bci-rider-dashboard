// FIX: Using namespace import for React to solve JSX intrinsic element errors.
import * as React from 'react';
import Login from './components/Login';
import Header from './components/Header';
import RideCard from './components/RideCard';
import StatsCard from './components/StatsCard';
import FeedbackButton from './components/FeedbackButton';
import SettingsModal from './components/SettingsModal';
import { fetchAppData } from './services/googleSheets';
import { useTheme } from './hooks/useTheme';
import type { User, Ride, Role } from './types';
import { CrownIcon, SteeringWheelIcon, BroomIcon, RouteIcon, UsersIcon, UserPlusIcon, KeyRoundIcon, PlusCircleIcon } from './components/Icons';

// ===================================================================================
//  CRITICAL CONFIGURATION: GOOGLE APPS SCRIPT URL
// ===================================================================================
// This URL is the 'backend' API that allows the app to save data to your Google Sheet.
// You MUST replace the placeholder below with your actual Google Apps Script Web App URL.
// If you don't, features like avatar changes, ride creation, and stat updates will NOT be saved.
// ===================================================================================
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbygIfrUR7CwbJgUl68cEbfvhlXlYKeuaaBCTVoWRDhx4AXvo3jKVaPVIpjutvU5kO7f/exec'; 

const App: React.FC = () => {
  const { theme, setTheme, resetTheme } = useTheme();
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);

  const [currentUser, setCurrentUser] = React.useState<User | null>(null);
  const [users, setUsers] = React.useState<User[]>([]);
  const [rides, setRides] = React.useState<Ride[]>([]);
  const [selectedRideId, setSelectedRideId] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // States for Marshal Controls forms
  const [newRiderName, setNewRiderName] = React.useState('');
  const [newRiderPhone, setNewRiderPhone] = React.useState('');
  const [newRiderPassword, setNewRiderPassword] = React.useState('');
  const [formError, setFormError] = React.useState('');

  // States for New Ride form
  const [newRideTitle, setNewRideTitle] = React.useState('');
  const [newRideSummary, setNewRideSummary] = React.useState('');
  const [newRideDate, setNewRideDate] = React.useState('');
  const [newRideMapLink, setNewRideMapLink] = React.useState('');
  const [rideFormError, setRideFormError] = React.useState('');
  
  const postToSheet = async (action: string, payload: object) => {
    if (APPS_SCRIPT_URL.includes('AKfycbw...')) {
        alert("Developer Error: Please update the APPS_SCRIPT_URL in App.tsx before trying to save data.");
        throw new Error("APPS_SCRIPT_URL not configured.");
    }
    const response = await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors', // Important for Google Apps Script
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action, payload }),
    });
    // no-cors mode means we can't inspect the response, so we optimistically assume success.
    // A more robust solution would involve a proper API endpoint.
  };

  React.useEffect(() => {
    const storedUser = localStorage.getItem('bci-user');
    if (storedUser) {
      try {
        setCurrentUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Failed to parse user from localStorage", error);
        localStorage.removeItem('bci-user');
      }
    }

    const loadData = async () => {
      setIsLoading(true);
      try {
        const { users, rides } = await fetchAppData();
        setUsers(users);
        setRides(rides);
      } catch (err) {
        console.error(err);
        setError('Failed to load data from Google Sheets. Please check the sheet URLs and ensure they are published to the web.');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);

  const handleLogin = (user: User) => {
    const userWithRole = users.find(u => u.id === user.id);
    if(userWithRole){
        setCurrentUser(userWithRole);
        localStorage.setItem('bci-user', JSON.stringify(userWithRole));
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('bci-user');
  };

  const handleAvatarChange = async (newAvatarUrl: string) => {
    if (currentUser) {
       setIsSaving(true);
       try {
        await postToSheet('updateAvatar', { userId: currentUser.id, avatarUrl: newAvatarUrl });
        const updatedUser = { ...currentUser, avatarUrl: newAvatarUrl };
        setCurrentUser(updatedUser);
        setUsers(users.map(u => u.id === currentUser.id ? updatedUser : u));
        localStorage.setItem('bci-user', JSON.stringify(updatedUser));
       } catch (e) {
         alert('Failed to save avatar. Please try again.');
         console.error(e);
       } finally {
         setIsSaving(false);
       }
    }
  };

  const handleRegister = async (rideId: string) => {
    if (!currentUser) return;
    setIsSaving(true);
    try {
        await postToSheet('registerForRide', { rideId, userId: currentUser.id });
        setRides(rides.map(r => {
          if (r.id === rideId && !r.participants.some(p => p.userId === currentUser.id)) {
            return {
              ...r,
              participants: [...r.participants, { userId: currentUser.id, role: 'Rider' }]
            };
          }
          return r;
        }));
    } catch(e) {
        alert('Failed to register for ride. Please try again.');
        console.error(e);
    } finally {
        setIsSaving(false);
    }
  };

  const handleAssignRole = async (rideId: string, userId: string, role: Role) => {
    setIsSaving(true);
    try {
        await postToSheet('assignRole', { rideId, userId, role });
        setRides(rides.map(r => {
          if (r.id === rideId) {
            return {
              ...r,
              participants: r.participants.map(p => p.userId === userId ? { ...p, role } : p)
            };
          }
          return r;
        }));
    } catch (e) {
        alert('Failed to assign role. Please try again.');
        console.error(e);
    } finally {
        setIsSaving(false);
    }
  };
  
  const handleConfirmAttendance = async (rideId: string, confirmedUserIds: Record<string, boolean>) => {
    const ride = rides.find(r => r.id === rideId);
    if (!ride) return;

    setIsSaving(true);
    try {
        const confirmedIds = new Set(Object.entries(confirmedUserIds).filter(([, isConfirmed]) => isConfirmed).map(([userId]) => userId));
        
        const updates: { userId: string; stats: Partial<User> }[] = [];
        const updatedUsers = users.map(user => {
            if (confirmedIds.has(user.id)) {
                const participantInfo = ride.participants.find(p => p.userId === user.id);
                if (participantInfo) {
                    const updatedUser = { ...user };
                    updatedUser.totalRides = (updatedUser.totalRides || 0) + 1;
                    const statUpdates: Partial<User> = { totalRides: updatedUser.totalRides };
                    
                    switch (participantInfo.role) {
                        case 'Lead':
                            updatedUser.leads = (updatedUser.leads || 0) + 1;
                            statUpdates.leads = updatedUser.leads;
                            break;
                        case 'Sweep':
                            updatedUser.sweeps = (updatedUser.sweeps || 0) + 1;
                            statUpdates.sweeps = updatedUser.sweeps;
                            break;
                        case 'RP':
                            updatedUser.rps = (updatedUser.rps || 0) + 1;
                            statUpdates.rps = updatedUser.rps;
                            break;
                    }
                    updates.push({ userId: user.id, stats: statUpdates });
                    return updatedUser;
                }
            }
            return user;
        });
        
        await postToSheet('updateStats', { updates });

        setUsers(updatedUsers);
        if (currentUser && confirmedIds.has(currentUser.id)) {
            const updatedCurrentUser = updatedUsers.find(u => u.id === currentUser.id);
            if (updatedCurrentUser) {
                setCurrentUser(updatedCurrentUser);
                localStorage.setItem('bci-user', JSON.stringify(updatedCurrentUser));
            }
        }
        alert('Attendance confirmed and saved!');
    } catch (e) {
        alert('Failed to save attendance. Please try again.');
        console.error(e);
    } finally {
        setIsSaving(false);
    }
  };

  const handleSelectRide = (rideId: string) => {
    setSelectedRideId(prevId => (prevId === rideId ? null : rideId));
  };
  
  const handleRegisterNewRider = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!/^\d{10}$/.test(newRiderPhone)) {
      setFormError('Phone number must be exactly 10 digits.');
      return;
    }
    if (users.some(u => u.id === newRiderPhone)) {
      setFormError('A user with this phone number already exists.');
      return;
    }
     if (newRiderPassword.length < 8 || !/[A-Z]/.test(newRiderPassword) || !/[a-z]/.test(newRiderPassword) || !/\d/.test(newRiderPassword)) {
      setFormError('Password must be 8+ chars with uppercase, lowercase, and a number.');
      return;
    }

    const newUser: User = {
      id: newRiderPhone,
      name: newRiderName,
      password: newRiderPassword,
      avatarUrl: `https://i.pravatar.cc/150?u=${newRiderPhone}`,
      clubRole: 'Rider',
      totalRides: 0,
      leads: 0,
      sweeps: 0,
      rps: 0,
    };
    
    setIsSaving(true);
    try {
        await postToSheet('addUser', { user: newUser });
        setUsers([...users, newUser]);
        alert(`Rider "${newRiderName}" registered successfully!`);
        setNewRiderName('');
        setNewRiderPhone('');
        setNewRiderPassword('');
    } catch (e) {
        alert('Failed to register new rider. Please try again.');
        console.error(e);
    } finally {
        setIsSaving(false);
    }
  };
  
  const handleResetPassword = async (userId: string) => {
    const newPassword = window.prompt("Enter the new temporary password for this rider:");
    if (newPassword) {
      if (newPassword.length < 8 || !/[A-Z]/.test(newPassword) || !/[a-z]/.test(newPassword) || !/\d/.test(newPassword)) {
        alert('Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, and a number.');
        return;
      }
      setIsSaving(true);
      try {
        await postToSheet('resetPassword', { userId, newPassword });
        setUsers(users.map(u => u.id === userId ? { ...u, password: newPassword } : u));
        alert(`Password for user ${userId} has been reset and saved.`);
      } catch (e) {
        alert('Failed to reset password. Please try again.');
        console.error(e);
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleCreateRide = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!window.confirm('Are you sure you want to create this ride?')) {
        return;
    }
    
    setRideFormError('');

    if (!newRideTitle || !newRideSummary || !newRideDate || !newRideMapLink) {
      setRideFormError('All fields are required.');
      return;
    }
    
    try {
      new URL(newRideMapLink);
    } catch (_) {
      setRideFormError('Please enter a valid map link (URL).');
      return;
    }
    
    if (!currentUser) {
        setRideFormError('Current user not found. Cannot create ride.');
        return;
    }

    const maxId = rides.reduce((max, ride) => {
        const rideIdNum = parseInt(ride.id, 10);
        return !isNaN(rideIdNum) && rideIdNum > max ? rideIdNum : max;
    }, 0);
    const newRideId = String(maxId + 1);

    const newRide: Ride = {
      id: newRideId,
      title: newRideTitle,
      summary: newRideSummary,
      date: new Date(newRideDate).toISOString(),
      marshalId: currentUser.id,
      participants: [{ userId: currentUser.id, role: 'Marshal' }],
      mapLink: newRideMapLink,
    };

    setIsSaving(true);
    try {
        await postToSheet('addRide', { ride: newRide });
        setRides([newRide, ...rides]);
        alert(`Ride "${newRideTitle}" created and saved successfully!`);
        setNewRideTitle('');
        setNewRideSummary('');
        setNewRideDate('');
        setNewRideMapLink('');
    } catch(e) {
        alert('Failed to create ride. Please try again.');
        console.error(e);
    } finally {
        setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col justify-center items-center text-white">
        <svg className="animate-spin h-10 w-10 text-[var(--primary-color)]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="mt-4 text-lg">Loading Rider Data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col justify-center items-center text-white p-8 text-center">
        <h1 className="text-3xl text-red-500 mb-4">An Error Occurred</h1>
        <p className="text-gray-300">{error}</p>
      </div>
    );
  }
  
  if (!currentUser) {
    return <Login onLogin={handleLogin} users={users} logoUrl={theme.logo} />;
  }
  
  const stats = currentUser;
  const isCurrentUserMarshal = currentUser.clubRole === 'Marshal';

  const promotionCandidates = users
    .filter(user => user.clubRole !== 'Marshal' && user.leads >= 3 && user.sweeps >= 3 && user.rps >= 3);
  
  const now = new Date();
  
  const upcomingRides = rides
    .filter(ride => new Date(ride.date) > now)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const completedRides = rides
    .filter(ride => 
      new Date(ride.date) <= now && 
      ride.participants.some(p => p.userId === currentUser.id)
    )
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="bg-[var(--background-color)] text-gray-200 min-h-screen font-sans">
      <Header 
        currentUser={currentUser} 
        onLogout={handleLogout} 
        onAvatarChange={handleAvatarChange}
        onOpenSettings={() => setIsSettingsOpen(true)}
        logoUrl={theme.logo}
        isSaving={isSaving}
      />
      <main className="container mx-auto p-4 md:p-8">
        <h1 className="text-4xl font-bold text-[var(--primary-color)] mb-2">{currentUser.name ? `Welcome back, ${currentUser.name}!` : 'Welcome!'}</h1>
        <p className="text-gray-400 mb-8">Here's what's happening in the club.</p>

        {stats && (
          <section id="stats" className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-300 mb-4 border-b-2 border-gray-700 pb-2">Your Stats</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                <StatsCard label="Total Rides" value={stats.totalRides} icon={<UsersIcon className="w-8 h-8"/>} />
                <StatsCard label="Leads" value={stats.leads} icon={<SteeringWheelIcon className="w-8 h-8"/>} />
                <StatsCard label="Sweeps" value={stats.sweeps} icon={<BroomIcon className="w-8 h-8"/>} />
                <StatsCard label="RPs" value={stats.rps} icon={<RouteIcon className="w-8 h-8"/>} />
                <StatsCard label="Marshal" value={rides.filter(r => r.marshalId === currentUser.id && new Date(r.date) <= now).length} icon={<CrownIcon className="w-8 h-8"/>} />
            </div>
          </section>
        )}

        {isCurrentUserMarshal && (
            <section id="marshal-controls" className="mb-12 bg-gray-800/50 p-6 rounded-lg border border-[var(--primary-color)]/30">
                <h2 className="text-3xl text-[var(--primary-color)] mb-6">Marshal Controls</h2>
                <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-gray-800 p-6 rounded-md">
                            <h3 className="text-2xl font-semibold mb-4 text-gray-200">Rider Management</h3>
                            <form onSubmit={handleRegisterNewRider} className="space-y-4 mb-6">
                                <fieldset disabled={isSaving}>
                                    <h4 className="text-lg font-semibold flex items-center"><UserPlusIcon className="w-5 h-5 mr-2"/>Register New Rider</h4>
                                    <input type="text" placeholder="Full Name" value={newRiderName} onChange={e => setNewRiderName(e.target.value)} required className="w-full p-2 bg-gray-700 rounded-md border border-gray-600"/>
                                    <input type="text" placeholder="10-Digit Phone" value={newRiderPhone} onChange={e => setNewRiderPhone(e.target.value)} required className="w-full p-2 bg-gray-700 rounded-md border border-gray-600"/>
                                    <input type="password" placeholder="Temporary Password" value={newRiderPassword} onChange={e => setNewRiderPassword(e.target.value)} required className="w-full p-2 bg-gray-700 rounded-md border border-gray-600"/>
                                    {formError && <p className="text-red-400 text-xs">{formError}</p>}
                                    <button type="submit" className="w-full bg-[var(--primary-color)] text-gray-900 font-bold py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed">
                                        {isSaving ? 'Registering...' : 'Register Rider'}
                                    </button>
                                </fieldset>
                            </form>
                            
                            <div>
                                <h4 className="text-lg font-semibold mb-2 flex items-center"><KeyRoundIcon className="w-5 h-5 mr-2"/>Reset Rider Password</h4>
                                <div className="max-h-48 overflow-y-auto space-y-2 pr-2">
                                  {users.filter(u => u.id !== currentUser.id).map(user => (
                                      <div key={user.id} className="flex justify-between items-center bg-gray-700/50 p-2 rounded-md">
                                          <span>{user.name}</span>
                                          <button onClick={() => handleResetPassword(user.id)} className="text-xs bg-yellow-600 hover:bg-yellow-500 text-white font-bold py-1 px-2 rounded disabled:opacity-50" disabled={isSaving}>Reset Pass</button>
                                      </div>
                                  ))}
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-800 p-6 rounded-md">
                            <h3 className="text-2xl font-semibold mb-4 text-gray-200">Promotion Candidates</h3>
                            <p className="text-sm text-gray-400 mb-4">Riders who meet the criteria (3+ Leads, Sweeps, RPs) for Marshal promotion.</p>
                            {promotionCandidates.length > 0 ? (
                                <div className="max-h-60 overflow-y-auto space-y-2 pr-2">
                                    {promotionCandidates.map((user) => (
                                        <div key={user.id} className="bg-gray-700/50 p-3 rounded-md">
                                            <p className="font-bold">{user.name}</p>
                                            <p className="text-xs text-gray-400">
                                                Leads: <span className="text-[var(--primary-color)]">{user.leads}</span> | 
                                                Sweeps: <span className="text-[var(--primary-color)]">{user.sweeps}</span> | 
                                                RPs: <span className="text-[var(--primary-color)]">{user.rps}</span>
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500">No riders currently meet the promotion criteria.</p>
                            )}
                        </div>
                    </div>

                    <div className="bg-gray-800 p-6 rounded-md">
                        <h3 className="text-2xl font-semibold mb-4 text-gray-200 flex items-center">
                            <PlusCircleIcon className="w-6 h-6 mr-2"/>
                            Create New Ride
                        </h3>
                        <form onSubmit={handleCreateRide} className="space-y-4">
                           <fieldset disabled={isSaving}>
                                <input type="text" placeholder="Ride Title" value={newRideTitle} onChange={e => setNewRideTitle(e.target.value)} required className="w-full p-2 bg-gray-700 rounded-md border border-gray-600 focus:border-[var(--primary-color)] focus:ring focus:ring-[var(--primary-color)]/50 transition"/>
                                <input type="text" placeholder="Short Summary" value={newRideSummary} onChange={e => setNewRideSummary(e.target.value)} required className="w-full p-2 bg-gray-700 rounded-md border border-gray-600 focus:border-[var(--primary-color)] focus:ring focus:ring-[var(--primary-color)]/50 transition"/>
                                <div>
                                    <label htmlFor="ride-date" className="text-xs text-gray-400 pl-1">Ride Date & Time</label>
                                    <input id="ride-date" type="datetime-local" value={newRideDate} onChange={e => setNewRideDate(e.target.value)} required className="w-full p-2 bg-gray-700 rounded-md border border-gray-600 focus:border-[var(--primary-color)] focus:ring focus:ring-[var(--primary-color)]/50 transition [color-scheme:dark]"/>
                                </div>
                                <input type="url" placeholder="Google Maps Link (e.g., https://maps.app.goo.gl/...)" value={newRideMapLink} onChange={e => setNewRideMapLink(e.target.value)} required className="w-full p-2 bg-gray-700 rounded-md border border-gray-600 focus:border-[var(--primary-color)] focus:ring focus:ring-[var(--primary-color)]/50 transition"/>
                                {rideFormError && <p className="text-red-400 text-xs">{rideFormError}</p>}
                                <button type="submit" className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed">
                                    {isSaving ? 'Creating...' : 'Create Ride'}
                                </button>
                           </fieldset>
                        </form>
                    </div>
                </div>
            </section>
        )}

        <section id="upcoming-rides" className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-300 mb-4 border-b-2 border-gray-700 pb-2">Upcoming Rides</h2>
          {upcomingRides.length > 0 ? (
            <div className="space-y-8">
              {upcomingRides.map(ride => (
                <RideCard
                  key={ride.id}
                  ride={ride}
                  currentUser={currentUser}
                  allUsers={users}
                  onRegister={handleRegister}
                  onAssignRole={handleAssignRole}
                  onConfirmAttendance={handleConfirmAttendance}
                  isSelected={selectedRideId === ride.id}
                  onSelect={handleSelectRide}
                  isSaving={isSaving}
                />
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No upcoming rides scheduled.</p>
          )}
        </section>

        <section id="completed-rides">
          <h2 className="text-2xl font-semibold text-gray-300 mb-4 border-b-2 border-gray-700 pb-2">My Completed Rides</h2>
          {completedRides.length > 0 ? (
            <div className="max-h-[60vh] overflow-y-auto space-y-8 pr-4 custom-scrollbar">
              {completedRides.map(ride => (
                <RideCard
                  key={ride.id}
                  ride={ride}
                  currentUser={currentUser}
                  allUsers={users}
                  onRegister={handleRegister}
                  onAssignRole={handleAssignRole}
                  onConfirmAttendance={handleConfirmAttendance}
                  isSelected={selectedRideId === ride.id}
                  onSelect={handleSelectRide}
                  isSaving={isSaving}
                />
              ))}
            </div>
           ) : (
            <p className="text-gray-500">You haven't completed any rides yet.</p>
          )}
        </section>
      </main>
      <FeedbackButton />
      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        theme={theme}
        onThemeChange={setTheme}
        onReset={resetTheme}
      />
    </div>
  );
};

export default App;
