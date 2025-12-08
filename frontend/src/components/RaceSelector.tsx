/**
 * RaceSelector Component
 * Allows users to select a race to replay
 * 
 * Features:
 * - All F1 seasons from 1950
 * - Era grouping with decade navigation
 * - Visual indicators for replay support (2004+)
 * - Race selection from list
 */

import React, { useState, useEffect, useMemo } from 'react';
import api from '../services/api';
import { Race } from '../types';

interface RaceSelectorProps {
  onRaceSelect: (season: string, round: string) => void;
  isLoading: boolean;
}

// Era definitions for F1 history
// Modern Era uses Infinity for end year to automatically include future seasons (2026+)
const F1_ERAS = [
  { name: 'Modern Era', start: 2014, end: Infinity, color: 'from-red-500 to-orange-500' },
  { name: 'V8 Era', start: 2006, end: 2013, color: 'from-blue-500 to-cyan-500' },
  { name: 'Early 2000s', start: 2000, end: 2005, color: 'from-green-500 to-teal-500' },
  { name: '1990s', start: 1990, end: 1999, color: 'from-purple-500 to-pink-500' },
  { name: '1980s', start: 1980, end: 1989, color: 'from-yellow-500 to-amber-500' },
  { name: '1970s', start: 1970, end: 1979, color: 'from-indigo-500 to-violet-500' },
  { name: '1960s', start: 1960, end: 1969, color: 'from-rose-500 to-red-500' },
  { name: '1950s', start: 1950, end: 1959, color: 'from-gray-500 to-slate-500' },
];

// Lap-by-lap timing data available from 2004 onwards
const REPLAY_SUPPORTED_FROM = 2004;

const RaceSelector: React.FC<RaceSelectorProps> = ({ onRaceSelect, isLoading }) => {
  const [seasons, setSeasons] = useState<string[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<string>('');
  const [races, setRaces] = useState<Race[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loadingSeasons, setLoadingSeasons] = useState(false);
  const [loadingRaces, setLoadingRaces] = useState(false);
  const [viewMode, setViewMode] = useState<'dropdown' | 'era'>('era');

  // Group seasons by era
  const seasonsByEra = useMemo(() => {
    const numericSeasons = seasons.map(s => parseInt(s));
    return F1_ERAS.map(era => ({
      ...era,
      seasons: numericSeasons.filter(s => s >= era.start && s <= era.end).sort((a, b) => b - a)
    })).filter(era => era.seasons.length > 0);
  }, [seasons]);

  // Check if selected season supports replay
  const supportsReplay = useMemo(() => {
    return parseInt(selectedSeason) >= REPLAY_SUPPORTED_FROM;
  }, [selectedSeason]);

  // Fetch seasons on mount
  useEffect(() => {
    const fetchSeasons = async () => {
      setLoadingSeasons(true);
      try {
        const data = await api.getSeasons();
        // Get ALL seasons, sorted descending (newest first)
        const allSeasons = [...data].reverse();
        setSeasons(allSeasons);
        if (allSeasons.length > 0) {
          setSelectedSeason(allSeasons[0]);
        }
      } catch (err) {
        console.error('Failed to fetch seasons:', err);
        // Fall back to recent seasons
        setSeasons(['2024', '2023', '2022', '2021', '2020']);
        setSelectedSeason('2024');
      } finally {
        setLoadingSeasons(false);
      }
    };
    
    fetchSeasons();
  }, []);

  // Fetch races when season changes
  useEffect(() => {
    if (!selectedSeason) return;
    
    const fetchRaces = async () => {
      setLoadingRaces(true);
      setError(null);
      try {
        const data = await api.getRaces(selectedSeason);
        setRaces(data);
      } catch (err) {
        console.error('Failed to fetch races:', err);
        setError('Failed to load races. Please try again.');
        setRaces([]);
      } finally {
        setLoadingRaces(false);
      }
    };
    
    fetchRaces();
  }, [selectedSeason]);

  const handleRaceClick = (race: Race) => {
    onRaceSelect(race.season, race.round);
  };

  const handleSeasonSelect = (season: number) => {
    setSelectedSeason(season.toString());
  };

  return (
    <div className="bg-gray-800 rounded-xl p-3 sm:p-6 max-w-3xl mx-auto shadow-2xl border border-gray-700 animate-fade-in w-full">
      {/* Header with Logo */}
      <div className="text-center mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">
          <span className="text-f1-red">F1</span> Race Replay Simulator
        </h2>
        <p className="text-gray-400 text-xs sm:text-sm">
          Relive the most exciting moments in Formula 1 history
        </p>
      </div>
      
      {/* Data Availability Legend */}
      <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-6 mb-4 sm:mb-6 text-xs sm:text-sm bg-gray-900/50 rounded-lg py-2 sm:py-3 px-3 sm:px-4">
        <div className="flex items-center gap-2 justify-center">
          <span className="w-2 sm:w-3 h-2 sm:h-3 rounded-full bg-green-500 animate-pulse"></span>
          <span className="text-gray-300">Full Replay (2004+)</span>
        </div>
        <div className="flex items-center gap-2 justify-center">
          <span className="w-2 sm:w-3 h-2 sm:h-3 rounded-full bg-yellow-500"></span>
          <span className="text-gray-300">Results Only (1950-2003)</span>
        </div>
      </div>

      {/* View Mode Toggle */}
      <div className="flex justify-center gap-2 mb-3 sm:mb-4">
        <button
          onClick={() => setViewMode('era')}
          className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${
            viewMode === 'era' 
              ? 'bg-f1-red text-white shadow-lg shadow-red-500/20' 
              : 'bg-gray-700 text-gray-400 hover:bg-gray-600 hover:text-white'
          }`}
        >
          📅 By Era
        </button>
        <button
          onClick={() => setViewMode('dropdown')}
          className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${
            viewMode === 'dropdown' 
              ? 'bg-f1-red text-white shadow-lg shadow-red-500/20' 
              : 'bg-gray-700 text-gray-400 hover:bg-gray-600 hover:text-white'
          }`}
        >
          📋 Dropdown
        </button>
      </div>

      {/* Season Selector - Era View */}
      {viewMode === 'era' && (
        <div className="mb-4 max-h-[220px] overflow-y-auto bg-gray-900/50 rounded-lg p-4 scrollbar-thin">
          {seasonsByEra.map((era) => (
            <div key={era.name} className="mb-4 last:mb-0">
              <div className={`text-sm font-bold mb-2 bg-gradient-to-r ${era.color} bg-clip-text text-transparent flex items-center gap-2`}>
                <span className={`w-2 h-2 rounded-full bg-gradient-to-r ${era.color}`} />
                {era.name} ({era.start}-{era.end})
              </div>
              <div className="flex flex-wrap gap-1.5">
                {era.seasons.map((season) => (
                  <button
                    key={season}
                    onClick={() => handleSeasonSelect(season)}
                    className={`px-3 py-1 text-sm rounded-lg transition-all duration-200 ${
                      selectedSeason === season.toString()
                        ? 'bg-f1-red text-white font-bold scale-105 shadow-lg ring-2 ring-f1-red/50'
                        : season >= REPLAY_SUPPORTED_FROM
                          ? 'bg-gray-700 text-green-400 hover:bg-gray-600 hover:scale-105'
                          : 'bg-gray-700 text-yellow-400 hover:bg-gray-600 hover:scale-105'
                    }`}
                    title={season >= REPLAY_SUPPORTED_FROM ? 'Full replay available' : 'Results only - no lap timing data'}
                  >
                    {season}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Season Selector - Dropdown View */}
      {viewMode === 'dropdown' && (
        <div className="mb-4">
          <label className="block text-gray-400 text-sm mb-2">
            Season ({seasons.length} total)
          </label>
          <select
            value={selectedSeason}
            onChange={(e) => setSelectedSeason(e.target.value)}
            disabled={loadingSeasons}
            className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 
              focus:outline-none focus:ring-2 focus:ring-f1-red transition-all
              cursor-pointer hover:bg-gray-600"
          >
            {seasonsByEra.map((era) => (
              <optgroup key={era.name} label={`${era.name} (${era.start}-${era.end})`}>
                {era.seasons.map((season) => (
                  <option key={season} value={season}>
                    {season} {season >= REPLAY_SUPPORTED_FROM ? '🎬' : '📊'}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
      )}

      {/* Selected Season Info */}
      <div className={`mb-4 p-3 rounded-lg text-center text-sm border ${
        supportsReplay 
          ? 'bg-green-900/20 border-green-700/50 text-green-400' 
          : 'bg-yellow-900/20 border-yellow-700/50 text-yellow-400'
      }`}>
        {supportsReplay ? (
          <>🎬 <strong>{selectedSeason} Season</strong> - Full animated replay with lap-by-lap timing</>
        ) : (
          <>📊 <strong>{selectedSeason} Season</strong> - Race results &amp; standings (no lap timing data available)</>
        )}
      </div>
      
      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-900/30 border border-red-700/50 rounded-lg text-red-400 text-sm flex items-center gap-2">
          <span>⚠️</span> {error}
        </div>
      )}
      
      {/* Race List */}
      <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
        {loadingRaces ? (
          <div className="text-center text-gray-400 py-8">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-gray-400 border-t-f1-red mb-2" />
            <p>Loading races...</p>
          </div>
        ) : races.length === 0 ? (
          <div className="text-center text-gray-400 py-6 sm:py-8">
            <span className="text-2xl sm:text-3xl mb-2 block">🏁</span>
            No races found for this season
          </div>
        ) : (
          races.map((race, index) => (
            <button
              key={`${race.season}-${race.round}`}
              onClick={() => handleRaceClick(race)}
              disabled={isLoading}
              className="w-full p-2.5 sm:p-4 bg-gray-700/50 hover:bg-gray-600 rounded-lg 
                text-left transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
                hover:translate-x-1 hover:shadow-lg group border border-transparent hover:border-gray-600"
              style={{ animationDelay: `${index * 30}ms` }}
            >
              <div className="flex justify-between items-center gap-2">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 text-[10px] sm:text-xs font-bold group-hover:bg-f1-red group-hover:text-white transition-colors flex-shrink-0">
                    {race.round}
                  </div>
                  <div className="min-w-0">
                    <div className="text-white font-bold text-xs sm:text-sm group-hover:text-f1-red transition-colors truncate">{race.raceName}</div>
                    <div className="text-gray-400 text-[10px] sm:text-xs truncate">
                      {race.Circuit.circuitName} • {race.Circuit.Location.country}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {supportsReplay ? (
                    <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-green-900/50 text-green-400 text-[10px] sm:text-xs rounded-full group-hover:bg-green-600 group-hover:text-white transition-colors">
                      ▶ Play
                    </span>
                  ) : (
                    <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-yellow-900/50 text-yellow-400 text-[10px] sm:text-xs rounded-full">
                      View
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))
        )}
      </div>
      
      {/* Total Count */}
      <div className="mt-3 sm:mt-4 text-center text-[10px] sm:text-xs text-gray-500 pt-2 sm:pt-3 border-t border-gray-700">
        {races.length} race{races.length !== 1 ? 's' : ''} in {selectedSeason} • 
        {seasons.length} seasons from 1950
      </div>
    </div>
  );
};

export default RaceSelector;
