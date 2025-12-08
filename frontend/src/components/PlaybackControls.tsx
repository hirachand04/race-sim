/**
 * PlaybackControls Component
 * Provides controls for race replay playback
 * 
 * Features:
 * - Play/Pause button
 * - Restart button
 * - Speed control (1x, 2x, 4x)
 * - Timeline scrubber
 * - Current time/lap display
 */

import React from 'react';
import { PlaybackState, RaceMetadata } from '../types';
import { formatLapTime } from '../utils/eventManager';

interface PlaybackControlsProps {
  playbackState: PlaybackState;
  metadata: RaceMetadata | null;
  totalDurationMs: number;
  currentLap: number;
  onPlay: () => void;
  onPause: () => void;
  onRestart: () => void;
  onSpeedChange: (speed: number) => void;
  onSeek: (percent: number) => void;
}

const PlaybackControls: React.FC<PlaybackControlsProps> = ({
  playbackState,
  metadata,
  totalDurationMs,
  currentLap,
  onPlay,
  onPause,
  onRestart,
  onSpeedChange,
  onSeek,
}) => {
  const { isPlaying, currentTimeMs, speed } = playbackState;
  
  // Calculate progress percentage
  const progressPercent = totalDurationMs > 0 
    ? (currentTimeMs / totalDurationMs) * 100 
    : 0;

  /**
   * Handle timeline click/drag
   */
  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = (x / rect.width) * 100;
    onSeek(Math.max(0, Math.min(100, percent)));
  };

  const speedOptions = [0.5, 1, 2, 4];

  return (
    <div className="bg-gray-800 rounded-lg p-2 sm:p-4 space-y-2 sm:space-y-4 shadow-lg">
      {/* Race Info */}
      {metadata && (
        <div className="text-center">
          <h2 className="text-sm sm:text-lg font-bold text-white truncate">{metadata.raceName}</h2>
          <p className="text-xs sm:text-sm text-gray-400 truncate">
            {metadata.circuitName} - {metadata.season}
          </p>
        </div>
      )}
      
      {/* Current Status */}
      <div className="flex justify-between items-center text-xs sm:text-sm">
        <div className="text-white">
          <span className="text-gray-400">Lap: </span>
          <span className="font-bold tabular-nums">{currentLap}</span>
          <span className="text-gray-400"> / {metadata?.totalLaps || '?'}</span>
        </div>
        <div className="text-white">
          <span className="text-gray-400 hidden sm:inline">Time: </span>
          <span className="font-mono tabular-nums text-xs sm:text-sm">{formatLapTime(currentTimeMs)}</span>
        </div>
      </div>
      
      {/* Timeline Scrubber */}
      <div 
        className="h-3 sm:h-4 bg-gray-700 rounded-full cursor-pointer relative overflow-hidden group"
        onClick={handleTimelineClick}
      >
        {/* Progress bar with gradient */}
        <div 
          className="h-full bg-gradient-to-r from-f1-red to-red-500 rounded-full transition-all duration-150 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
        {/* Scrubber handle */}
        <div 
          className="absolute top-1/2 -translate-y-1/2 w-4 sm:w-5 h-4 sm:h-5 bg-white rounded-full shadow-lg 
            transition-transform duration-150 group-hover:scale-110 border-2 border-f1-red"
          style={{ left: `calc(${progressPercent}% - 8px)` }}
        />
        {/* Hover effect */}
        <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
      
      {/* Playback Buttons */}
      <div className="flex justify-center items-center gap-2 sm:gap-4">
        {/* Restart Button */}
        <button
          onClick={onRestart}
          className="p-2 sm:p-3 bg-gray-700 hover:bg-gray-600 rounded-full transition-all duration-200 
            hover:scale-110 active:scale-95 focus:ring-2 focus:ring-f1-red focus:ring-offset-2 focus:ring-offset-gray-800"
          title="Restart"
        >
          <svg 
            className="w-4 h-4 sm:w-5 sm:h-5 text-white" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
            />
          </svg>
        </button>
        
        {/* Play/Pause Button */}
        <button
          onClick={isPlaying ? onPause : onPlay}
          className={`p-3 sm:p-4 rounded-full transition-all duration-200 
            hover:scale-110 active:scale-95 focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800
            ${isPlaying 
              ? 'bg-f1-red hover:bg-red-700 focus:ring-red-500 animate-pulse' 
              : 'bg-f1-red hover:bg-red-700 focus:ring-f1-red'}`}
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? (
            <svg 
              className="w-5 h-5 sm:w-6 sm:h-6 text-white" 
              fill="currentColor" 
              viewBox="0 0 24 24"
            >
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
            </svg>
          ) : (
            <svg 
              className="w-5 h-5 sm:w-6 sm:h-6 text-white" 
              fill="currentColor" 
              viewBox="0 0 24 24"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>
        
        {/* Speed Control */}
        <div className="flex items-center gap-0.5 sm:gap-1 bg-gray-900 rounded-lg p-0.5 sm:p-1">
          {speedOptions.map((s) => (
            <button
              key={s}
              onClick={() => onSpeedChange(s)}
              className={`px-2 sm:px-3 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-bold transition-all duration-200
                ${speed === s
                  ? 'bg-f1-red text-white shadow-lg scale-105'
                  : 'bg-transparent text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PlaybackControls;
