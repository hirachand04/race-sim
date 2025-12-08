/**
 * Mock Race Data
 * Provides fallback data for testing when the API is unavailable
 * This simulates a 2024 Monza race with sample drivers and lap data
 */

import { 
  RaceMetadata, 
  Driver, 
  LapTiming, 
  ProcessedLapData, 
  PitStop, 
  RaceEvent,
  RaceTimeline 
} from '../types';

// Sample race metadata (2024 Italian GP style)
const metadata: RaceMetadata = {
  season: '2024',
  round: '15',
  raceName: 'Italian Grand Prix',
  circuitId: 'monza',
  circuitName: 'Autodromo Nazionale di Monza',
  country: 'Italy',
  locality: 'Monza',
  date: '2024-09-01',
  time: '13:00:00Z',
  totalLaps: 53,
};

// Sample drivers with team colors
const drivers: Driver[] = [
  {
    driverId: 'max_verstappen',
    permanentNumber: '1',
    code: 'VER',
    givenName: 'Max',
    familyName: 'Verstappen',
    nationality: 'Dutch',
    constructor: { constructorId: 'red_bull', name: 'Red Bull', nationality: 'Austrian' },
    color: '#3671C6',
  },
  {
    driverId: 'leclerc',
    permanentNumber: '16',
    code: 'LEC',
    givenName: 'Charles',
    familyName: 'Leclerc',
    nationality: 'Monegasque',
    constructor: { constructorId: 'ferrari', name: 'Ferrari', nationality: 'Italian' },
    color: '#E8002D',
  },
  {
    driverId: 'norris',
    permanentNumber: '4',
    code: 'NOR',
    givenName: 'Lando',
    familyName: 'Norris',
    nationality: 'British',
    constructor: { constructorId: 'mclaren', name: 'McLaren', nationality: 'British' },
    color: '#FF8000',
  },
  {
    driverId: 'sainz',
    permanentNumber: '55',
    code: 'SAI',
    givenName: 'Carlos',
    familyName: 'Sainz',
    nationality: 'Spanish',
    constructor: { constructorId: 'ferrari', name: 'Ferrari', nationality: 'Italian' },
    color: '#E8002D',
  },
  {
    driverId: 'hamilton',
    permanentNumber: '44',
    code: 'HAM',
    givenName: 'Lewis',
    familyName: 'Hamilton',
    nationality: 'British',
    constructor: { constructorId: 'mercedes', name: 'Mercedes', nationality: 'German' },
    color: '#27F4D2',
  },
  {
    driverId: 'russell',
    permanentNumber: '63',
    code: 'RUS',
    givenName: 'George',
    familyName: 'Russell',
    nationality: 'British',
    constructor: { constructorId: 'mercedes', name: 'Mercedes', nationality: 'German' },
    color: '#27F4D2',
  },
  {
    driverId: 'piastri',
    permanentNumber: '81',
    code: 'PIA',
    givenName: 'Oscar',
    familyName: 'Piastri',
    nationality: 'Australian',
    constructor: { constructorId: 'mclaren', name: 'McLaren', nationality: 'British' },
    color: '#FF8000',
  },
  {
    driverId: 'perez',
    permanentNumber: '11',
    code: 'PER',
    givenName: 'Sergio',
    familyName: 'Perez',
    nationality: 'Mexican',
    constructor: { constructorId: 'red_bull', name: 'Red Bull', nationality: 'Austrian' },
    color: '#3671C6',
  },
  {
    driverId: 'alonso',
    permanentNumber: '14',
    code: 'ALO',
    givenName: 'Fernando',
    familyName: 'Alonso',
    nationality: 'Spanish',
    constructor: { constructorId: 'aston_martin', name: 'Aston Martin', nationality: 'British' },
    color: '#229971',
  },
  {
    driverId: 'stroll',
    permanentNumber: '18',
    code: 'STR',
    givenName: 'Lance',
    familyName: 'Stroll',
    nationality: 'Canadian',
    constructor: { constructorId: 'aston_martin', name: 'Aston Martin', nationality: 'British' },
    color: '#229971',
  },
];

// Generate sample lap timings
function generateLapTimings(): LapTiming[] {
  const lapTimings: LapTiming[] = [];
  const baseLapTime = 84000; // 1:24.000 in ms
  
  for (let lap = 1; lap <= 10; lap++) { // Only 10 laps for mock data
    const timings = drivers.map((driver, index) => {
      // Add some variation to lap times
      const variation = Math.random() * 2000 - 1000; // +/- 1 second
      const positionPenalty = index * 500; // Slower for lower positions
      const lapTime = baseLapTime + variation + positionPenalty;
      
      return {
        driverId: driver.driverId,
        lap,
        position: index + 1,
        time: formatLapTime(lapTime),
        timeInMs: lapTime,
      };
    });
    
    lapTimings.push({ lap, timings });
  }
  
  return lapTimings;
}

function formatLapTime(ms: number): string {
  const totalSeconds = ms / 1000;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = (totalSeconds % 60).toFixed(3);
  return `${minutes}:${seconds.padStart(6, '0')}`;
}

// Generate processed lap data
function generateProcessedLapData(lapTimings: LapTiming[]): ProcessedLapData[] {
  return drivers.map((driver) => {
    let cumulativeTime = 0;
    const averageLapTime = 84000;
    
    const laps = lapTimings.map((lapTiming) => {
      const driverTiming = lapTiming.timings.find(t => t.driverId === driver.driverId);
      if (!driverTiming) {
        return null;
      }
      
      cumulativeTime += driverTiming.timeInMs;
      const speedFactor = averageLapTime / driverTiming.timeInMs;
      
      return {
        lap: driverTiming.lap,
        position: driverTiming.position,
        timeInMs: driverTiming.timeInMs,
        cumulativeTimeInMs: cumulativeTime,
        progressPerLap: 100,
        speedFactor: Math.max(0.5, Math.min(1.5, speedFactor)),
      };
    }).filter(Boolean) as ProcessedLapData['laps'];
    
    return {
      driverId: driver.driverId,
      laps,
    };
  });
}

// Sample pitstops
const pitStops: PitStop[] = [
  { driverId: 'max_verstappen', lap: 5, stop: 1, time: '14:15:30', duration: '2.4', durationInMs: 2400 },
  { driverId: 'leclerc', lap: 5, stop: 1, time: '14:15:35', duration: '2.3', durationInMs: 2300 },
  { driverId: 'norris', lap: 6, stop: 1, time: '14:17:00', duration: '2.5', durationInMs: 2500 },
  { driverId: 'hamilton', lap: 6, stop: 1, time: '14:17:10', duration: '2.6', durationInMs: 2600 },
];

// Sample events
const events: RaceEvent[] = [
  { type: 'lap_complete', lap: 1, timeInMs: 84000, driverId: 'max_verstappen', data: { position: 1, lapTime: 84000 } },
  { type: 'overtake', lap: 3, timeInMs: 250000, driverId: 'leclerc', data: { position: 1, previousPosition: 2, overtakenDriverId: 'max_verstappen' } },
  { type: 'pitstop', lap: 5, timeInMs: 420000, driverId: 'max_verstappen', data: { pitDuration: 2400 } },
  { type: 'fastest_lap', lap: 8, timeInMs: 672000, driverId: 'norris', data: { lapTime: 82500 } },
];

// Generate mock data
const lapTimings = generateLapTimings();
const processedLapData = generateProcessedLapData(lapTimings);

// Sample timeline (simplified)
const timeline: RaceTimeline = {
  metadata,
  drivers,
  totalDurationMs: lapTimings.length * 84000,
  frames: [],
  events,
};

// Generate frames for timeline
for (let timeMs = 0; timeMs <= timeline.totalDurationMs; timeMs += 5000) {
  const currentLap = Math.floor(timeMs / 84000) + 1;
  const progressInLap = ((timeMs % 84000) / 84000) * 100;
  
  timeline.frames.push({
    timeInMs: timeMs,
    drivers: drivers.map((driver, index) => ({
      driverId: driver.driverId,
      position: index + 1,
      progress: progressInLap,
      lap: Math.min(currentLap, 10),
      isInPit: false,
      isDNF: false,
      hasFastestLap: driver.driverId === 'norris',
      gapToLeader: index * 1500,
      lastLapTime: 84000 + (index * 500),
    })),
    events: events.filter(e => Math.abs(e.timeInMs - timeMs) < 2500),
  });
}

export const mockRaceData = {
  metadata,
  drivers,
  lapTimings,
  processedLapData,
  pitStops,
  events,
  timeline,
};
