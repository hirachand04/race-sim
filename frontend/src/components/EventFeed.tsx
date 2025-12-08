/**
 * EventFeed Component
 * Displays a live feed of race events
 * 
 * Features:
 * - Real-time event notifications
 * - Color-coded event types
 * - Event icons
 * - Auto-scrolling
 */

import React, { useEffect, useRef, useMemo } from 'react';
import { RaceEvent, Driver } from '../types';
import { 
  getEventIcon, 
  getEventColorClass, 
  getEventDescription 
} from '../utils/eventManager';

interface EventFeedProps {
  events: RaceEvent[];
  currentTimeMs: number;
  drivers: Driver[];
}

const EventFeed: React.FC<EventFeedProps> = ({ 
  events, 
  currentTimeMs, 
  drivers
}) => {
  const feedRef = useRef<HTMLDivElement>(null);
  
  // Create driver lookup map
  const driversMap = useMemo(() => {
    return new Map(
      drivers.map((d) => [d.driverId, { code: d.code, familyName: d.familyName }])
    );
  }, [drivers]);

  // Filter events that have occurred - show ALL events
  const displayedEvents = useMemo(() => {
    return events
      .filter((e) => e.timeInMs <= currentTimeMs)
      .reverse();
  }, [events, currentTimeMs]);

  // Auto-scroll to latest event
  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = 0;
    }
  }, [displayedEvents.length]);

  if (displayedEvents.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg p-4">
        <h3 className="text-white font-bold mb-2">Race Events</h3>
        <p className="text-gray-400 text-sm">No events yet...</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden h-full">
      {/* Header */}
      <div className="bg-gray-900 px-3 py-2 border-b border-gray-700 flex items-center justify-between">
        <h3 className="text-white font-bold text-sm">Race Events</h3>
        <span className="text-gray-400 text-xs">{displayedEvents.length} events</span>
      </div>
      
      {/* Event List */}
      <div 
        ref={feedRef}
        className="max-h-[420px] overflow-y-auto"
      >
        {displayedEvents.map((event, index) => (
          <EventRow 
            key={`${event.type}-${event.driverId}-${event.timeInMs}-${index}`}
            event={event}
            driversMap={driversMap}
            isNew={index === 0}
          />
        ))}
      </div>
    </div>
  );
};

interface EventRowProps {
  event: RaceEvent;
  driversMap: Map<string, { code: string; familyName: string }>;
  isNew: boolean;
}

const EventRow: React.FC<EventRowProps> = ({ event, driversMap, isNew }) => {
  const colorClass = getEventColorClass(event.type);
  const icon = getEventIcon(event.type);
  const description = getEventDescription(event, driversMap);

  return (
    <div 
      className={`flex items-center gap-3 px-4 py-2 border-b border-gray-700/50 last:border-b-0
        transition-all duration-500 ease-out
        ${isNew ? 'bg-gradient-to-r from-gray-700/80 to-transparent animate-fade-in' : 'hover:bg-gray-700/30'}`}
    >
      {/* Icon */}
      <span className={`text-lg ${isNew ? 'animate-bounce' : ''}`}>{icon}</span>
      
      {/* Lap Number */}
      <span className="text-gray-400 text-xs font-mono w-12 tabular-nums">
        Lap {event.lap}
      </span>
      
      {/* Description */}
      <span className={`text-sm flex-1 ${colorClass}`}>
        {description}
      </span>
    </div>
  );
};

export default EventFeed;
