/**
 * RaceCharts Component
 * Displays race data in various graphical formats
 * 
 * Features:
 * - Position Bump Chart: Shows position changes throughout the race
 * - Lap Times Chart: Line chart of lap times per driver
 * - Pit Stop Timeline: Gantt-style chart of pit stops
 * - Race Pace Analysis: Bar chart comparing average pace
 */

import React, { useState, useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  ReferenceLine,
  ComposedChart,
  Scatter,
} from 'recharts';
import { RaceTimeline, Driver } from '../types';

interface RaceChartsProps {
  timeline: RaceTimeline | null;
  isLoading: boolean;
}

type ChartTabType = 'positions' | 'laptimes' | 'pitstops' | 'pace';

const RaceCharts: React.FC<RaceChartsProps> = ({ timeline, isLoading }) => {
  const [activeTab, setActiveTab] = useState<ChartTabType>('positions');

  // Process lap data for position chart
  const positionData = useMemo(() => {
    if (!timeline || timeline.events.length === 0) return [];

    // Group lap_complete events by lap
    const lapEvents = timeline.events.filter((e) => e.type === 'lap_complete');
    const lapMap = new Map<number, Map<string, number>>();

    lapEvents.forEach((event) => {
      if (!lapMap.has(event.lap)) {
        lapMap.set(event.lap, new Map());
      }
      lapMap.get(event.lap)!.set(event.driverId, event.data.position || 0);
    });

    // Convert to chart data format
    const chartData: any[] = [];
    const sortedLaps = Array.from(lapMap.keys()).sort((a, b) => a - b);

    sortedLaps.forEach((lap) => {
      const lapData: any = { lap };
      const positions = lapMap.get(lap)!;
      positions.forEach((position, driverId) => {
        const driver = timeline.drivers.find((d) => d.driverId === driverId);
        if (driver) {
          lapData[driver.code] = position;
        }
      });
      chartData.push(lapData);
    });

    return chartData;
  }, [timeline]);

  // Process lap time data
  const lapTimeData = useMemo(() => {
    if (!timeline || timeline.events.length === 0) return [];

    const lapEvents = timeline.events.filter(
      (e) => e.type === 'lap_complete' && e.data.lapTime && e.data.lapTime > 0
    );

    const lapMap = new Map<number, Map<string, number>>();

    lapEvents.forEach((event) => {
      if (!lapMap.has(event.lap)) {
        lapMap.set(event.lap, new Map());
      }
      // Convert to seconds for better readability
      const lapTimeSeconds = (event.data.lapTime || 0) / 1000;
      lapMap.get(event.lap)!.set(event.driverId, lapTimeSeconds);
    });

    const chartData: any[] = [];
    const sortedLaps = Array.from(lapMap.keys()).sort((a, b) => a - b);

    sortedLaps.forEach((lap) => {
      const lapData: any = { lap };
      const times = lapMap.get(lap)!;
      times.forEach((time, driverId) => {
        const driver = timeline.drivers.find((d) => d.driverId === driverId);
        if (driver && time > 60 && time < 200) {
          // Filter out outliers
          lapData[driver.code] = parseFloat(time.toFixed(3));
        }
      });
      chartData.push(lapData);
    });

    return chartData;
  }, [timeline]);

  // Process pit stop data for Gantt chart
  const pitStopData = useMemo(() => {
    if (!timeline || timeline.events.length === 0) return [];

    const pitEvents = timeline.events.filter((e) => e.type === 'pitstop');
    const driverPits: Map<string, { lap: number; duration: number; stop: number }[]> = new Map();

    pitEvents.forEach((event) => {
      if (!driverPits.has(event.driverId)) {
        driverPits.set(event.driverId, []);
      }
      driverPits.get(event.driverId)!.push({
        lap: event.lap,
        duration: event.data.pitDuration || 0,
        stop: driverPits.get(event.driverId)!.length + 1,
      });
    });

    // Convert to chart format
    const chartData: any[] = [];
    driverPits.forEach((pits, driverId) => {
      const driver = timeline.drivers.find((d) => d.driverId === driverId);
      if (driver) {
        pits.forEach((pit) => {
          chartData.push({
            driver: driver.code,
            driverName: `${driver.givenName} ${driver.familyName}`,
            lap: pit.lap,
            duration: pit.duration / 1000, // Convert to seconds
            stop: pit.stop,
            color: driver.color,
          });
        });
      }
    });

    return chartData.sort((a, b) => a.lap - b.lap);
  }, [timeline]);

  // Process race pace data (average lap time excluding outliers)
  const paceData = useMemo(() => {
    if (!timeline || timeline.events.length === 0) return [];

    const lapEvents = timeline.events.filter(
      (e) => e.type === 'lap_complete' && e.data.lapTime && e.data.lapTime > 0
    );

    const driverTimes: Map<string, number[]> = new Map();

    lapEvents.forEach((event) => {
      if (!driverTimes.has(event.driverId)) {
        driverTimes.set(event.driverId, []);
      }
      const lapTimeSeconds = (event.data.lapTime || 0) / 1000;
      // Filter out pit laps and outliers
      if (lapTimeSeconds > 60 && lapTimeSeconds < 150) {
        driverTimes.get(event.driverId)!.push(lapTimeSeconds);
      }
    });

    const chartData: any[] = [];
    driverTimes.forEach((times, driverId) => {
      const driver = timeline.drivers.find((d) => d.driverId === driverId);
      if (driver && times.length > 0) {
        // Calculate average, removing top and bottom 10%
        const sorted = [...times].sort((a, b) => a - b);
        const trimCount = Math.floor(sorted.length * 0.1);
        const trimmed = sorted.slice(trimCount, sorted.length - trimCount);
        const avg = trimmed.length > 0 
          ? trimmed.reduce((a, b) => a + b, 0) / trimmed.length 
          : sorted.reduce((a, b) => a + b, 0) / sorted.length;
        
        const fastest = Math.min(...times);
        const slowest = Math.max(...times);

        chartData.push({
          driver: driver.code,
          driverName: `${driver.givenName} ${driver.familyName}`,
          avgPace: parseFloat(avg.toFixed(3)),
          fastest: parseFloat(fastest.toFixed(3)),
          slowest: parseFloat(slowest.toFixed(3)),
          laps: times.length,
          color: driver.color,
        });
      }
    });

    return chartData.sort((a, b) => a.avgPace - b.avgPace);
  }, [timeline]);

  // Get driver colors for charts
  const driverColors = useMemo(() => {
    if (!timeline) return {};
    const colors: Record<string, string> = {};
    timeline.drivers.forEach((driver) => {
      colors[driver.code] = driver.color;
    });
    return colors;
  }, [timeline]);

  if (isLoading) {
    return (
      <div className="bg-gray-800 rounded-lg p-4">
        <h3 className="text-white font-bold mb-4">Race Analysis Charts</h3>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-f1-red" />
        </div>
      </div>
    );
  }

  if (!timeline) {
    return (
      <div className="bg-gray-800 rounded-lg p-4">
        <h3 className="text-white font-bold mb-4">Race Analysis Charts</h3>
        <p className="text-gray-400 text-sm">Select a race to view analysis charts</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden h-full flex flex-col">
      {/* Header */}
      <div className="bg-gray-900 px-3 py-2 border-b border-gray-700">
        <h3 className="text-white font-bold text-sm">Race Analysis Charts</h3>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-700 overflow-x-auto">
        <ChartTabButton
          active={activeTab === 'positions'}
          onClick={() => setActiveTab('positions')}
          label="📈 Positions"
        />
        <ChartTabButton
          active={activeTab === 'laptimes'}
          onClick={() => setActiveTab('laptimes')}
          label="⏱️ Lap Times"
        />
        <ChartTabButton
          active={activeTab === 'pitstops'}
          onClick={() => setActiveTab('pitstops')}
          label="🔧 Pit Stops"
        />
        <ChartTabButton
          active={activeTab === 'pace'}
          onClick={() => setActiveTab('pace')}
          label="🏎️ Race Pace"
        />
      </div>

      {/* Chart Content */}
      <div className="flex-1 p-4 min-h-[400px]">
        {activeTab === 'positions' && (
          <PositionChart data={positionData} drivers={timeline.drivers} colors={driverColors} />
        )}
        {activeTab === 'laptimes' && (
          <LapTimesChart data={lapTimeData} drivers={timeline.drivers} colors={driverColors} />
        )}
        {activeTab === 'pitstops' && (
          <PitStopChart data={pitStopData} totalLaps={timeline.metadata.totalLaps} />
        )}
        {activeTab === 'pace' && <PaceChart data={paceData} />}
      </div>
    </div>
  );
};

// Tab Button Component
const ChartTabButton: React.FC<{
  active: boolean;
  onClick: () => void;
  label: string;
}> = ({ active, onClick, label }) => (
  <button
    className={`px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
      active
        ? 'bg-gray-700 text-white border-b-2 border-f1-red'
        : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
    }`}
    onClick={onClick}
  >
    {label}
  </button>
);

// Position Bump Chart
const PositionChart: React.FC<{
  data: any[];
  drivers: Driver[];
  colors: Record<string, string>;
}> = ({ data, drivers, colors }) => {
  // Get all driver codes from data
  const driverCodes = Object.keys(data[0] || {}).filter((key) => key !== 'lap');
  
  // Default to top 10 drivers for cleaner view
  const [selectedDrivers, setSelectedDrivers] = useState<Set<string>>(
    new Set(driverCodes.slice(0, 10))
  );

  const toggleDriver = (code: string) => {
    const newSet = new Set(selectedDrivers);
    if (newSet.has(code)) {
      newSet.delete(code);
    } else {
      newSet.add(code);
    }
    setSelectedDrivers(newSet);
  };

  const selectAll = () => setSelectedDrivers(new Set(driverCodes));
  const selectNone = () => setSelectedDrivers(new Set());
  const selectTop10 = () => setSelectedDrivers(new Set(driverCodes.slice(0, 10)));

  if (data.length === 0) {
    return <NoDataMessage message="No position data available for this race" />;
  }

  return (
    <div className="h-full flex flex-col">
      <p className="text-gray-400 text-xs mb-2">
        Position changes throughout the race (P1 at top, click drivers to toggle)
      </p>
      
      {/* Driver selector */}
      <div className="flex flex-wrap items-center gap-1 mb-3">
        <div className="flex gap-1 mr-2">
          <button
            onClick={selectTop10}
            className="px-2 py-0.5 text-[10px] rounded bg-gray-700 text-gray-300 hover:bg-gray-600"
          >
            Top 10
          </button>
          <button
            onClick={selectAll}
            className="px-2 py-0.5 text-[10px] rounded bg-gray-700 text-gray-300 hover:bg-gray-600"
          >
            All
          </button>
          <button
            onClick={selectNone}
            className="px-2 py-0.5 text-[10px] rounded bg-gray-700 text-gray-300 hover:bg-gray-600"
          >
            None
          </button>
        </div>
        <div className="flex flex-wrap gap-1 max-h-12 overflow-y-auto">
          {driverCodes.map((code) => {
            const driver = drivers.find((d) => d.code === code);
            return (
              <button
                key={code}
                onClick={() => toggleDriver(code)}
                className={`px-2 py-0.5 text-xs rounded transition-all ${
                  selectedDrivers.has(code)
                    ? 'text-white ring-1 ring-white/30'
                    : 'bg-gray-700 text-gray-500'
                }`}
                style={{
                  backgroundColor: selectedDrivers.has(code) ? (colors[code] || '#6B7280') : undefined,
                }}
                title={driver ? `${driver.givenName} ${driver.familyName}` : code}
              >
                {code}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 25 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.5} />
            <XAxis
              dataKey="lap"
              stroke="#9CA3AF"
              tick={{ fill: '#9CA3AF', fontSize: 10 }}
              tickLine={{ stroke: '#4B5563' }}
              axisLine={{ stroke: '#4B5563' }}
              label={{ value: 'Lap', position: 'bottom', offset: 10, fill: '#9CA3AF', fontSize: 11 }}
              interval="preserveStartEnd"
            />
            <YAxis
              reversed
              domain={[1, 20]}
              stroke="#9CA3AF"
              tick={{ fill: '#9CA3AF', fontSize: 10 }}
              tickLine={{ stroke: '#4B5563' }}
              axisLine={{ stroke: '#4B5563' }}
              ticks={[1, 5, 10, 15, 20]}
              width={35}
              label={{
                value: 'Position',
                angle: -90,
                position: 'insideLeft',
                fill: '#9CA3AF',
                fontSize: 11,
                offset: 0,
              }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1F2937',
                border: '1px solid #374151',
                borderRadius: '8px',
                padding: '8px 12px',
              }}
              labelStyle={{ color: '#F3F4F6', fontWeight: 'bold', marginBottom: '4px' }}
              labelFormatter={(label) => `Lap ${label}`}
              formatter={(value: number, name: string) => [`P${value}`, name]}
            />
            {Array.from(selectedDrivers).map((code) => (
              <Line
                key={code}
                type="stepAfter"
                dataKey={code}
                stroke={colors[code] || '#6B7280'}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 5, strokeWidth: 2, stroke: '#fff' }}
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      {/* Legend showing selected drivers count */}
      <div className="text-center text-xs text-gray-500 mt-2">
        Showing {selectedDrivers.size} of {driverCodes.length} drivers
      </div>
    </div>
  );
};

// Lap Times Line Chart
const LapTimesChart: React.FC<{
  data: any[];
  drivers: Driver[];
  colors: Record<string, string>;
}> = ({ data, drivers, colors }) => {
  const [selectedDrivers, setSelectedDrivers] = useState<Set<string>>(
    new Set(drivers.slice(0, 5).map((d) => d.code))
  );

  const toggleDriver = (code: string) => {
    const newSet = new Set(selectedDrivers);
    if (newSet.has(code)) {
      newSet.delete(code);
    } else {
      newSet.add(code);
    }
    setSelectedDrivers(newSet);
  };

  if (data.length === 0) {
    return <NoDataMessage message="No lap time data available for this race" />;
  }

  // Calculate y-axis domain based on data
  const allTimes: number[] = [];
  data.forEach((lap) => {
    Object.keys(lap).forEach((key) => {
      if (key !== 'lap' && selectedDrivers.has(key)) {
        allTimes.push(lap[key]);
      }
    });
  });
  const minTime = Math.floor(Math.min(...allTimes));
  const maxTime = Math.ceil(Math.max(...allTimes));

  return (
    <div className="h-full flex flex-col">
      <p className="text-gray-400 text-xs mb-2">
        Lap times throughout the race (click drivers to toggle)
      </p>
      {/* Driver selector */}
      <div className="flex flex-wrap gap-1 mb-2 max-h-16 overflow-y-auto">
        {drivers.map((driver) => (
          <button
            key={driver.code}
            onClick={() => toggleDriver(driver.code)}
            className={`px-2 py-0.5 text-xs rounded transition-colors ${
              selectedDrivers.has(driver.code)
                ? 'text-white'
                : 'bg-gray-700 text-gray-500'
            }`}
            style={{
              backgroundColor: selectedDrivers.has(driver.code) ? driver.color : undefined,
            }}
          >
            {driver.code}
          </button>
        ))}
      </div>
      <div className="flex-1">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis
              dataKey="lap"
              stroke="#9CA3AF"
              tick={{ fill: '#9CA3AF', fontSize: 11 }}
              label={{ value: 'Lap', position: 'bottom', fill: '#9CA3AF', fontSize: 12 }}
            />
            <YAxis
              domain={[minTime - 2, maxTime + 2]}
              stroke="#9CA3AF"
              tick={{ fill: '#9CA3AF', fontSize: 11 }}
              label={{
                value: 'Lap Time (s)',
                angle: -90,
                position: 'insideLeft',
                fill: '#9CA3AF',
                fontSize: 12,
              }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1F2937',
                border: '1px solid #374151',
                borderRadius: '8px',
              }}
              labelStyle={{ color: '#F3F4F6' }}
              formatter={(value: number) => [`${value.toFixed(3)}s`, '']}
            />
            {Array.from(selectedDrivers).map((code) => (
              <Line
                key={code}
                type="monotone"
                dataKey={code}
                stroke={colors[code] || '#6B7280'}
                strokeWidth={1.5}
                dot={false}
                activeDot={{ r: 3 }}
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// Pit Stop Gantt Chart
const PitStopChart: React.FC<{
  data: any[];
  totalLaps: number;
}> = ({ data, totalLaps }) => {
  if (data.length === 0) {
    return <NoDataMessage message="No pit stop data available for this race" />;
  }

  return (
    <div className="h-full">
      <p className="text-gray-400 text-xs mb-2">
        Pit stop timing and duration (bubble size = stop duration)
      </p>
      <ResponsiveContainer width="100%" height={350}>
        <ComposedChart
          data={data}
          margin={{ top: 20, right: 30, left: 60, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis
            type="number"
            dataKey="lap"
            domain={[0, totalLaps]}
            stroke="#9CA3AF"
            tick={{ fill: '#9CA3AF', fontSize: 11 }}
            label={{ value: 'Lap', position: 'bottom', fill: '#9CA3AF', fontSize: 12 }}
          />
          <YAxis
            type="category"
            dataKey="driver"
            stroke="#9CA3AF"
            tick={{ fill: '#9CA3AF', fontSize: 10 }}
            width={50}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1F2937',
              border: '1px solid #374151',
              borderRadius: '8px',
            }}
            labelStyle={{ color: '#F3F4F6' }}
            formatter={(value: any, name: string, _props: any) => {
              if (name === 'lap') return [`Lap ${value}`, 'Pit Stop'];
              if (name === 'duration') return [`${value.toFixed(2)}s`, 'Duration'];
              return [value, name];
            }}
            labelFormatter={(_label: any, payload: any) => {
              if (payload && payload[0]) {
                return `${payload[0].payload.driverName} - Stop #${payload[0].payload.stop}`;
              }
              return '';
            }}
          />
          <Scatter
            name="Pit Stops"
            dataKey="duration"
            fill="#EF4444"
            shape={(props: any) => {
              const { cx, cy, payload } = props;
              const size = Math.max(8, Math.min(20, payload.duration * 0.8));
              return (
                <circle
                  cx={cx}
                  cy={cy}
                  r={size}
                  fill={payload.color}
                  stroke="#fff"
                  strokeWidth={1}
                  opacity={0.8}
                />
              );
            }}
          />
        </ComposedChart>
      </ResponsiveContainer>
      {/* Legend */}
      <div className="flex justify-center gap-4 mt-2 text-xs text-gray-400">
        <span>🔵 Small bubble = Fast pit</span>
        <span>🔴 Large bubble = Slow pit</span>
      </div>
    </div>
  );
};

// Race Pace Bar Chart
const PaceChart: React.FC<{
  data: any[];
}> = ({ data }) => {
  if (data.length === 0) {
    return <NoDataMessage message="No pace data available for this race" />;
  }

  // Get fastest pace for reference
  const fastestPace = data.length > 0 ? data[0].avgPace : 0;

  return (
    <div className="h-full">
      <p className="text-gray-400 text-xs mb-2">
        Average race pace comparison (trimmed mean, excluding pit laps)
      </p>
      <ResponsiveContainer width="100%" height={350}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 10, right: 30, left: 60, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis
            type="number"
            domain={[fastestPace - 1, 'dataMax']}
            stroke="#9CA3AF"
            tick={{ fill: '#9CA3AF', fontSize: 11 }}
            label={{
              value: 'Avg Lap Time (s)',
              position: 'bottom',
              fill: '#9CA3AF',
              fontSize: 12,
            }}
          />
          <YAxis
            type="category"
            dataKey="driver"
            stroke="#9CA3AF"
            tick={{ fill: '#9CA3AF', fontSize: 10 }}
            width={50}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1F2937',
              border: '1px solid #374151',
              borderRadius: '8px',
            }}
            labelStyle={{ color: '#F3F4F6' }}
            formatter={(value: number, _name: string, props: any) => {
              const { payload } = props;
              return [
                <div key="tooltip" className="text-sm">
                  <div>Avg: {value.toFixed(3)}s</div>
                  <div className="text-green-400">Best: {payload.fastest.toFixed(3)}s</div>
                  <div className="text-red-400">Worst: {payload.slowest.toFixed(3)}s</div>
                  <div className="text-gray-400">Laps: {payload.laps}</div>
                </div>,
                '',
              ];
            }}
            labelFormatter={(label: any, payload: any) =>
              payload?.[0]?.payload?.driverName || label
            }
          />
          <ReferenceLine x={fastestPace} stroke="#22C55E" strokeDasharray="5 5" />
          <Bar dataKey="avgPace" name="Avg Pace">
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      {/* Legend */}
      <div className="flex justify-center gap-4 mt-2 text-xs text-gray-400">
        <span className="flex items-center gap-1">
          <span className="w-3 h-0.5 bg-green-500 inline-block"></span> Fastest
          avg pace
        </span>
      </div>
    </div>
  );
};

// No Data Message Component
const NoDataMessage: React.FC<{ message: string }> = ({ message }) => (
  <div className="flex items-center justify-center h-64 text-gray-400">
    <div className="text-center">
      <span className="text-4xl mb-2 block">📊</span>
      <p>{message}</p>
      <p className="text-xs mt-2">Play the race to generate chart data</p>
    </div>
  </div>
);

export default RaceCharts;
