import Papa from 'papaparse';
// FIX: Added 'Role' to the type import to resolve 'Cannot find name Role' error.
import type { User, Ride, RideParticipant, Role } from '../types';

// Helper function to convert Google Sheet URLs to CSV export URLs
const getCsvUrl = (gid: string): string => {
  const sheetId = '1_M83JjFv1CEAjpLt9DOxcg_B_zwvRQVbtAN2SZXtUvE';
  return `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`;
};

const USERS_URL = getCsvUrl('0');
const RIDES_URL = getCsvUrl('114042729');
const RIDE_PARTICIPANTS_URL = getCsvUrl('1048416532');

// Generic function to fetch and parse CSV data from a URL
const fetchCsvData = <T>(url: string): Promise<T[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(url, {
      download: true,
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length) {
          reject(new Error(`Error parsing CSV from ${url}: ${JSON.stringify(results.errors)}`));
        } else {
          resolve(results.data as T[]);
        }
      },
      error: (error) => {
        reject(new Error(`Failed to fetch CSV from ${url}: ${error.message}`));
      },
    });
  });
};

// Main function to fetch all app data
export const fetchAppData = async () => {
  try {
    // Fetch with broader types to handle potential number-like strings being parsed as numbers.
    const [rawUsers, rawRidesData, rawRideParticipants] = await Promise.all([
      fetchCsvData<any>(USERS_URL),
      fetchCsvData<any>(RIDES_URL),
      fetchCsvData<any>(RIDE_PARTICIPANTS_URL),
    ]);

    // Sanitize and enforce string types for IDs and other key fields.
    const users: User[] = rawUsers.map((u: any) => ({
      ...u,
      id: String(u.id),
      password: String(u.password),
      totalRides: u.totalRides || 0,
      leads: u.leads || 0,
      sweeps: u.sweeps || 0,
      rps: u.rps || 0,
    }));

    const ridesData: Omit<Ride, 'participants'>[] = rawRidesData.map((r: any) => ({
      ...r,
      id: String(r.id),
      marshalId: String(r.marshalId),
    }));

    const rideParticipants: { rideId: string; userId: string; role: Role }[] = rawRideParticipants.map((p: any) => ({
      ...p,
      rideId: String(p.rideId),
      userId: String(p.userId),
    }));
    
    // Group participants by rideId for efficient lookup
    const participantsByRideId = rideParticipants.reduce<Record<string, RideParticipant[]>>((acc, p) => {
      if (!acc[p.rideId]) {
        acc[p.rideId] = [];
      }
      acc[p.rideId].push({ userId: p.userId, role: p.role });
      return acc;
    }, {});

    // Combine ride data with participants
    const rides: Ride[] = ridesData.map(ride => ({
      ...ride,
      participants: participantsByRideId[String(ride.id)] || [],
    }));

    return { users, rides };
  } catch (error) {
    console.error("Error fetching app data:", error);
    throw error;
  }
};
