/**
 * TypeScript interfaces for F1 Race Replay Simulator Backend
 * These types represent the data structures used throughout the application
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
  // Team color for visual representation
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

export interface Circuit {
  circuitId: string;
  circuitName: string;
  country: string;
  locality: string;
  // SVG path data for the track
  svgPath?: string;
  // Pitlane path for pit stop animations
  pitlanePath?: string;
  // Track length in meters
  trackLength: number;
}

// ============================================
// Lap & Timing Types
// ============================================

export interface LapData {
  driverId: string;
  lap: number;
  position: number;
  time: string; // Format: "1:23.456"
  timeInMs: number; // Converted to milliseconds for calculations
}

export interface LapTiming {
  lap: number;
  timings: LapData[];
}

export interface ProcessedLapData {
  driverId: string;
  laps: {
    lap: number;
    position: number;
    timeInMs: number;
    cumulativeTimeInMs: number;
    // Progress percentage at the end of this lap (0-100 per lap)
    progressPerLap: number;
    // Speed factor relative to average (for animation interpolation)
    speedFactor: number;
  }[];
}

// ============================================
// Pitstop Types
// ============================================

export interface PitStop {
  driverId: string;
  lap: number;
  stop: number;
  time: string; // Time of day
  duration: string; // Pit stop duration
  durationInMs: number;
}

// ============================================
// Race Event Types
// ============================================

export type RaceEventType = 'lap_complete' | 'pitstop' | 'overtake' | 'dnf' | 'fastest_lap';

export interface RaceEvent {
  type: RaceEventType;
  lap: number;
  timeInMs: number;
  driverId: string;
  // Additional data based on event type
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
// Animation Types
// ============================================

export interface AnimationFrame {
  timeInMs: number;
  drivers: {
    driverId: string;
    position: number; // Race position (1st, 2nd, etc.)
    progress: number; // 0-100 progress along track
    lap: number;
    isInPit: boolean;
    isDNF: boolean;
    hasFastestLap: boolean;
    gapToLeader: number; // Gap in milliseconds
    lastLapTime: number;
  }[];
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
// API Response Types
// ============================================

export interface JolpicaApiResponse<T> {
  MRData: {
    xmlns: string;
    series: string;
    url: string;
    limit: string;
    offset: string;
    total: string;
    RaceTable?: T;
    DriverTable?: T;
    ConstructorTable?: T;
    CircuitTable?: T;
    SeasonTable?: T;
    StatusTable?: T;
  };
}

export interface RaceTableData {
  season: string;
  round: string;
  Races: JolpicaRace[];
}

export interface JolpicaRace {
  season: string;
  round: string;
  url: string;
  raceName: string;
  Circuit: JolpicaCircuit;
  date: string;
  time?: string;
  // Session times
  FirstPractice?: { date: string; time: string };
  SecondPractice?: { date: string; time: string };
  ThirdPractice?: { date: string; time: string };
  Qualifying?: { date: string; time: string };
  Sprint?: { date: string; time: string };
  // Results data
  Results?: JolpicaResult[];
  Laps?: JolpicaLap[];
  PitStops?: JolpicaPitStop[];
  QualifyingResults?: any[];
  SprintResults?: any[];
}

export interface JolpicaCircuit {
  circuitId: string;
  url: string;
  circuitName: string;
  Location: {
    lat: string;
    long: string;
    locality: string;
    country: string;
  };
}

export interface JolpicaResult {
  number: string;
  position: string;
  positionText: string;
  points: string;
  Driver: JolpicaDriver;
  Constructor: JolpicaConstructor;
  grid: string;
  laps: string;
  status: string;
  Time?: {
    millis: string;
    time: string;
  };
  FastestLap?: {
    rank: string;
    lap: string;
    Time: {
      time: string;
    };
    AverageSpeed: {
      units: string;
      speed: string;
    };
  };
}

export interface JolpicaDriver {
  driverId: string;
  permanentNumber?: string;
  code?: string;
  url: string;
  givenName: string;
  familyName: string;
  dateOfBirth: string;
  nationality: string;
}

export interface JolpicaConstructor {
  constructorId: string;
  url: string;
  name: string;
  nationality: string;
}

export interface JolpicaLap {
  number: string;
  Timings: {
    driverId: string;
    position: string;
    time: string;
  }[];
}

export interface JolpicaPitStop {
  driverId: string;
  lap: string;
  stop: string;
  time: string;
  duration: string;
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
