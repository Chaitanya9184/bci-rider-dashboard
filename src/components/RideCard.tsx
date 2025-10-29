// FIX: Using namespace import for React to solve JSX intrinsic element errors.
import * as React from 'react';
import type { Ride, User, Role, RideParticipant } from '../types';
import { CalendarIcon, UsersIcon, CrownIcon, RoleIcon, MapPinIcon } from './Icons';

interface RideCardProps {
  ride: Ride;
  currentUser: User;
  allUsers: User[];
  onRegister: (rideId: string) => void;
  onAssignRole: (rideId: string, userId: string, role: Role) => void;
  onConfirmAttendance: (rideId: string, confirmedUserIds: Record<string, boolean>) => void;
  isSelected: boolean;
  onSelect: (rideId: string) => void;
  isSaving: boolean;
}

const MarshalConfirmation: React.FC<{
    rideId: string;
    participants: RideParticipant[];
    allUsers: User[];
    onConfirmAttendance: (rideId: string, confirmedUserIds: Record<string, boolean>) => void;
    isSaving: boolean;
}> = ({ rideId, participants, allUsers, onConfirmAttendance, isSaving }) => {
    const [confirmed, setConfirmed] = React.useState<Record<string, boolean>>({});

    const handleToggle = (userId: string) => {
        setConfirmed(prev => ({ ...prev, [userId]: !prev[userId]}));
    }

    const handleSubmit = () => {
        onConfirmAttendance(rideId, confirmed);
    }

    return (
        <div className="mt-6 border-t-2 border-gray-700 pt-4">
            <fieldset disabled={isSaving}>
                <h4 className="text-xl font-semibold text-gray-200 mb-3">Post-Ride Checklist: Confirm Attendance</h4>
                <p className="text-sm text-gray-400 mb-4">As the marshal, please confirm which riders were present for the ride. This will update their ride stats.</p>
                <div className="space-y-2 mb-4">
                    {participants.filter(p => p.role !== 'Marshal').map(p => {
                        const user = allUsers.find(u => u.id === p.userId);
                        if (!user) return null;
                        return (
                            <label key={p.userId} className="flex items-center space-x-3 bg-gray-700/50 p-3 rounded-md cursor-pointer hover:bg-gray-700">
                                <input 
                                    type="checkbox"
                                    checked={!!confirmed[p.userId]}
                                    onChange={() => handleToggle(p.userId)}
                                    className="w-5 h-5 bg-gray-900 border-gray-600 text-[var(--primary-color)] focus:ring-[var(--primary-color)]"
                                />
                                <span>{user.name}</span>
                            </label>
                        )
                    })}
                </div>
                <button
                    onClick={handleSubmit}
                    className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSaving ? 'Submitting...' : 'Submit Attendance'}
                </button>
            </fieldset>
        </div>
    );
}


const RideCard: React.FC<RideCardProps> = ({ ride, currentUser, allUsers, onRegister, onAssignRole, onConfirmAttendance, isSelected, onSelect, isSaving }) => {
  const marshal = allUsers.find(u => u.id === ride.marshalId);
  const isCurrentUserMarshal = currentUser.id === ride.marshalId;
  const isCurrentUserRegistered = ride.participants.some(p => p.userId === currentUser.id);
  const isRideInPast = new Date(ride.date) < new Date();
  
  const currentUserRole = ride.participants.find(p => p.userId === currentUser.id)?.role;
  const canViewDetails = isCurrentUserMarshal || (!!currentUserRole && currentUserRole !== 'Rider') || (isRideInPast && isCurrentUserRegistered);

  const handleRoleChange = (userId: string, event: React.ChangeEvent<HTMLSelectElement>) => {
    onAssignRole(ride.id, userId, event.target.value as Role);
  };

  const getUserById = (userId: string) => allUsers.find(u => u.id === userId);

  return (
    <div 
        className={`bg-gray-800 rounded-lg shadow-lg overflow-hidden transition-all duration-300 ${isRideInPast && !isSelected ? 'opacity-70' : ''} ${isSelected ? 'shadow-[var(--primary-color)]/40 border-2 border-[var(--primary-color)]/80' : 'border border-gray-700'} ${canViewDetails ? 'hover:shadow-[var(--primary-color)]/30 hover:border-gray-500' : ''}`}
        onClick={canViewDetails ? () => onSelect(ride.id) : undefined}
    >
      <div className={`p-6 ${canViewDetails ? 'cursor-pointer' : ''}`}>
        <div className="flex justify-between items-start">
            <div>
                <h3 className="text-3xl font-bold text-[var(--primary-color)] mb-2 tracking-wide uppercase">{ride.title}</h3>
                <div className="flex items-center text-gray-400 mb-4 text-lg">
                <CalendarIcon className="w-5 h-5 mr-2" />
                <span>{new Date(ride.date).toLocaleString('en-IN', { dateStyle: 'full', timeStyle: 'short' })}</span>
                </div>
            </div>
            {isRideInPast && <span className="bg-red-500/50 text-red-200 text-xs font-bold uppercase px-3 py-1 rounded-full">Completed</span>}
        </div>
        <p className="text-gray-300 mb-6">{ride.summary}</p>
        
        <div className="mb-6">
            <h4 className="text-xl font-semibold text-gray-200 mb-3 border-b-2 border-gray-700 pb-2">Riders ({ride.participants.length})</h4>
            <ul className="space-y-3">
                {ride.participants.map(participant => {
                    const user = getUserById(participant.userId);
                    if (!user) return null;
                    return (
                        <li key={participant.userId} className="flex items-center justify-between bg-gray-700/50 p-3 rounded-md">
                            <div className="flex items-center space-x-3">
                                <img src={user.avatarUrl} alt={user.name} className="w-10 h-10 rounded-full border-2 border-gray-500"/>
                                <span>{user.name}</span>
                                <span className="text-[var(--primary-color)]" title={participant.role}>
                                    <RoleIcon role={participant.role} />
                                </span>
                            </div>
                            {isCurrentUserMarshal && participant.role !== 'Marshal' && !isRideInPast && (
                                <select 
                                    value={participant.role}
                                    onChange={(e) => handleRoleChange(participant.userId, e)}
                                    className="bg-gray-900 border border-gray-600 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] disabled:opacity-50"
                                    onClick={(e) => e.stopPropagation()} // Prevent card click when interacting with select
                                    disabled={isSaving}
                                >
                                    <option value="Rider">Rider</option>
                                    <option value="Lead">Lead</option>
                                    <option value="RP">RP</option>
                                    <option value="Sweep">Sweep</option>
                                </select>
                            )}
                        </li>
                    )
                })}
            </ul>
        </div>
        
        {marshal && (
             <div className="mb-6 flex items-center bg-gray-700/30 p-3 rounded-lg">
                <CrownIcon className="w-6 h-6 mr-3 text-yellow-400"/>
                <div>
                    <p className="font-bold text-gray-300">Ride Marshal</p>
                    <p className="text-[var(--primary-color)]">{marshal.name} ({marshal.id})</p>
                </div>
            </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {!isCurrentUserRegistered && !isRideInPast && (
                <button
                    onClick={(e) => { e.stopPropagation(); onRegister(ride.id); }}
                    className="w-full sm:w-auto bg-[var(--primary-color)] hover:bg-opacity-90 text-gray-900 font-bold py-3 px-6 rounded-lg transition-colors duration-300 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isSaving}
                >
                    {isSaving ? (
                        <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    ) : (
                         <UsersIcon className="w-5 h-5"/>
                    )}
                    <span>{isSaving ? 'Registering...' : 'Register for Ride'}</span>
                </button>
            )}
            
            {isCurrentUserRegistered && !isRideInPast && (
                <p className="text-green-400 font-semibold">You are registered!</p>
            )}
            
            {canViewDetails && !isRideInPast && !isSelected && (
                <p className="text-xs text-gray-500 uppercase">Click to view route details</p>
            )}

            {isRideInPast && (
                 <p className="text-gray-400 font-semibold">This ride is complete.</p>
            )}
        </div>

        {isCurrentUserMarshal && isRideInPast && (
            <MarshalConfirmation 
                rideId={ride.id}
                participants={ride.participants} 
                allUsers={allUsers}
                onConfirmAttendance={onConfirmAttendance}
                isSaving={isSaving}
            />
        )}
      </div>
      {isSelected && canViewDetails && (
        <div 
          className="p-6 border-t-2 border-[var(--primary-color)]/30 bg-gray-900/50"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-2xl font-semibold text-gray-200">Ride Route Details</h4>
             <button 
                onClick={() => onSelect(ride.id)} 
                className="bg-gray-700 hover:bg-red-600/50 p-2 rounded-full transition-colors"
                title="Close Details"
               >
                 <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <a
            href={ride.mapLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded-lg transition-colors"
          >
            <MapPinIcon className="w-5 h-5 mr-2" />
            Open Route in Maps
          </a>
        </div>
      )}
    </div>
  );
};

export default RideCard;