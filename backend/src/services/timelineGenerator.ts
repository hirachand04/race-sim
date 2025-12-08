/**
 * Timeline Generator Service
 * Generates animation frames for smooth race replay
 * 
 * This service takes processed lap data and events and generates
 * frame-by-frame animation data that the frontend can use for
 * smooth car movement visualization.
 */

import {
  AnimationFrame,
  RaceTimeline,
  RaceMetadata,
  Driver,
  ProcessedLapData,
  PitStop,
  RaceEvent,
  LapTiming,
} from '../types';

import { interpolatePosition, calculateRaceDuration } from './lapProcessor';

// Default frame interval in milliseconds for smooth animation
// Smaller intervals = smoother animation but more frames
const DEFAULT_FRAME_INTERVAL = 500; // 0.5 seconds of race time per frame for smoother playback

/**
 * Generates a complete race timeline with animation frames
 */
export function generateRaceTimeline(
  metadata: RaceMetadata,
  drivers: Driver[],
  lapTimings: LapTiming[],
  processedLapData: ProcessedLapData[],
  pitStops: PitStop[],
  events: RaceEvent[],
  dnfs: Map<string, { lap: number; reason: string }>,
  fastestLapDriverId: string | null,
  frameInterval: number = DEFAULT_FRAME_INTERVAL
): RaceTimeline {
  const totalDurationMs = calculateRaceDuration(lapTimings);
  const frames: AnimationFrame[] = [];
  
  // Calculate leader's cumulative time for gap calculations
  const leaderTimes = calculateLeaderTimes(lapTimings);
  
  // Create a map for quick pitstop lookup
  const pitStopMap = createPitStopMap(pitStops);
  
  // Generate frames at regular intervals
  for (let timeMs = 0; timeMs <= totalDurationMs; timeMs += frameInterval) {
    const frame = generateFrame(
      timeMs,
      drivers,
      processedLapData,
      pitStopMap,
      events,
      dnfs,
      fastestLapDriverId,
      leaderTimes,
      metadata.totalLaps
    );
    frames.push(frame);
  }
  
  return {
    metadata,
    drivers,
    totalDurationMs,
    frames,
    events,
  };
}

/**
 * Calculates the leader's cumulative time at each lap
 */
function calculateLeaderTimes(lapTimings: LapTiming[]): Map<number, number> {
  const leaderTimes = new Map<number, number>();
  let cumulativeTime = 0;
  
  lapTimings.forEach((lapTiming) => {
    // Find the driver in P1 for this lap
    const leaderTiming = lapTiming.timings.find((t) => t.position === 1);
    
    if (leaderTiming) {
      cumulativeTime += leaderTiming.timeInMs;
      leaderTimes.set(lapTiming.lap, cumulativeTime);
    }
  });
  
  return leaderTimes;
}

/**
 * Creates a map of pitstops indexed by driver and lap
 */
function createPitStopMap(pitStops: PitStop[]): Map<string, Set<number>> {
  const map = new Map<string, Set<number>>();
  
  pitStops.forEach((pitStop) => {
    if (!map.has(pitStop.driverId)) {
      map.set(pitStop.driverId, new Set());
    }
    map.get(pitStop.driverId)!.add(pitStop.lap);
  });
  
  return map;
}

/**
 * Generates a single animation frame
 */
function generateFrame(
  timeMs: number,
  drivers: Driver[],
  processedLapData: ProcessedLapData[],
  pitStopMap: Map<string, Set<number>>,
  events: RaceEvent[],
  dnfs: Map<string, { lap: number; reason: string }>,
  fastestLapDriverId: string | null,
  leaderTimes: Map<number, number>,
  totalLaps: number
): AnimationFrame {
  const driverStates = drivers.map((driver) => {
    const driverData = processedLapData.find((d) => d.driverId === driver.driverId);
    
    if (!driverData || driverData.laps.length === 0) {
      return {
        driverId: driver.driverId,
        position: 0,
        progress: 0,
        lap: 0,
        isInPit: false,
        isDNF: false,
        hasFastestLap: false,
        gapToLeader: 0,
        lastLapTime: 0,
      };
    }
    
    // Get interpolated position
    const { lap, progress, position } = interpolatePosition(
      driverData,
      timeMs,
      totalLaps
    );
    
    // Check if driver is in pit
    const driverPitLaps = pitStopMap.get(driver.driverId);
    const isInPit = (driverPitLaps?.has(lap) && progress > 85 && progress < 100) || false;
    
    // Check if driver has DNF'd
    const dnfInfo = dnfs.get(driver.driverId);
    const isDNF = dnfInfo !== undefined && lap >= dnfInfo.lap;
    
    // Check if driver has fastest lap
    const hasFastestLap = driver.driverId === fastestLapDriverId;
    
    // Calculate gap to leader
    const leaderTime = leaderTimes.get(lap) || 0;
    const lapData = driverData.laps.find((l) => l.lap === lap);
    const driverTime = lapData?.cumulativeTimeInMs || 0;
    const gapToLeader = position === 1 ? 0 : Math.max(0, driverTime - leaderTime);
    
    // Get last lap time
    const lastLapTime = lapData?.timeInMs || 0;
    
    return {
      driverId: driver.driverId,
      position,
      progress,
      lap,
      isInPit,
      isDNF,
      hasFastestLap,
      gapToLeader,
      lastLapTime,
    };
  });
  
  // Sort by position
  driverStates.sort((a, b) => {
    if (a.position === 0) return 1;
    if (b.position === 0) return -1;
    return a.position - b.position;
  });
  
  // Get events that occurred at this time
  const frameEvents = events.filter(
    (event) => Math.abs(event.timeInMs - timeMs) < DEFAULT_FRAME_INTERVAL / 2
  );
  
  return {
    timeInMs: timeMs,
    drivers: driverStates,
    events: frameEvents,
  };
}

/**
 * Compresses timeline by reducing frame count while maintaining key events
 */
export function compressTimeline(
  timeline: RaceTimeline,
  targetFrameCount: number
): RaceTimeline {
  const { frames, events } = timeline;
  
  if (frames.length <= targetFrameCount) {
    return timeline;
  }
  
  const interval = Math.ceil(frames.length / targetFrameCount);
  const compressedFrames: AnimationFrame[] = [];
  
  // Always include first and last frames
  compressedFrames.push(frames[0]);
  
  // Include frames at regular intervals and frames with events
  const eventTimes = new Set(events.map((e) => e.timeInMs));
  
  for (let i = 1; i < frames.length - 1; i++) {
    const frame = frames[i];
    
    // Include if at interval or has event
    if (i % interval === 0 || eventTimes.has(frame.timeInMs)) {
      compressedFrames.push(frame);
    }
  }
  
  // Always include last frame
  compressedFrames.push(frames[frames.length - 1]);
  
  return {
    ...timeline,
    frames: compressedFrames,
  };
}

/**
 * Gets timeline slice for a specific time range
 */
export function getTimelineSlice(
  timeline: RaceTimeline,
  startTimeMs: number,
  endTimeMs: number
): AnimationFrame[] {
  return timeline.frames.filter(
    (frame) => frame.timeInMs >= startTimeMs && frame.timeInMs <= endTimeMs
  );
}

export default {
  generateRaceTimeline,
  compressTimeline,
  getTimelineSlice,
};
