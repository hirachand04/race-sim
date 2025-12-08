/**
 * TelemetryPanel Component
 * Displays comprehensive telemetry data for a race
 * 
 * Features:
 * - Fastest lap leaderboard with times and average speeds
 * - Grid vs finish position comparison
 * - Race statistics (finishers, retirements)
 * - Top gainers and losers
 */

import React, { useState, useMemo } from 'react';
import { RaceTelemetry, DriverTelemetry } from '../types';

interface TelemetryPanelProps {
  telemetry: RaceTelemetry | null;
  isLoading: boolean;
}

type TabType = 'fastest' | 'positions' | 'stats';

const TelemetryPanel: React.FC<TelemetryPanelProps> = ({ telemetry, isLoading }) => {
  const [activeTab, setActiveTab] = useState<TabType>('fastest');

  // Sort drivers by fastest lap rank
  const fastestLapRanking = useMemo(() => {
    if (!telemetry) return [];
    return telemetry.drivers
      .filter((d) => d.fastestLap)
      .sort((a, b) => (a.fastestLap?.rank || 999) - (b.fastestLap?.rank || 999));
  }, [telemetry]);

  // Sort drivers by positions gained
  const positionChanges = useMemo(() => {
    if (!telemetry) return [];
    return [...telemetry.drivers].sort((a, b) => b.positionsGained - a.positionsGained);
  }, [telemetry]);

  // Top gainers (gained 3+ positions)
  const topGainers = useMemo(() => {
    return positionChanges.filter((d) => d.positionsGained >= 3).slice(0, 5);
  }, [positionChanges]);

  // Top losers (lost 3+ positions)
  const topLosers = useMemo(() => {
    return positionChanges.filter((d) => d.positionsGained <= -3).slice(-5).reverse();
  }, [positionChanges]);

  if (isLoading) {
    return (
      <div className="bg-gray-800 rounded-lg p-4">
        <h3 className="text-white font-bold mb-4">Race Telemetry</h3>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-f1-red" />
        </div>
      </div>
    );
  }

  if (!telemetry) {
    return (
      <div className="bg-gray-800 rounded-lg p-4">
        <h3 className="text-white font-bold mb-4">Race Telemetry</h3>
        <p className="text-gray-400 text-sm">No telemetry data available</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden h-full">
      {/* Header */}
      <div className="bg-gray-900 px-3 py-2 border-b border-gray-700">
        <h3 className="text-white font-bold text-sm">Race Telemetry</h3>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-700">
        <TabButton
          active={activeTab === 'fastest'}
          onClick={() => setActiveTab('fastest')}
          label="Fastest Laps"
        />
        <TabButton
          active={activeTab === 'positions'}
          onClick={() => setActiveTab('positions')}
          label="Position Changes"
        />
        <TabButton
          active={activeTab === 'stats'}
          onClick={() => setActiveTab('stats')}
          label="Race Stats"
        />
      </div>

      {/* Tab Content */}
      <div className="p-3 max-h-[420px] overflow-y-auto">
        {activeTab === 'fastest' && (
          <FastestLapsTab drivers={fastestLapRanking} />
        )}
        {activeTab === 'positions' && (
          <PositionChangesTab
            allDrivers={positionChanges}
            topGainers={topGainers}
            topLosers={topLosers}
          />
        )}
        {activeTab === 'stats' && (
          <RaceStatsTab telemetry={telemetry} />
        )}
      </div>
    </div>
  );
};

// Tab Button Component
const TabButton: React.FC<{
  active: boolean;
  onClick: () => void;
  label: string;
}> = ({ active, onClick, label }) => (
  <button
    className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
      active
        ? 'bg-gray-700 text-white border-b-2 border-f1-red'
        : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
    }`}
    onClick={onClick}
  >
    {label}
  </button>
);

// Fastest Laps Tab
const FastestLapsTab: React.FC<{ drivers: DriverTelemetry[] }> = ({ drivers }) => {
  if (drivers.length === 0) {
    return <p className="text-gray-400 text-sm">No fastest lap data available</p>;
  }

  return (
    <div className="space-y-2">
      {drivers.map((driver, index) => (
        <div
          key={driver.driverId}
          className={`flex items-center gap-3 p-2 rounded ${
            index === 0 ? 'bg-purple-900/30 ring-1 ring-purple-500' : 'bg-gray-700/30'
          }`}
        >
          {/* Rank */}
          <div className="w-8 text-center">
            <span className={`font-bold ${index === 0 ? 'text-purple-400' : 'text-gray-400'}`}>
              {driver.fastestLap?.rank}
            </span>
          </div>

          {/* Driver Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-white font-bold text-sm">{driver.driverCode}</span>
              <span className="text-gray-300 text-xs truncate">{driver.driverName}</span>
            </div>
            <div className="text-gray-500 text-[10px] truncate">{driver.constructorName}</div>
          </div>

          {/* Lap Time */}
          <div className="text-right">
            <div className={`font-mono text-sm ${index === 0 ? 'text-purple-400' : 'text-white'}`}>
              {driver.fastestLap?.time}
            </div>
            <div className="text-gray-500 text-xs">
              Lap {driver.fastestLap?.lap}
            </div>
          </div>

          {/* Average Speed */}
          <div className="text-right w-20">
            <div className="text-yellow-400 text-sm font-mono">
              {driver.fastestLap?.averageSpeed.toFixed(1)}
            </div>
            <div className="text-gray-500 text-xs">
              {driver.fastestLap?.speedUnit}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Position Changes Tab
const PositionChangesTab: React.FC<{
  allDrivers: DriverTelemetry[];
  topGainers: DriverTelemetry[];
  topLosers: DriverTelemetry[];
}> = ({ allDrivers, topGainers, topLosers }) => {
  return (
    <div className="space-y-4">
      {/* Top Gainers */}
      {topGainers.length > 0 && (
        <div>
          <h4 className="text-green-400 font-semibold text-sm mb-2 flex items-center gap-2">
            <span>↑</span> Top Gainers
          </h4>
          <div className="space-y-1">
            {topGainers.map((driver) => (
              <PositionRow key={driver.driverId} driver={driver} />
            ))}
          </div>
        </div>
      )}

      {/* Top Losers */}
      {topLosers.length > 0 && (
        <div>
          <h4 className="text-red-400 font-semibold text-sm mb-2 flex items-center gap-2">
            <span>↓</span> Lost Positions
          </h4>
          <div className="space-y-1">
            {topLosers.map((driver) => (
              <PositionRow key={driver.driverId} driver={driver} />
            ))}
          </div>
        </div>
      )}

      {/* All Drivers Grid vs Finish */}
      <div>
        <h4 className="text-gray-300 font-semibold text-sm mb-2">All Drivers (Grid → Finish)</h4>
        <div className="space-y-1">
          {allDrivers.map((driver) => (
            <PositionRow key={driver.driverId} driver={driver} compact />
          ))}
        </div>
      </div>
    </div>
  );
};

// Position Change Row
const PositionRow: React.FC<{ driver: DriverTelemetry; compact?: boolean }> = ({
  driver,
  compact = false,
}) => {
  const gained = driver.positionsGained;
  const gainedColor =
    gained > 0 ? 'text-green-400' : gained < 0 ? 'text-red-400' : 'text-gray-400';
  const gainedSymbol = gained > 0 ? '↑' : gained < 0 ? '↓' : '–';

  return (
    <div
      className={`flex items-center gap-2 ${
        compact ? 'py-1' : 'p-2 bg-gray-700/30 rounded'
      }`}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-white font-bold text-sm">{driver.driverCode}</span>
          {!compact && (
            <span className="text-gray-300 text-xs truncate">{driver.driverName}</span>
          )}
        </div>
        {compact && (
          <div className="text-gray-500 text-[10px] truncate">{driver.driverName}</div>
        )}
      </div>
      <span className="text-gray-400 text-xs">P{driver.grid}</span>
      <span className="text-gray-500">→</span>
      <span className="text-white text-xs">P{driver.position}</span>
      <span className={`${gainedColor} text-sm font-bold ml-auto`}>
        {gainedSymbol} {Math.abs(gained)}
      </span>
    </div>
  );
};

// Race Stats Tab
const RaceStatsTab: React.FC<{ telemetry: RaceTelemetry }> = ({ telemetry }) => {
  // Find drivers with most laps led (approximate from fastest lap holder)
  const fastestLapDriver = telemetry.fastestLapHolder;

  // Find longest stint without pit (approximate)
  const driversWithStatus = telemetry.drivers.filter((d) => !d.isFinished);

  return (
    <div className="space-y-4">
      {/* Race Summary */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Total Laps" value={telemetry.totalLaps.toString()} />
        <StatCard
          label="Finishers"
          value={telemetry.finishers.toString()}
          subtext={`of ${telemetry.drivers.length}`}
        />
        <StatCard
          label="Retirements"
          value={telemetry.retirements.toString()}
          valueColor="text-red-400"
        />
      </div>

      {/* Fastest Lap */}
      {fastestLapDriver && (
        <div className="bg-purple-900/30 p-3 rounded-lg border border-purple-700">
          <div className="text-purple-400 text-xs font-semibold mb-1">Fastest Lap</div>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-white font-bold">{fastestLapDriver.driverCode}</span>
                <span className="text-gray-300 text-sm">{fastestLapDriver.driverName}</span>
              </div>
              <div className="text-gray-500 text-xs">{fastestLapDriver.constructorName}</div>
            </div>
            <div className="text-right">
              <div className="text-purple-300 font-mono">
                {fastestLapDriver.fastestLap?.time}
              </div>
              <div className="text-yellow-400 text-xs">
                {fastestLapDriver.fastestLap?.averageSpeed.toFixed(1)} kph avg
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Retirements */}
      {driversWithStatus.length > 0 && (
        <div>
          <h4 className="text-gray-300 font-semibold text-sm mb-2">Did Not Finish</h4>
          <div className="space-y-1">
            {driversWithStatus.map((driver) => (
              <div
                key={driver.driverId}
                className="flex items-center justify-between py-1 text-sm"
              >
                <div>
                  <span className="text-white font-bold">{driver.driverCode}</span>
                  <span className="text-gray-300 text-xs ml-2">{driver.driverName}</span>
                  <div className="text-gray-500 text-[10px]">{driver.constructorName}</div>
                </div>
                <span className="text-red-400 text-xs">{driver.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Points Scored */}
      <div>
        <h4 className="text-gray-300 font-semibold text-sm mb-2">Points Scored</h4>
        <div className="space-y-1">
          {telemetry.drivers
            .filter((d) => d.points > 0)
            .map((driver) => (
              <div
                key={driver.driverId}
                className="flex items-center justify-between py-1 text-sm"
              >
                <div>
                  <span className="text-white font-bold">P{driver.position}</span>
                  <span className="text-white ml-2">{driver.driverCode}</span>
                  <span className="text-gray-400 text-xs ml-2">{driver.driverName}</span>
                </div>
                <span className="text-yellow-400 font-bold">+{driver.points} pts</span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

// Stat Card Component
const StatCard: React.FC<{
  label: string;
  value: string;
  subtext?: string;
  valueColor?: string;
}> = ({ label, value, subtext, valueColor = 'text-white' }) => (
  <div className="bg-gray-700/50 p-3 rounded-lg text-center">
    <div className="text-gray-400 text-xs mb-1">{label}</div>
    <div className={`text-2xl font-bold ${valueColor}`}>{value}</div>
    {subtext && <div className="text-gray-500 text-xs">{subtext}</div>}
  </div>
);

export default TelemetryPanel;
