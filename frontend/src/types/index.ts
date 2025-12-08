/**
 * TypeScript interfaces for F1 Race Replay Simulator Frontend
 */

// ============================================
// Driver & Team Types
// ============================================

export interface Driver {
  driverId: string;
  permanentNumber: string;
  code: string;
  givenName: string;
  familyName: string;
  nationality: string;
  constructor: Constructor;
  color: string;
}

export interface Constructor {
  constructorId: string;
  name: string;
  nationality: string;
}

// ============================================
// Race & Circuit Types
// ============================================

export interface RaceMetadata {
  season: string;
  round: string;
  raceName: string;
  circuitId: string;
  circuitName: string;
  country: string;
  locality: string;
  date: string;
  time?: string;
  totalLaps: number;
}

export interface Race {
  season: string;
  round: string;
  raceName: string;
  Circuit: {
    circuitId: string;
    circuitName: string;
    Location: {
      locality: string;
      country: string;
    };
  };
  date: string;
}

export interface Circuit {
  circuitId: string;
  name: string;
  svgPath: string;
  pitlanePath?: string;
  viewBox: string;
  startFinishPosition: number; // Percentage along path for start/finish line
}

// ============================================
// Animation Types
// ============================================

export interface DriverState {
  driverId: string;
  position: number;
  progress: number; // 0-100 within current lap
  lap: number;
  isInPit: boolean;
  isDNF: boolean;
  hasFastestLap: boolean;
  gapToLeader: number;
  lastLapTime: number;
}

export interface AnimationFrame {
  timeInMs: number;
  drivers: DriverState[];
  events: RaceEvent[];
}

export interface RaceTimeline {
  metadata: RaceMetadata;
  drivers: Driver[];
  totalDurationMs: number;
  frames: AnimationFrame[];
  events: RaceEvent[];
}

// ============================================
// Event Types
// ============================================

export type RaceEventType = 'lap_complete' | 'pitstop' | 'overtake' | 'dnf' | 'fastest_lap';

export interface RaceEvent {
  type: RaceEventType;
  lap: number;
  timeInMs: number;
  driverId: string;
  data: {
    position?: number;
    previousPosition?: number;
    overtakenDriverId?: string;
    lapTime?: number;
    pitDuration?: number;
    dnfReason?: string;
  };
}

// ============================================
// Playback Types
// ============================================

export interface PlaybackState {
  isPlaying: boolean;
  currentTimeMs: number;
  speed: number; // 1, 2, 4
  currentFrameIndex: number;
}

// ============================================
// API Response Types
// ============================================

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

export interface SeasonsResponse {
  seasons: string[];
}

export interface RacesResponse {
  races: Race[];
}

export interface TimelineResponse {
  timeline: RaceTimeline;
}

// ============================================
// Telemetry Types
// ============================================

export interface FastestLapData {
  rank: number;
  lap: number;
  time: string;
  timeInMs: number;
  averageSpeed: number;
  speedUnit: string;
}

export interface DriverTelemetry {
  driverId: string;
  driverCode: string;
  driverName: string;
  constructorId: string;
  constructorName: string;
  // Race result data
  position: number;
  positionText: string;
  points: number;
  // Grid and positions gained/lost
  grid: number;
  positionsGained: number;
  // Laps and status
  lapsCompleted: number;
  status: string;
  isFinished: boolean;
  isClassified: boolean;
  // Race time
  raceTimeMs?: number;
  raceTimeFormatted?: string;
  gapToWinner?: string;
  // Fastest lap data (if any)
  fastestLap?: FastestLapData;
}

export interface RaceTelemetry {
  season: string;
  round: string;
  raceName: string;
  // All drivers telemetry
  drivers: DriverTelemetry[];
  // Race stats
  fastestLapHolder?: DriverTelemetry;
  totalLaps: number;
  finishers: number;
  retirements: number;
}
