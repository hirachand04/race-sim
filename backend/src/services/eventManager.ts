/**
 * Event Manager Service
 * Handles the creation and management of race events
 * 
 * Event types:
 * - lap_complete: Driver completes a lap
 * - pitstop: Driver enters pit lane
 * - overtake: Driver passes another driver
 * - dnf: Driver retires from race
 * - fastest_lap: Driver sets the fastest lap
 */

import {
  RaceEvent,
  RaceEventType,
  ProcessedLapData,
  PitStop,
  LapTiming,
} from '../types';

/**
 * Creates lap complete events for all drivers
 */
export function createLapCompleteEvents(
  lapTimings: LapTiming[]
): RaceEvent[] {
  const events: RaceEvent[] = [];
  const cumulativeTimes = new Map<string, number>();
  
  lapTimings.forEach((lapTiming) => {
    lapTiming.timings.forEach((timing) => {
      const prevTime = cumulativeTimes.get(timing.driverId) || 0;
      const currentTime = prevTime + timing.timeInMs;
      cumulativeTimes.set(timing.driverId, currentTime);
      
      events.push({
        type: 'lap_complete',
        lap: timing.lap,
        timeInMs: currentTime,
        driverId: timing.driverId,
        data: {
          position: timing.position,
          lapTime: timing.timeInMs,
        },
      });
    });
  });
  
  // Sort events by time
  return events.sort((a, b) => a.timeInMs - b.timeInMs);
}

/**
 * Creates pitstop events
 */
export function createPitStopEvents(
  pitStops: PitStop[],
  processedLapData: ProcessedLapData[]
): RaceEvent[] {
  const events: RaceEvent[] = [];
  
  pitStops.forEach((pitStop) => {
    // Find the driver's cumulative time at this lap
    const driverData = processedLapData.find((d) => d.driverId === pitStop.driverId);
    
    if (driverData) {
      const lapData = driverData.laps.find((l) => l.lap === pitStop.lap);
      
      if (lapData) {
        // Pit stop occurs near the end of the lap
        const pitEntryTime = lapData.cumulativeTimeInMs - (lapData.timeInMs * 0.1);
        
        events.push({
          type: 'pitstop',
          lap: pitStop.lap,
          timeInMs: pitEntryTime,
          driverId: pitStop.driverId,
          data: {
            pitDuration: pitStop.durationInMs,
          },
        });
      }
    }
  });
  
  return events.sort((a, b) => a.timeInMs - b.timeInMs);
}

/**
 * Detects overtakes by comparing positions between consecutive laps
 */
export function detectOvertakes(
  lapTimings: LapTiming[]
): RaceEvent[] {
  const events: RaceEvent[] = [];
  const previousPositions = new Map<string, number>();
  const cumulativeTimes = new Map<string, number>();
  
  lapTimings.forEach((lapTiming, lapIndex) => {
    if (lapIndex === 0) {
      // Store initial positions
      lapTiming.timings.forEach((timing) => {
        previousPositions.set(timing.driverId, timing.position);
        cumulativeTimes.set(timing.driverId, timing.timeInMs);
      });
      return;
    }
    
    // Check for position changes
    lapTiming.timings.forEach((timing) => {
      const prevTime = cumulativeTimes.get(timing.driverId) || 0;
      const currentTime = prevTime + timing.timeInMs;
      cumulativeTimes.set(timing.driverId, currentTime);
      
      const prevPosition = previousPositions.get(timing.driverId);
      
      if (prevPosition !== undefined && timing.position < prevPosition) {
        // Driver gained positions - this is an overtake
        // Find who was in the new position before
        const overtakenDriver = Array.from(previousPositions.entries())
          .find(([, pos]) => pos === timing.position);
        
        events.push({
          type: 'overtake',
          lap: timing.lap,
          timeInMs: currentTime - (timing.timeInMs * 0.5), // Mid-lap estimate
          driverId: timing.driverId,
          data: {
            position: timing.position,
            previousPosition: prevPosition,
            overtakenDriverId: overtakenDriver?.[0],
          },
        });
      }
      
      previousPositions.set(timing.driverId, timing.position);
    });
  });
  
  return events.sort((a, b) => a.timeInMs - b.timeInMs);
}

/**
 * Creates DNF (Did Not Finish) events
 */
export function createDNFEvents(
  dnfs: Map<string, { lap: number; reason: string }>,
  processedLapData: ProcessedLapData[]
): RaceEvent[] {
  const events: RaceEvent[] = [];
  
  dnfs.forEach((dnfInfo, driverId) => {
    const driverData = processedLapData.find((d) => d.driverId === driverId);
    
    if (driverData && driverData.laps.length > 0) {
      const lastLap = driverData.laps[driverData.laps.length - 1];
      
      events.push({
        type: 'dnf',
        lap: dnfInfo.lap,
        timeInMs: lastLap.cumulativeTimeInMs,
        driverId,
        data: {
          dnfReason: dnfInfo.reason,
        },
      });
    }
  });
  
  return events.sort((a, b) => a.timeInMs - b.timeInMs);
}

/**
 * Creates fastest lap event
 */
export function createFastestLapEvent(
  fastestLap: { driverId: string; lap: number; time: string; timeInMs: number } | null,
  processedLapData: ProcessedLapData[]
): RaceEvent | null {
  if (!fastestLap) return null;
  
  const driverData = processedLapData.find((d) => d.driverId === fastestLap.driverId);
  
  if (driverData) {
    const lapData = driverData.laps.find((l) => l.lap === fastestLap.lap);
    
    if (lapData) {
      return {
        type: 'fastest_lap',
        lap: fastestLap.lap,
        timeInMs: lapData.cumulativeTimeInMs,
        driverId: fastestLap.driverId,
        data: {
          lapTime: fastestLap.timeInMs,
        },
      };
    }
  }
  
  return null;
}

/**
 * Builds a complete timeline of all race events
 */
export function buildEventTimeline(
  lapTimings: LapTiming[],
  pitStops: PitStop[],
  processedLapData: ProcessedLapData[],
  dnfs: Map<string, { lap: number; reason: string }>,
  fastestLap: { driverId: string; lap: number; time: string; timeInMs: number } | null
): RaceEvent[] {
  const allEvents: RaceEvent[] = [];
  
  // Add lap complete events
  allEvents.push(...createLapCompleteEvents(lapTimings));
  
  // Add pitstop events
  allEvents.push(...createPitStopEvents(pitStops, processedLapData));
  
  // Add overtake events
  allEvents.push(...detectOvertakes(lapTimings));
  
  // Add DNF events
  allEvents.push(...createDNFEvents(dnfs, processedLapData));
  
  // Add fastest lap event
  const fastestLapEvent = createFastestLapEvent(fastestLap, processedLapData);
  if (fastestLapEvent) {
    allEvents.push(fastestLapEvent);
  }
  
  // Sort all events by time
  return allEvents.sort((a, b) => a.timeInMs - b.timeInMs);
}

/**
 * Filters events by type
 */
export function filterEventsByType(
  events: RaceEvent[],
  type: RaceEventType
): RaceEvent[] {
  return events.filter((event) => event.type === type);
}

/**
 * Gets events within a time range
 */
export function getEventsInTimeRange(
  events: RaceEvent[],
  startTimeMs: number,
  endTimeMs: number
): RaceEvent[] {
  return events.filter(
    (event) => event.timeInMs >= startTimeMs && event.timeInMs <= endTimeMs
  );
}

/**
 * Gets events for a specific driver
 */
export function getDriverEvents(
  events: RaceEvent[],
  driverId: string
): RaceEvent[] {
  return events.filter((event) => event.driverId === driverId);
}

export default {
  createLapCompleteEvents,
  createPitStopEvents,
  detectOvertakes,
  createDNFEvents,
  createFastestLapEvent,
  buildEventTimeline,
  filterEventsByType,
  getEventsInTimeRange,
  getDriverEvents,
};
