/**
 * F1 Race Replay Simulator - Main Application
 * 
 * This is the main application component that orchestrates:
 * - Race selection
 * - Timeline loading
 * - Playback controls
 * - Live lap details display
 * - Driver standings sidebar
 * - Telemetry data display
 */

import { useState, useCallback, useMemo, useEffect, lazy, Suspense } from 'react';
import LiveLapPanel from './components/LiveLapPanel';
import PlaybackControls from './components/PlaybackControls';
import DriverSidebar from './components/DriverSidebar';
import EventFeed from './components/EventFeed';
import RaceSelector from './components/RaceSelector';
import Loading from './components/Loading';
import TelemetryPanel from './components/TelemetryPanel';
// Lazy load charts for better initial load performance
const RaceCharts = lazy(() => import('./components/RaceCharts'));
import { useRaceTimeline } from './hooks/useRaceTimeline';
import { useAnimation } from './hooks/useAnimation';
import { getTelemetry } from './services/api';
import { RaceTelemetry, DriverTelemetry } from './types';

function App() {
  // Race selection state
  const [selectedRace, setSelectedRace] = useState<{
    season: string;
    round: string;
    useMock: boolean;
  } | null>(null);

  // Telemetry state
  const [telemetry, setTelemetry] = useState<RaceTelemetry | null>(null);
  const [telemetryLoading, setTelemetryLoading] = useState(false);

  // Fetch timeline data
  const { timeline, isLoading, error } = useRaceTimeline(
    selectedRace?.season || '',
    selectedRace?.round || '',
    selectedRace?.useMock || false
  );

  // Fetch telemetry data when race is selected
  useEffect(() => {
    if (selectedRace && !selectedRace.useMock) {
      setTelemetryLoading(true);
      getTelemetry(selectedRace.season, selectedRace.round)
        .then(setTelemetry)
        .catch((err) => {
          console.error('Failed to fetch telemetry:', err);
          setTelemetry(null);
        })
        .finally(() => setTelemetryLoading(false));
    } else {
      setTelemetry(null);
    }
  }, [selectedRace]);

  // Create telemetry map for DriverSidebar
  const telemetryMap = useMemo(() => {
    if (!telemetry) return undefined;
    const map = new Map<string, DriverTelemetry>();
    telemetry.drivers.forEach((d) => map.set(d.driverId, d));
    return map;
  }, [telemetry]);

  // Animation controls
  const {
    playbackState,
    interpolatedDrivers,
    play,
    pause,
    restart,
    setSpeed,
    seekToPercent,
  } = useAnimation(timeline);

  // Handle race selection
  const handleRaceSelect = useCallback((season: string, round: string, useMock: boolean) => {
    setSelectedRace({ season, round, useMock });
  }, []);

  // Handle back to race selection
  const handleBackToSelection = useCallback(() => {
    setSelectedRace(null);
    setTelemetry(null);
  }, []);

  // Get current lap from driver states
  const currentLap = useMemo(() => {
    if (interpolatedDrivers.length === 0) return 0;
    const leader = interpolatedDrivers.find((d) => d.position === 1);
    return leader?.lap || 0;
  }, [interpolatedDrivers]);

  // Show race selector if no race selected
  if (!selectedRace) {
    return (
      <div className="min-h-screen bg-f1-black flex items-center justify-center p-4">
        <RaceSelector onRaceSelect={handleRaceSelect} isLoading={false} />
      </div>
    );
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-f1-black flex items-center justify-center">
        <Loading message="Loading race data..." />
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-f1-black flex flex-col items-center justify-center p-4">
        <div className="bg-red-900/50 border border-red-700 rounded-lg p-6 max-w-md text-center">
          <h2 className="text-xl font-bold text-red-400 mb-2">Error Loading Race</h2>
          <p className="text-gray-300 mb-4">{error}</p>
          <button
            onClick={handleBackToSelection}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
          >
            Back to Race Selection
          </button>
        </div>
      </div>
    );
  }

  // Show empty state if no timeline
  if (!timeline) {
    return (
      <div className="min-h-screen bg-f1-black flex items-center justify-center">
        <div className="text-gray-400 text-center">
          <p>No race data available</p>
          <button
            onClick={handleBackToSelection}
            className="mt-4 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
          >
            Back to Race Selection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-f1-black text-white">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBackToSelection}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              title="Back to race selection"
            >
              <svg 
                className="w-5 h-5" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M10 19l-7-7m0 0l7-7m-7 7h18" 
                />
              </svg>
            </button>
            <h1 className="text-xl font-bold">
              <span className="text-f1-red">F1</span> Race Replay
            </h1>
          </div>
          <div className="text-sm text-gray-400">
            {timeline.metadata.raceName} - {timeline.metadata.season}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-4">
        {/* Race Info Header */}
        <div className="mb-4">
          <LiveLapPanel
            drivers={timeline.drivers}
            driverStates={interpolatedDrivers}
            currentLap={currentLap}
            totalLaps={timeline.metadata.totalLaps}
            raceName={timeline.metadata.raceName}
          />
        </div>

        {/* Playback Controls */}
        <div className="mb-4">
          <PlaybackControls
            playbackState={playbackState}
            metadata={timeline.metadata}
            totalDurationMs={timeline.totalDurationMs}
            currentLap={currentLap}
            onPlay={play}
            onPause={pause}
            onRestart={restart}
            onSpeedChange={setSpeed}
            onSeek={seekToPercent}
          />
        </div>

        {/* Main Grid: Standings + Telemetry + Events */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Driver Standings */}
          <div className="lg:col-span-1">
            <DriverSidebar
              drivers={timeline.drivers}
              driverStates={interpolatedDrivers}
              telemetryData={telemetryMap}
            />
          </div>
          
          {/* Telemetry Panel */}
          <div className="lg:col-span-1">
            <TelemetryPanel
              telemetry={telemetry}
              isLoading={telemetryLoading}
            />
          </div>

          {/* Event Feed */}
          <div className="lg:col-span-1">
            <EventFeed
              events={timeline.events}
              currentTimeMs={playbackState.currentTimeMs}
              drivers={timeline.drivers}
            />
          </div>
        </div>

        {/* Race Analysis Charts */}
        <div className="mt-4">
          <Suspense fallback={
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-f1-red" />
              </div>
            </div>
          }>
            <RaceCharts
              timeline={timeline}
              isLoading={isLoading}
            />
          </Suspense>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-800 px-6 py-4 mt-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-sm text-gray-500">
            Data provided by Jolpica F1 API • Built with React + TypeScript
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-500">Developed by</span>
            <a 
              href="https://github.com/hirachand04" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-gray-300 hover:text-f1-red transition-colors group"
            >
              <img 
                src="https://avatars.githubusercontent.com/u/112218726?s=32&v=4" 
                alt="Hirachand"
                className="w-6 h-6 rounded-full ring-2 ring-gray-700 group-hover:ring-f1-red transition-all"
              />
              <span className="font-medium">Hirachand Barik</span>
              <svg className="w-4 h-4 opacity-60 group-hover:opacity-100" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
