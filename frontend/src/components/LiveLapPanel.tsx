/**
 * LiveLapPanel Component
 * Compact race info header with key statistics
 */

import React, { useMemo } from 'react';
import { Driver, DriverState } from '../types';

interface LiveLapPanelProps {
  drivers: Driver[];
  driverStates: DriverState[];
  currentLap: number;
  totalLaps: number;
  raceName?: string;
}

const LiveLapPanel: React.FC<LiveLapPanelProps> = ({
  drivers,
  driverStates,
  currentLap,
  totalLaps,
  raceName = 'Grand Prix',
}) => {
  const driverMap = useMemo(() => new Map(drivers.map((d) => [d.driverId, d])), [drivers]);
  const sortedStates = useMemo(() => [...driverStates].sort((a, b) => a.position - b.position), [driverStates]);
  
  const raceProgress = totalLaps > 0 ? (currentLap / totalLaps) * 100 : 0;
  const fastestLapHolder = sortedStates.find((s) => s.hasFastestLap);
  const activeDrivers = sortedStates.filter((s) => !s.isDNF).length;
  const retiredDrivers = sortedStates.filter((s) => s.isDNF).length;
  const podiumDrivers = sortedStates.slice(0, 3);
  const driversInPit = sortedStates.filter((s) => s.isInPit);

  const formatTime = (ms: number): string => {
    if (ms <= 0) return '--:--.---';
    const mins = Math.floor(ms / 60000);
    const secs = ((ms % 60000) / 1000).toFixed(3);
    return `${mins}:${secs.padStart(6, '0')}`;
  };

  return (
    <div className="bg-gray-900 rounded-lg overflow-hidden shadow-xl">
      {/* Compact Race Header */}
      <div className="bg-gradient-to-r from-f1-red via-red-700 to-red-800 px-3 sm:px-4 py-2 sm:py-3 relative overflow-hidden">
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(255,255,255,0.1)_10px,rgba(255,255,255,0.1)_20px)]" />
        </div>
        
        <div className="relative flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <div className="min-w-0">
              <h2 className="text-white font-bold text-sm sm:text-lg drop-shadow-lg truncate">{raceName}</h2>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 bg-green-500 text-white text-[10px] sm:text-xs font-bold rounded-full animate-pulse">
                  <span className="w-1 sm:w-1.5 h-1 sm:h-1.5 bg-white rounded-full" />
                  LIVE
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-6 flex-shrink-0">
            {/* Lap Counter */}
            <div className="text-center bg-black/20 rounded-lg px-2 sm:px-4 py-1 sm:py-2">
              <div className="text-white text-lg sm:text-2xl font-bold font-mono tabular-nums">
                {currentLap}<span className="text-red-300 text-[10px] sm:text-sm">/{totalLaps}</span>
              </div>
              <div className="text-red-200 text-[10px] sm:text-xs uppercase tracking-wider">Lap</div>
            </div>
            {/* Active/Retired */}
            <div className="text-center hidden sm:block">
              <div className="text-white text-lg font-bold tabular-nums">{activeDrivers}</div>
              <div className="text-red-200 text-xs uppercase tracking-wider">Active</div>
            </div>
            <div className="text-center hidden sm:block">
              <div className="text-red-300 text-lg font-bold tabular-nums">{retiredDrivers}</div>
              <div className="text-red-200 text-xs uppercase tracking-wider">Out</div>
            </div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="relative mt-3">
          <div className="h-2 bg-black/30 rounded-full overflow-hidden backdrop-blur">
            <div
              className="h-full bg-gradient-to-r from-green-400 via-yellow-400 to-white transition-all duration-500 ease-out"
              style={{ width: `${Math.min(raceProgress, 100)}%` }}
            />
          </div>
          {/* Progress markers */}
          <div className="absolute inset-x-0 top-0 h-2 flex justify-between px-1">
            {[25, 50, 75].map((mark) => (
              <div 
                key={mark}
                className="w-px h-full bg-white/30"
                style={{ marginLeft: `${mark}%` }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-4 gap-px bg-gray-700">
        {/* Top 3 Podium */}
        {podiumDrivers.map((state, idx) => {
          const driver = driverMap.get(state.driverId);
          if (!driver) return null;
          const medals = ['🥇', '🥈', '🥉'];
          const bgColors = ['bg-gradient-to-b from-yellow-900/30 to-gray-800', 'bg-gradient-to-b from-gray-600/30 to-gray-800', 'bg-gradient-to-b from-amber-900/30 to-gray-800'];
          return (
            <div 
              key={state.driverId} 
              className={`${bgColors[idx]} p-2 sm:p-3 text-center transition-all duration-300 hover:bg-gray-700`}
            >
              <div className="text-sm sm:text-lg mb-0.5 sm:mb-1">{medals[idx]}</div>
              <div 
                className="text-white font-bold text-xs sm:text-sm"
                style={{ textShadow: `0 0 10px ${driver.color}` }}
              >
                {driver.code}
              </div>
              <div className="text-gray-300 text-[10px] sm:text-xs truncate hidden sm:block">
                {driver.givenName} {driver.familyName}
              </div>
              <div 
                className="text-[8px] sm:text-[10px] truncate mt-0.5 sm:mt-1 px-1 sm:px-2 py-0.5 rounded-full inline-block hidden sm:inline-block"
                style={{ backgroundColor: `${driver.color}30`, color: driver.color }}
              >
                {driver.constructor.name}
              </div>
            </div>
          );
        })}
        
        {/* Fastest Lap / Pit Info */}
        <div className="bg-gray-800 p-2">
          <div className="flex items-center justify-between gap-2">
            <div>
              <div className="text-purple-400 text-xs flex items-center gap-1">
                <span>⚡</span> Fastest
              </div>
              {fastestLapHolder ? (
                <div className="text-white font-bold text-sm">
                  {driverMap.get(fastestLapHolder.driverId)?.code} 
                  <span className="text-purple-300 font-mono text-xs ml-1">
                    {formatTime(fastestLapHolder.lastLapTime)}
                  </span>
                </div>
              ) : (
                <div className="text-gray-500 text-sm">--</div>
              )}
            </div>
            {driversInPit.length > 0 && (
              <div className="text-right">
                <div className="text-yellow-400 text-xs">🔧 PIT</div>
                <div className="flex gap-1 justify-end">
                  {driversInPit.slice(0, 2).map((s) => (
                    <span key={s.driverId} className="text-yellow-300 text-xs font-bold">
                      {driverMap.get(s.driverId)?.code}
                    </span>
                  ))}
                  {driversInPit.length > 2 && (
                    <span className="text-yellow-300 text-xs">+{driversInPit.length - 2}</span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveLapPanel;

