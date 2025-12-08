/**
 * Jolpica F1 API Service
 * Handles all API calls to the jolpica-f1 data source
 * https://api.jolpi.ca/ergast/f1/
 */

import axios from 'axios';
import {
  JolpicaApiResponse,
  RaceTableData,
  JolpicaRace,
  JolpicaLap,
  JolpicaPitStop,
  JolpicaDriver,
  JolpicaConstructor,
} from '../types';

// Base URL for the Jolpica F1 API
const BASE_URL = 'https://api.jolpi.ca/ergast/f1';

// Axios instance with default configuration
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000, // 30 second timeout
  headers: {
    'Accept': 'application/json',
  },
});

/**
 * Fetches available seasons from the API
 * Limit set high to automatically include future seasons as they become available
 */
export async function getSeasons(): Promise<string[]> {
  try {
    const response = await api.get('/seasons.json?limit=200');
    const seasons = response.data.MRData.SeasonTable.Seasons;
    return seasons.map((s: { season: string }) => s.season);
  } catch (error) {
    console.error('Error fetching seasons:', error);
    throw error;
  }
}

/**
 * Fetches all circuits
 */
export async function getCircuits(): Promise<any[]> {
  try {
    const response = await api.get('/circuits.json?limit=100');
    return response.data.MRData.CircuitTable.Circuits;
  } catch (error) {
    console.error('Error fetching circuits:', error);
    throw error;
  }
}

/**
 * Fetches races for a specific season
 */
export async function getRaces(season: string): Promise<JolpicaRace[]> {
  try {
    const response = await api.get(`/${season}/races.json`);
    return response.data.MRData.RaceTable.Races || [];
  } catch (error) {
    console.error(`Error fetching races for season ${season}:`, error);
    throw error;
  }
}

/**
 * Fetches race results for a specific race
 */
export async function getRaceResults(season: string, round: string): Promise<JolpicaRace | null> {
  try {
    const response = await api.get(`/${season}/${round}/results.json`);
    const races = response.data.MRData.RaceTable.Races;
    return races && races.length > 0 ? races[0] : null;
  } catch (error) {
    console.error(`Error fetching results for ${season}/${round}:`, error);
    throw error;
  }
}

/**
 * Fetches lap timing data for a specific race
 * Note: This may require multiple requests for all laps
 */
export async function getLapTimes(season: string, round: string): Promise<JolpicaLap[]> {
  try {
    // First, get the total number of laps
    const response = await api.get(`/${season}/${round}/laps.json?limit=100`);
    const data = response.data.MRData;
    const totalLaps = parseInt(data.total);
    
    let allLaps: JolpicaLap[] = data.RaceTable.Races[0]?.Laps || [];
    
    // If there are more laps, fetch them in batches
    if (totalLaps > 100) {
      const batchSize = 100;
      const batches = Math.ceil(totalLaps / batchSize);
      
      for (let i = 1; i < batches; i++) {
        const offset = i * batchSize;
        const batchResponse = await api.get(
          `/${season}/${round}/laps.json?limit=${batchSize}&offset=${offset}`
        );
        const batchLaps = batchResponse.data.MRData.RaceTable.Races[0]?.Laps || [];
        allLaps = [...allLaps, ...batchLaps];
      }
    }
    
    return allLaps;
  } catch (error) {
    console.error(`Error fetching lap times for ${season}/${round}:`, error);
    throw error;
  }
}

/**
 * Fetches pitstop data for a specific race
 */
export async function getPitStops(season: string, round: string): Promise<JolpicaPitStop[]> {
  try {
    const response = await api.get(`/${season}/${round}/pitstops.json?limit=100`);
    const races = response.data.MRData.RaceTable.Races;
    return races && races.length > 0 ? races[0].PitStops || [] : [];
  } catch (error) {
    console.error(`Error fetching pit stops for ${season}/${round}:`, error);
    throw error;
  }
}

/**
 * Fetches driver information for a specific season
 */
export async function getDrivers(season: string): Promise<JolpicaDriver[]> {
  try {
    const response = await api.get(`/${season}/drivers.json?limit=50`);
    return response.data.MRData.DriverTable.Drivers || [];
  } catch (error) {
    console.error(`Error fetching drivers for season ${season}:`, error);
    throw error;
  }
}

/**
 * Fetches constructor information for a specific season
 */
export async function getConstructors(season: string): Promise<JolpicaConstructor[]> {
  try {
    const response = await api.get(`/${season}/constructors.json?limit=20`);
    return response.data.MRData.ConstructorTable.Constructors || [];
  } catch (error) {
    console.error(`Error fetching constructors for season ${season}:`, error);
    throw error;
  }
}

/**
 * Fetches qualifying results for a specific race
 */
export async function getQualifying(season: string, round: string): Promise<any> {
  try {
    const response = await api.get(`/${season}/${round}/qualifying.json`);
    const races = response.data.MRData.RaceTable.Races;
    return races && races.length > 0 ? races[0] : null;
  } catch (error) {
    console.error(`Error fetching qualifying for ${season}/${round}:`, error);
    throw error;
  }
}

/**
 * Fetches driver standings for a specific season
 */
export async function getDriverStandings(season: string): Promise<any[]> {
  try {
    const response = await api.get(`/${season}/driverstandings.json`);
    const standingsLists = response.data.MRData.StandingsTable.StandingsLists;
    return standingsLists && standingsLists.length > 0 
      ? standingsLists[0].DriverStandings || []
      : [];
  } catch (error) {
    console.error(`Error fetching driver standings for ${season}:`, error);
    throw error;
  }
}

/**
 * Fetches constructor standings for a specific season
 */
export async function getConstructorStandings(season: string): Promise<any[]> {
  try {
    const response = await api.get(`/${season}/constructorstandings.json`);
    const standingsLists = response.data.MRData.StandingsTable.StandingsLists;
    return standingsLists && standingsLists.length > 0 
      ? standingsLists[0].ConstructorStandings || []
      : [];
  } catch (error) {
    console.error(`Error fetching constructor standings for ${season}:`, error);
    throw error;
  }
}

/**
 * Fetches sprint results for a specific race
 */
export async function getSprintResults(season: string, round: string): Promise<any> {
  try {
    const response = await api.get(`/${season}/${round}/sprint.json`);
    const races = response.data.MRData.RaceTable.Races;
    return races && races.length > 0 ? races[0] : null;
  } catch (error) {
    console.error(`Error fetching sprint for ${season}/${round}:`, error);
    return null; // Sprint may not exist for all races
  }
}

/**
 * Fetches fastest lap information for a race
 */
export async function getFastestLap(season: string, round: string): Promise<any> {
  try {
    const response = await api.get(`/${season}/${round}/fastest/1/results.json`);
    const races = response.data.MRData.RaceTable.Races;
    return races && races.length > 0 ? races[0] : null;
  } catch (error) {
    console.error(`Error fetching fastest lap for ${season}/${round}:`, error);
    return null;
  }
}

/**
 * Fetches driver standings after a specific race
 */
export async function getDriverStandingsAfterRace(season: string, round: string): Promise<any[]> {
  try {
    const response = await api.get(`/${season}/${round}/driverstandings.json`);
    const standingsLists = response.data.MRData.StandingsTable.StandingsLists;
    return standingsLists && standingsLists.length > 0 
      ? standingsLists[0].DriverStandings || []
      : [];
  } catch (error) {
    console.error(`Error fetching driver standings after ${season}/${round}:`, error);
    throw error;
  }
}

/**
 * Fetches constructor standings after a specific race
 */
export async function getConstructorStandingsAfterRace(season: string, round: string): Promise<any[]> {
  try {
    const response = await api.get(`/${season}/${round}/constructorstandings.json`);
    const standingsLists = response.data.MRData.StandingsTable.StandingsLists;
    return standingsLists && standingsLists.length > 0 
      ? standingsLists[0].ConstructorStandings || []
      : [];
  } catch (error) {
    console.error(`Error fetching constructor standings after ${season}/${round}:`, error);
    throw error;
  }
}

/**
 * Fetches all available data for a race weekend
 */
export async function getRaceWeekendData(season: string, round: string): Promise<{
  race: any;
  qualifying: any;
  sprint: any;
  results: any;
  pitStops: any[];
  driverStandings: any[];
  constructorStandings: any[];
}> {
  try {
    // Fetch all data in parallel
    const [race, qualifying, sprint, results, pitStops, driverStandings, constructorStandings] = 
      await Promise.all([
        getRaces(season).then(races => races.find(r => r.round === round)),
        getQualifying(season, round),
        getSprintResults(season, round),
        getRaceResults(season, round),
        getPitStops(season, round),
        getDriverStandingsAfterRace(season, round).catch(() => []),
        getConstructorStandingsAfterRace(season, round).catch(() => []),
      ]);

    return {
      race,
      qualifying,
      sprint,
      results,
      pitStops,
      driverStandings,
      constructorStandings,
    };
  } catch (error) {
    console.error(`Error fetching race weekend data for ${season}/${round}:`, error);
    throw error;
  }
}

/**
 * Fetches all race statuses
 */
export async function getStatuses(): Promise<any[]> {
  try {
    const response = await api.get('/status.json?limit=200');
    return response.data.MRData.StatusTable.Status || [];
  } catch (error) {
    console.error('Error fetching statuses:', error);
    throw error;
  }
}

export default {
  getSeasons,
  getCircuits,
  getRaces,
  getRaceResults,
  getLapTimes,
  getPitStops,
  getDrivers,
  getConstructors,
  getQualifying,
  getDriverStandings,
  getConstructorStandings,
  getSprintResults,
  getFastestLap,
  getDriverStandingsAfterRace,
  getConstructorStandingsAfterRace,
  getRaceWeekendData,
  getStatuses,
};
