/**
 * Lap Processing Service
 * Converts raw lap timing data into animation-ready format
 * 
 * Key responsibilities:
 * - Convert lap time strings to milliseconds
 * - Calculate cumulative race time for each driver
 * - Compute speed factors for smooth animation interpolation
 * - Generate progress percentages along the track
 */

import {
  LapData,
  LapTiming,
  ProcessedLapData,
  JolpicaLap,
  JolpicaResult,
  Driver,
  PitStop,
  JolpicaPitStop,
} from '../types';

// Team colors for visual representation
const TEAM_COLORS: Record<string, string> = {
  'red_bull': '#3671C6',
  'ferrari': '#E8002D',
  'mercedes': '#27F4D2',
  'mclaren': '#FF8000',
  'aston_martin': '#229971',
  'alpine': '#FF87BC',
  'williams': '#64C4FF',
  'rb': '#6692FF',
  'kick_sauber': '#52E252',
  'haas': '#B6BABD',
  // Legacy team IDs
  'alphatauri': '#5E8FAA',
  'alfa': '#C92D4B',
  'racing_point': '#F596C8',
  'renault': '#FFF500',
  'toro_rosso': '#469BFF',
};

/**
 * Converts a lap time string (e.g., "1:23.456") to milliseconds
 */
export function lapTimeToMs(timeStr: string): number {
  if (!timeStr) return 0;
  
  // Handle different formats: "1:23.456" or "23.456"
  const parts = timeStr.split(':');
  
  if (parts.length === 2) {
    // Format: "M:SS.mmm"
    const minutes = parseInt(parts[0], 10);
    const seconds = parseFloat(parts[1]);
    return (minutes * 60 + seconds) * 1000;
  } else {
    // Format: "SS.mmm" or just seconds
    return parseFloat(timeStr) * 1000;
  }
}

/**
 * Converts milliseconds to a formatted lap time string
 */
export function msToLapTime(ms: number): string {
  const totalSeconds = ms / 1000;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = (totalSeconds % 60).toFixed(3);
  
  if (minutes > 0) {
    return `${minutes}:${seconds.padStart(6, '0')}`;
  }
  return seconds;
}

/**
 * Processes raw Jolpica lap data into structured lap timings
 */
export function processLapData(jolpicaLaps: JolpicaLap[]): LapTiming[] {
  return jolpicaLaps.map((lap) => ({
    lap: parseInt(lap.number, 10),
    timings: lap.Timings.map((timing) => ({
      driverId: timing.driverId,
      lap: parseInt(lap.number, 10),
      position: parseInt(timing.position, 10),
      time: timing.time,
      timeInMs: lapTimeToMs(timing.time),
    })),
  }));
}

/**
 * Processes raw Jolpica pitstop data
 */
export function processPitStops(jolpicaPitStops: JolpicaPitStop[]): PitStop[] {
  return jolpicaPitStops.map((pitStop) => ({
    driverId: pitStop.driverId,
    lap: parseInt(pitStop.lap, 10),
    stop: parseInt(pitStop.stop, 10),
    time: pitStop.time,
    duration: pitStop.duration,
    durationInMs: parseFloat(pitStop.duration) * 1000,
  }));
}

/**
 * Calculates processed lap data for each driver
 * Includes cumulative times, speed factors, and progress calculations
 */
export function calculateDriverLapData(
  lapTimings: LapTiming[],
  driverIds: string[]
): ProcessedLapData[] {
  // Calculate average lap time for speed factor normalization
  let totalLapTime = 0;
  let lapCount = 0;
  
  lapTimings.forEach((lapTiming) => {
    lapTiming.timings.forEach((timing) => {
      if (timing.timeInMs > 0) {
        totalLapTime += timing.timeInMs;
        lapCount++;
      }
    });
  });
  
  const averageLapTime = lapCount > 0 ? totalLapTime / lapCount : 90000; // Default 1:30

  // Process each driver's lap data
  return driverIds.map((driverId) => {
    let cumulativeTime = 0;
    const laps: ProcessedLapData['laps'] = [];

    lapTimings.forEach((lapTiming) => {
      const driverTiming = lapTiming.timings.find((t) => t.driverId === driverId);
      
      if (driverTiming) {
        cumulativeTime += driverTiming.timeInMs;
        
        // Speed factor: ratio of average time to actual time
        // Faster laps have higher speed factor (>1), slower have lower (<1)
        const speedFactor = averageLapTime / driverTiming.timeInMs;
        
        laps.push({
          lap: driverTiming.lap,
          position: driverTiming.position,
          timeInMs: driverTiming.timeInMs,
          cumulativeTimeInMs: cumulativeTime,
          progressPerLap: 100, // Each lap is 100% of track
          speedFactor: Math.max(0.5, Math.min(1.5, speedFactor)), // Clamp between 0.5-1.5
        });
      }
    });

    return {
      driverId,
      laps,
    };
  });
}

/**
 * Processes driver data from race results
 */
export function processDrivers(results: JolpicaResult[]): Driver[] {
  return results.map((result) => {
    const constructorId = result.Constructor.constructorId;
    const color = TEAM_COLORS[constructorId] || '#888888';
    
    return {
      driverId: result.Driver.driverId,
      permanentNumber: result.number,
      code: result.Driver.code || result.Driver.driverId.substring(0, 3).toUpperCase(),
      givenName: result.Driver.givenName,
      familyName: result.Driver.familyName,
      nationality: result.Driver.nationality,
      constructor: {
        constructorId: result.Constructor.constructorId,
        name: result.Constructor.name,
        nationality: result.Constructor.nationality,
      },
      color,
    };
  });
}

/**
 * Identifies DNF (Did Not Finish) drivers from race results
 */
export function identifyDNFs(results: JolpicaResult[]): Map<string, { lap: number; reason: string }> {
  const dnfs = new Map<string, { lap: number; reason: string }>();
  
  results.forEach((result) => {
    const status = result.status.toLowerCase();
    
    // Check if driver didn't finish normally
    if (status !== 'finished' && !status.includes('+')) {
      dnfs.set(result.Driver.driverId, {
        lap: parseInt(result.laps, 10),
        reason: result.status,
      });
    }
  });
  
  return dnfs;
}

/**
 * Finds the fastest lap of the race
 */
export function findFastestLap(results: JolpicaResult[]): {
  driverId: string;
  lap: number;
  time: string;
  timeInMs: number;
} | null {
  for (const result of results) {
    if (result.FastestLap?.rank === '1') {
      return {
        driverId: result.Driver.driverId,
        lap: parseInt(result.FastestLap.lap, 10),
        time: result.FastestLap.Time.time,
        timeInMs: lapTimeToMs(result.FastestLap.Time.time),
      };
    }
  }
  return null;
}

/**
 * Calculates the total race duration based on lap data
 */
export function calculateRaceDuration(lapTimings: LapTiming[]): number {
  if (lapTimings.length === 0) return 0;
  
  // Find the maximum cumulative time among all drivers
  let maxTime = 0;
  const driverTimes = new Map<string, number>();
  
  lapTimings.forEach((lapTiming) => {
    lapTiming.timings.forEach((timing) => {
      const currentTime = driverTimes.get(timing.driverId) || 0;
      const newTime = currentTime + timing.timeInMs;
      driverTimes.set(timing.driverId, newTime);
      
      if (newTime > maxTime) {
        maxTime = newTime;
      }
    });
  });
  
  return maxTime;
}

/**
 * Interpolates driver position at a specific time during the race
 * Returns progress percentage (0-100) within current lap
 */
export function interpolatePosition(
  processedData: ProcessedLapData,
  targetTimeMs: number,
  totalLaps: number
): {
  lap: number;
  progress: number;
  position: number;
} {
  const { laps } = processedData;
  
  if (laps.length === 0) {
    return { lap: 0, progress: 0, position: 0 };
  }
  
  // Find the lap where targetTime falls
  for (let i = 0; i < laps.length; i++) {
    const currentLap = laps[i];
    const prevCumulativeTime = i > 0 ? laps[i - 1].cumulativeTimeInMs : 0;
    
    if (targetTimeMs <= currentLap.cumulativeTimeInMs) {
      // Calculate progress within this lap
      const lapStartTime = prevCumulativeTime;
      const lapDuration = currentLap.timeInMs;
      const timeIntoLap = targetTimeMs - lapStartTime;
      
      // Progress percentage within current lap (0-100)
      const progress = Math.min(100, Math.max(0, (timeIntoLap / lapDuration) * 100));
      
      return {
        lap: currentLap.lap,
        progress,
        position: currentLap.position,
      };
    }
  }
  
  // Past all recorded laps - return last known position
  const lastLap = laps[laps.length - 1];
  return {
    lap: lastLap.lap,
    progress: 100,
    position: lastLap.position,
  };
}

export default {
  lapTimeToMs,
  msToLapTime,
  processLapData,
  processPitStops,
  calculateDriverLapData,
  processDrivers,
  identifyDNFs,
  findFastestLap,
  calculateRaceDuration,
  interpolatePosition,
};
