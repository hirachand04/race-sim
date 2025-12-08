/**
 * API Service
 * Handles all HTTP requests to the backend server
 */

import axios from 'axios';
import { 
  RaceMetadata, 
  Driver, 
  RaceTimeline, 
  Race,
  RaceEvent,
  RaceTelemetry
} from '../types';

// Use environment variable for production, fallback to proxy for development
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // 60 second timeout for large data fetches
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Fetches available F1 seasons
 */
export async function getSeasons(): Promise<string[]> {
  const response = await api.get('/seasons');
  return response.data.seasons;
}

/**
 * Fetches races for a specific season
 */
export async function getRaces(season: string): Promise<Race[]> {
  const response = await api.get(`/races/${season}`);
  return response.data.races;
}

/**
 * Fetches race metadata
 */
export async function getRaceMetadata(
  season: string, 
  round: string,
  useMock: boolean = false
): Promise<RaceMetadata> {
  const response = await api.get(`/race/${season}/${round}/metadata`, {
    params: { mock: useMock },
  });
  return response.data.metadata;
}

/**
 * Fetches driver information for a race
 */
export async function getDrivers(
  season: string, 
  round: string,
  useMock: boolean = false
): Promise<Driver[]> {
  const response = await api.get(`/race/${season}/${round}/drivers`, {
    params: { mock: useMock },
  });
  return response.data.drivers;
}

/**
 * Fetches complete race timeline for animation
 */
export async function getRaceTimeline(
  season: string,
  round: string,
  useMock: boolean = false,
  frameInterval: number = 1000
): Promise<RaceTimeline> {
  const response = await api.get(`/race/${season}/${round}/timeline`, {
    params: { mock: useMock, frameInterval },
  });
  return response.data.timeline;
}

/**
 * Fetches race events
 */
export async function getRaceEvents(
  season: string,
  round: string,
  eventType?: string,
  useMock: boolean = false
): Promise<RaceEvent[]> {
  const response = await api.get(`/race/${season}/${round}/events`, {
    params: { mock: useMock, type: eventType },
  });
  return response.data.events;
}

/**
 * Fetches qualifying results
 */
export async function getQualifying(season: string, round: string): Promise<any> {
  const response = await api.get(`/race/${season}/${round}/qualifying`);
  return response.data.qualifying;
}

/**
 * Fetches sprint results (if available)
 */
export async function getSprint(season: string, round: string): Promise<any> {
  const response = await api.get(`/race/${season}/${round}/sprint`);
  return response.data.sprint;
}

/**
 * Fetches full race results
 */
export async function getRaceResults(season: string, round: string): Promise<any> {
  const response = await api.get(`/race/${season}/${round}/results`);
  return response.data.results;
}

/**
 * Fetches standings after a race
 */
export async function getStandings(season: string, round: string): Promise<any> {
  const response = await api.get(`/race/${season}/${round}/standings`);
  return response.data.standings;
}

/**
 * Fetches complete race weekend data (all sessions, standings, etc.)
 */
export async function getRaceWeekend(season: string, round: string): Promise<any> {
  const response = await api.get(`/race/${season}/${round}/weekend`);
  return response.data.weekend;
}

/**
 * Fetches comprehensive telemetry data for all drivers in a race
 * Includes fastest lap times, average speeds, grid positions, race times, status
 */
export async function getTelemetry(season: string, round: string): Promise<RaceTelemetry> {
  const response = await api.get(`/race/${season}/${round}/telemetry`);
  return response.data.telemetry;
}

/**
 * Health check for the backend server
 */
export async function checkHealth(): Promise<boolean> {
  try {
    const response = await axios.get('/health');
    return response.data.status === 'ok';
  } catch {
    return false;
  }
}

export default {
  getSeasons,
  getRaces,
  getRaceMetadata,
  getDrivers,
  getRaceTimeline,
  getRaceEvents,
  getQualifying,
  getSprint,
  getRaceResults,
  getStandings,
  getRaceWeekend,
  getTelemetry,
  checkHealth,
};
