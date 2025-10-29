export type Role = 'Lead' | 'RP' | 'Sweep' | 'Rider' | 'Marshal';

export interface User {
  id: string; // phone number
  name: string;
  avatarUrl: string;
  password: string;
  clubRole?: 'Marshal' | 'Rider'; // Permanent role within the club
  totalRides: number;
  leads: number;
  sweeps: number;
  rps: number;
}

export interface RideParticipant {
  userId: string;
  role: Role;
}

export interface Ride {
  id: string;
  title: string;
  summary: string;
  date: string; // ISO string for easy formatting
  marshalId: string;
  participants: RideParticipant[];
  mapLink: string;
}

export interface Theme {
    logo: string;
    primaryColor: string;
    backgroundColor: string;
    fontFamily: string;
    headingFontFamily: string;
    baseFontSize: string;
}