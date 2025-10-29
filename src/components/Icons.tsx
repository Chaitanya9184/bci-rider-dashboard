// FIX: Using namespace import for React to solve JSX intrinsic element errors.
import * as React from 'react';
import type { Role } from '../types';

export const BCILogo: React.FC<React.SVGProps<SVGSVGElement> & { logoUrl?: string }> = ({ logoUrl, ...props }) => {
    if (logoUrl) {
        // This is a simple way to use an image as an icon. 
        // A more robust solution might involve SVG manipulation if the logo is SVG.
        // FIX: The props for BCILogo are being cast from SVGProps to ImgHTMLAttributes. This is a type error because they are not sufficiently related. Casting through 'unknown' first resolves this, as suggested by the TypeScript compiler error.
        return <img src={logoUrl} alt="BCI Logo" {...props as unknown as React.ImgHTMLAttributes<HTMLImageElement>} />;
    }
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" {...props}>
            <circle cx="50" cy="50" r="45" fill="#333" stroke="var(--primary-color)" strokeWidth="2"/>
            <text x="50" y="55" fontSize="30" fill="var(--primary-color)" textAnchor="middle" dominantBaseline="middle" fontFamily="Arial, sans-serif" fontWeight="bold">BCI</text>
        </svg>
    );
};


export const EditIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
);

export const CalendarIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
);

export const UsersIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
);

export const MapPinIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
);

export const CrownIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7z"/></svg>
);

export const SteeringWheelIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="2"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="m2 12 h2"/><path d="m20 12 h2"/><path d="m4.93 19.07 1.41-1.41"/><path d="m17.66 6.34 1.41-1.41"/></svg>
);

export const RouteIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="6" cy="18" r="3"/><circle cx="18" cy="6" r="3"/><path d="M6 9V6a3 3 0 0 1 3-3h3a3 3 0 0 1 3 3v6a3 3 0 0 0 3 3h1"/></svg>
);

export const BroomIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M19.4 12.6 12 5.2 4.6 12.6c-.4.4-.4 1 0 1.4l.7.7c.4.4 1 .4 1.4 0L12 9.4l5.3 5.3c.4.4 1 .4 1.4 0l.7-.7c.4-.4.4-1 0-1.4Z"/><path d="M12 22v-9"/><path d="m9 13 3-3 3 3"/></svg>
);

export const MessageSquareIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
);

export const UserPlusIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>
);

export const KeyRoundIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M2 18v3c0 .6.4 1 1 1h4v-3h3v-3h2l1.4-1.4a6.5 6.5 0 1 0-4-4Z"/><circle cx="16.5" cy="7.5" r=".5"/></svg>
);

export const PlusCircleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
);

export const GearIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16z"/><path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"/><path d="M12 2v2"/><path d="M12 22v-2"/><path d="m1.9 9.5 2.8-.5"/><path d="m19.3 15.1 2.8-.5"/><path d="m6.2 4.1 1.3 2.4"/><path d="m16.5 17.5 1.3 2.4"/><path d="m1.9 14.5 2.8.5"/><path d="m19.3 8.9 2.8.5"/><path d="m6.2 19.9 1.3-2.4"/><path d="m16.5 6.5 1.3-2.4"/></svg>
);


// RoleIcon to display different icons based on role
export const RoleIcon: React.FC<{role: Role} & React.SVGProps<SVGSVGElement>> = ({ role, ...props }) => {
    switch (role) {
        case 'Marshal':
            return <CrownIcon {...props} />;
        case 'Lead':
            return <SteeringWheelIcon {...props} />;
        case 'Sweep':
            return <BroomIcon {...props} />;
        case 'RP':
            return <RouteIcon {...props} />;
        case 'Rider':
        default:
            return <UsersIcon {...props} />;
    }
}
