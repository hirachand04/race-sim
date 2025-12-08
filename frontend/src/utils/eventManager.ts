/**
 * Event Manager Utility
 * Client-side event handling for race replay
 */

import { RaceEvent, RaceEventType, DriverState } from '../types';

/**
 * Formats a lap time from milliseconds to display format
 */
export function formatLapTime(ms: number): string {
  if (ms <= 0) return '--:--.---';
  
  const totalSeconds = ms / 1000;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = (totalSeconds % 60).toFixed(3);
  
  if (minutes > 0) {
    return `${minutes}:${seconds.padStart(6, '0')}`;
  }
  return seconds;
}

/**
 * Formats a gap to the leader
 */
export function formatGap(gapMs: number, position: number): string {
  if (position === 1) return 'Leader';
  if (gapMs <= 0) return '+0.000';
  
  const totalSeconds = gapMs / 1000;
  
  if (totalSeconds < 60) {
    return `+${totalSeconds.toFixed(3)}`;
  }
  
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = (totalSeconds % 60).toFixed(3);
  return `+${minutes}:${seconds.padStart(6, '0')}`;
}

/**
 * Gets events that occurred within a time window
 */
export function getEventsInWindow(
  events: RaceEvent[],
  currentTimeMs: number,
  windowMs: number = 5000
): RaceEvent[] {
  return events.filter(
    (event) => 
      event.timeInMs >= currentTimeMs - windowMs && 
      event.timeInMs <= currentTimeMs
  );
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
 * Gets the most recent event for a driver
 */
export function getLatestDriverEvent(
  events: RaceEvent[],
  driverId: string,
  currentTimeMs: number
): RaceEvent | null {
  const driverEvents = events
    .filter((e) => e.driverId === driverId && e.timeInMs <= currentTimeMs)
    .sort((a, b) => b.timeInMs - a.timeInMs);
  
  return driverEvents[0] || null;
}

/**
 * Generates an event description for display
 */
export function getEventDescription(
  event: RaceEvent,
  driversMap: Map<string, { code: string; familyName: string }>
): string {
  const driver = driversMap.get(event.driverId);
  const driverName = driver?.code || event.driverId.substring(0, 3).toUpperCase();
  
  switch (event.type) {
    case 'lap_complete':
      return `${driverName} completed lap ${event.lap}`;
    
    case 'pitstop':
      return `${driverName} pits - ${((event.data.pitDuration || 0) / 1000).toFixed(1)}s stop`;
    
    case 'overtake': {
      const overtakenDriver = driversMap.get(event.data.overtakenDriverId || '');
      const overtakenName = overtakenDriver?.code || 'driver';
      return `${driverName} overtakes ${overtakenName} for P${event.data.position}`;
    }
    
    case 'dnf':
      return `${driverName} OUT - ${event.data.dnfReason || 'Retired'}`;
    
    case 'fastest_lap':
      return `${driverName} sets fastest lap - ${formatLapTime(event.data.lapTime || 0)}`;
    
    default:
      return `${driverName} - ${event.type}`;
  }
}

/**
 * Sorts driver states by position
 */
export function sortByPosition(drivers: DriverState[]): DriverState[] {
  return [...drivers].sort((a, b) => {
    // DNF drivers go to the bottom
    if (a.isDNF && !b.isDNF) return 1;
    if (!a.isDNF && b.isDNF) return -1;
    
    // Then sort by position
    if (a.position === 0) return 1;
    if (b.position === 0) return -1;
    return a.position - b.position;
  });
}

/**
 * Gets the event icon/emoji for display
 */
export function getEventIcon(type: RaceEventType): string {
  switch (type) {
    case 'pitstop': return '🔧';
    case 'overtake': return '⬆️';
    case 'dnf': return '❌';
    case 'fastest_lap': return '🟣';
    case 'lap_complete': return '🏁';
    default: return '📌';
  }
}

/**
 * Gets the event color class for styling
 */
export function getEventColorClass(type: RaceEventType): string {
  switch (type) {
    case 'pitstop': return 'text-yellow-400';
    case 'overtake': return 'text-green-400';
    case 'dnf': return 'text-red-400';
    case 'fastest_lap': return 'text-purple-400';
    case 'lap_complete': return 'text-blue-400';
    default: return 'text-gray-400';
  }
}

export default {
  formatLapTime,
  formatGap,
  getEventsInWindow,
  filterEventsByType,
  getLatestDriverEvent,
  getEventDescription,
  sortByPosition,
  getEventIcon,
  getEventColorClass,
};
