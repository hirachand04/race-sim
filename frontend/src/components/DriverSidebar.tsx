/**
 * DriverSidebar Component
 * Displays real-time driver standings during race replay
 * 
 * Features:
 * - Driver position list
 * - Team colors
 * - Last lap time
 * - Gap to leader
 * - Pitstop indicator
 * - DNF indicator
 * - Fastest lap highlight
 * - Telemetry data (grid position, positions gained, avg speed)
 */

import React, { useMemo } from 'react';
import { Driver, DriverState, DriverTelemetry } from '../types';
import { formatLapTime, formatGap, sortByPosition } from '../utils/eventManager';

interface DriverSidebarProps {
  drivers: Driver[];
  driverStates: DriverState[];
  telemetryData?: Map<string, DriverTelemetry>;
}

const DriverSidebar: React.FC<DriverSidebarProps> = ({ drivers, driverStates, telemetryData }) => {
  // Create a map for quick driver lookup
  const driverMap = useMemo(() => {
    return new Map(drivers.map((d) => [d.driverId, d]));
  }, [drivers]);

  // Sort drivers by position
  const sortedStates = useMemo(() => {
    return sortByPosition(driverStates);
  }, [driverStates]);

  if (sortedStates.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg p-4">
        <h3 className="text-white font-bold mb-4">Standings</h3>
        <p className="text-gray-400 text-sm">No driver data available</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden h-full">
      {/* Header */}
      <div className="bg-gray-900 px-3 py-2 border-b border-gray-700 flex items-center justify-between">
        <h3 className="text-white font-bold text-sm">Live Standings</h3>
        <span className="text-gray-400 text-xs">{sortedStates.length} drivers</span>
      </div>
      
      {/* Driver List - constrained height with scroll */}
      <div className="divide-y divide-gray-700 max-h-[450px] overflow-y-auto">
        {sortedStates.map((state, index) => {
          const driver = driverMap.get(state.driverId);
          if (!driver) return null;
          
          const telemetry = telemetryData?.get(state.driverId);
          
          return (
            <DriverRow
              key={state.driverId}
              driver={driver}
              state={state}
              displayPosition={index + 1}
              telemetry={telemetry}
            />
          );
        })}
      </div>
    </div>
  );
};

interface DriverRowProps {
  driver: Driver;
  state: DriverState;
  displayPosition: number;
  telemetry?: DriverTelemetry;
}

const DriverRow: React.FC<DriverRowProps> = ({ driver, state, displayPosition, telemetry }) => {
  const rowClasses = [
    'flex items-center px-3 py-1.5 transition-all duration-300 ease-out cursor-pointer',
    state.isDNF ? 'opacity-50 bg-gray-900' : 'hover:bg-gray-700/80 hover:pl-4',
    state.hasFastestLap ? 'bg-purple-900/30 ring-1 ring-purple-500/50' : '',
    state.isInPit ? 'bg-yellow-900/20' : '',
  ].join(' ');

  // Calculate positions gained/lost from telemetry
  const positionsGained = telemetry?.positionsGained;
  const showPositionChange = positionsGained !== undefined && positionsGained !== 0;

  return (
    <div className={rowClasses}>
      {/* Position */}
      <div className="w-6 text-center">
        <span className={`font-bold text-sm transition-colors duration-300 ${
          displayPosition === 1 ? 'text-yellow-400' :
          displayPosition === 2 ? 'text-gray-300' :
          displayPosition === 3 ? 'text-amber-600' : 'text-white'
        }`}>
          {state.isDNF ? '—' : displayPosition}
        </span>
      </div>
      
      {/* Team Color Bar */}
      <div 
        className="w-1 h-8 rounded-full mx-1.5"
        style={{ backgroundColor: driver.color }}
      />
      
      {/* Driver Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1">
          <span className="text-white font-bold text-sm">{driver.code}</span>
          <span className="text-gray-400 text-xs truncate">
            {driver.givenName} {driver.familyName}
          </span>
          {/* Compact Status Badges */}
          {state.isInPit && (
            <span className="px-1 py-0.5 bg-yellow-600 text-yellow-100 text-[10px] rounded font-bold">P</span>
          )}
          {state.hasFastestLap && (
            <span className="px-1 py-0.5 bg-purple-600 text-purple-100 text-[10px] rounded font-bold">F</span>
          )}
          {state.isDNF && (
            <span className="px-1 py-0.5 bg-red-600 text-red-100 text-[10px] rounded font-bold">X</span>
          )}
          {showPositionChange && !state.isDNF && (
            <span className={`text-[10px] font-bold ${
              positionsGained! > 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              {positionsGained! > 0 ? '↑' : '↓'}{Math.abs(positionsGained!)}
            </span>
          )}
        </div>
        <div className="text-[10px] text-gray-500 truncate">{driver.constructor.name}</div>
      </div>
      
      {/* Timing Info - Compact */}
      <div className="text-right">
        {!state.isDNF ? (
          <>
            <div className="text-white text-xs font-mono">
              {formatGap(state.gapToLeader, state.position)}
            </div>
            <div className="text-gray-500 text-[10px] font-mono">
              {state.lastLapTime > 0 ? formatLapTime(state.lastLapTime) : '--:--.---'}
            </div>
          </>
        ) : (
          <div className="text-red-400 text-xs">{telemetry?.status || 'OUT'}</div>
        )}
      </div>
    </div>
  );
};

export default DriverSidebar;
