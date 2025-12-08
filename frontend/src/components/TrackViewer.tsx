/**
 * TrackViewer Component
 * Renders the SVG track map with animated car positions
 * 
 * Key features:
 * - Realistic track shapes for each circuit
 * - Driver represented as colored dots (constructor colors)
 * - Smooth animation along track path
 * - Lap-precise positioning
 * - Start/finish line indicator
 */

import React, { useRef, useMemo, useEffect, useState } from 'react';
import { DriverState, Driver } from '../types';
import { getCircuit } from '../data/tracks';

interface TrackViewerProps {
  circuitId: string;
  drivers: Driver[];
  driverStates: DriverState[];
  currentLap: number;
  totalLaps: number;
  showLabels?: boolean;
}

const TrackViewer: React.FC<TrackViewerProps> = ({
  circuitId,
  drivers,
  driverStates,
  currentLap,
  totalLaps,
  showLabels = true,
}) => {
  const trackPathRef = useRef<SVGPathElement>(null);
  const pitlanePathRef = useRef<SVGPathElement>(null);
  const [pathLength, setPathLength] = useState(0);
  const [pitPathLength, setPitPathLength] = useState(0);
  
  const circuit = useMemo(() => getCircuit(circuitId), [circuitId]);
  
  // Create a map for quick driver lookup
  const driverMap = useMemo(() => {
    return new Map(drivers.map((d) => [d.driverId, d]));
  }, [drivers]);

  // Get path lengths on mount/circuit change
  useEffect(() => {
    if (trackPathRef.current) {
      setPathLength(trackPathRef.current.getTotalLength());
    }
    if (pitlanePathRef.current) {
      setPitPathLength(pitlanePathRef.current.getTotalLength());
    }
  }, [circuit]);

  /**
   * Calculates the (x, y) position along a path for a given progress percentage
   */
  const getPositionOnPath = (
    pathElement: SVGPathElement | null,
    length: number,
    progress: number
  ): { x: number; y: number } => {
    if (!pathElement || length === 0) return { x: 0, y: 0 };
    
    const point = pathElement.getPointAtLength((progress / 100) * length);
    return { x: point.x, y: point.y };
  };

  /**
   * Renders the start/finish line
   */
  const renderStartFinish = () => {
    if (!trackPathRef.current || pathLength === 0) return null;
    
    const startPoint = trackPathRef.current.getPointAtLength(0);
    const nextPoint = trackPathRef.current.getPointAtLength(20);
    
    // Calculate angle for perpendicular line
    const angle = Math.atan2(nextPoint.y - startPoint.y, nextPoint.x - startPoint.x);
    const perpAngle = angle + Math.PI / 2;
    
    const lineLength = 25;
    const x1 = startPoint.x + Math.cos(perpAngle) * lineLength;
    const y1 = startPoint.y + Math.sin(perpAngle) * lineLength;
    const x2 = startPoint.x - Math.cos(perpAngle) * lineLength;
    const y2 = startPoint.y - Math.sin(perpAngle) * lineLength;
    
    return (
      <g>
        {/* Checkered pattern for start/finish */}
        <line
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke="white"
          strokeWidth="6"
        />
        <line
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke="black"
          strokeWidth="6"
          strokeDasharray="6,6"
        />
      </g>
    );
  };

  /**
   * Renders driver markers on the track
   */
  const renderDriverMarkers = () => {
    // Sort by position (reverse so leaders are rendered on top)
    const sortedStates = [...driverStates].sort((a, b) => b.position - a.position);
    
    return sortedStates.map((state) => {
      const driver = driverMap.get(state.driverId);
      if (!driver) return null;
      
      // Get path element based on pit status
      const pathElement = state.isInPit 
        ? pitlanePathRef.current 
        : trackPathRef.current;
      const length = state.isInPit ? pitPathLength : pathLength;
      
      const position = getPositionOnPath(pathElement, length, state.progress);
      
      // Determine marker styling based on position
      const isTopThree = state.position <= 3;
      const dotSize = isTopThree ? 14 : 12;
      const opacity = state.isDNF ? 0.3 : 1;
      
      return (
        <g 
          key={state.driverId}
          transform={`translate(${position.x}, ${position.y})`}
          opacity={opacity}
          style={{ transition: 'transform 50ms linear' }}
        >
          {/* Glow effect for top 3 */}
          {isTopThree && !state.isDNF && (
            <circle
              r={dotSize + 4}
              fill={driver.color}
              opacity={0.3}
            />
          )}
          
          {/* Fastest lap indicator */}
          {state.hasFastestLap && (
            <circle
              r={dotSize + 6}
              fill="none"
              stroke="#a855f7"
              strokeWidth="3"
            />
          )}
          
          {/* Main car dot */}
          <circle
            r={dotSize}
            fill={driver.color}
            stroke={state.position === 1 ? '#ffd700' : '#000'}
            strokeWidth={state.position === 1 ? 3 : 2}
          />
          
          {/* Driver code inside dot */}
          {showLabels && (
            <text
              textAnchor="middle"
              dy="0.35em"
              fontSize={dotSize * 0.6}
              fontWeight="bold"
              fill="white"
              style={{ 
                userSelect: 'none',
                textShadow: '0 0 2px black'
              }}
            >
              {driver.code}
            </text>
          )}
          
          {/* Position badge */}
          <g transform={`translate(${dotSize}, ${-dotSize})`}>
            <circle
              r={7}
              fill={isTopThree ? '#fbbf24' : '#374151'}
              stroke="white"
              strokeWidth={1}
            />
            <text
              textAnchor="middle"
              dy="0.35em"
              fontSize="7"
              fontWeight="bold"
              fill={isTopThree ? '#000' : '#fff'}
            >
              {state.position}
            </text>
          </g>
          
          {/* Pit indicator */}
          {state.isInPit && (
            <g transform="translate(0, 20)">
              <rect
                x="-10"
                y="-5"
                width="20"
                height="10"
                fill="#f59e0b"
                rx="2"
              />
              <text
                textAnchor="middle"
                dy="0.35em"
                fontSize="7"
                fontWeight="bold"
                fill="black"
              >
                PIT
              </text>
            </g>
          )}
        </g>
      );
    });
  };

  return (
    <div className="w-full h-full bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg overflow-hidden relative">
      {/* Track info overlay */}
      <div className="absolute top-4 left-4 z-10 bg-black/70 rounded-lg px-4 py-2">
        <h2 className="text-white font-bold text-lg">{circuit.name}</h2>
        <p className="text-gray-400 text-sm">
          Lap {currentLap} / {totalLaps}
        </p>
      </div>
      
      {/* Legend */}
      <div className="absolute top-4 right-4 z-10 bg-black/70 rounded-lg px-3 py-2">
        <div className="flex items-center gap-2 text-xs text-gray-300">
          <span className="w-3 h-3 rounded-full bg-yellow-400"></span>
          <span>P1-3</span>
          <span className="w-3 h-3 rounded-full border-2 border-purple-500"></span>
          <span>Fastest</span>
        </div>
      </div>
      
      <svg
        viewBox={circuit.viewBox}
        className="w-full h-full"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Background gradient */}
        <defs>
          <radialGradient id="trackBg" cx="50%" cy="50%" r="70%">
            <stop offset="0%" stopColor="#1a1a2e" />
            <stop offset="100%" stopColor="#0f0f1a" />
          </radialGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#trackBg)" />
        
        {/* Outer grass/gravel */}
        <path
          d={circuit.svgPath}
          fill="none"
          stroke="#1a472a"
          strokeWidth="70"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.8"
        />
        
        {/* Track kerbs (red/white) */}
        <path
          d={circuit.svgPath}
          fill="none"
          stroke="#dc2626"
          strokeWidth="52"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="20,20"
        />
        
        {/* Main track surface */}
        <path
          ref={trackPathRef}
          d={circuit.svgPath}
          fill="none"
          stroke="#2d2d2d"
          strokeWidth="45"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Racing line */}
        <path
          d={circuit.svgPath}
          fill="none"
          stroke="#404040"
          strokeWidth="30"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Track center marking */}
        <path
          d={circuit.svgPath}
          fill="none"
          stroke="#555"
          strokeWidth="2"
          strokeDasharray="15,15"
          opacity="0.5"
        />
        
        {/* Pitlane */}
        {circuit.pitlanePath && (
          <>
            <path
              d={circuit.pitlanePath}
              fill="none"
              stroke="#1f1f1f"
              strokeWidth="25"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              ref={pitlanePathRef}
              d={circuit.pitlanePath}
              fill="none"
              stroke="#3b82f6"
              strokeWidth="2"
              strokeDasharray="5,10"
              opacity="0.6"
            />
          </>
        )}
        
        {/* Start/Finish line */}
        {renderStartFinish()}
        
        {/* Driver markers */}
        {renderDriverMarkers()}
      </svg>
    </div>
  );
};

export default TrackViewer;
