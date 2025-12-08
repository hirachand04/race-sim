/**
 * useAnimation Hook
 * Manages race animation playback with requestAnimationFrame
 * 
 * Key features:
 * - Play/Pause/Restart controls
 * - Variable speed (1x, 2x, 4x)
 * - Frame interpolation for smooth animation
 * - Synchronized with timeline data
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { AnimationFrame, RaceTimeline, PlaybackState, DriverState } from '../types';

interface UseAnimationResult {
  playbackState: PlaybackState;
  currentFrame: AnimationFrame | null;
  interpolatedDrivers: DriverState[];
  play: () => void;
  pause: () => void;
  restart: () => void;
  setSpeed: (speed: number) => void;
  seekTo: (timeMs: number) => void;
  seekToPercent: (percent: number) => void;
}

export function useAnimation(timeline: RaceTimeline | null): UseAnimationResult {
  const [playbackState, setPlaybackState] = useState<PlaybackState>({
    isPlaying: false,
    currentTimeMs: 0,
    speed: 1,
    currentFrameIndex: 0,
  });
  
  const [interpolatedDrivers, setInterpolatedDrivers] = useState<DriverState[]>([]);
  
  const animationFrameRef = useRef<number | null>(null);
  const lastTimestampRef = useRef<number | null>(null);

  /**
   * Gets the frame at a specific index
   */
  const getFrame = useCallback((index: number): AnimationFrame | null => {
    if (!timeline || index < 0 || index >= timeline.frames.length) {
      return null;
    }
    return timeline.frames[index];
  }, [timeline]);

  /**
   * Finds the frame index for a given time
   */
  const findFrameIndex = useCallback((timeMs: number): number => {
    if (!timeline || timeline.frames.length === 0) return 0;
    
    for (let i = 0; i < timeline.frames.length; i++) {
      if (timeline.frames[i].timeInMs > timeMs) {
        return Math.max(0, i - 1);
      }
    }
    return timeline.frames.length - 1;
  }, [timeline]);

  /**
   * Interpolates driver positions between frames
   */
  const interpolateDrivers = useCallback(
    (timeMs: number): DriverState[] => {
      if (!timeline || timeline.frames.length === 0) return [];
      
      const frameIndex = findFrameIndex(timeMs);
      const currentFrame = timeline.frames[frameIndex];
      const nextFrame = timeline.frames[frameIndex + 1];
      
      if (!nextFrame) {
        return currentFrame?.drivers || [];
      }
      
      // Calculate interpolation factor
      const frameDuration = nextFrame.timeInMs - currentFrame.timeInMs;
      const elapsed = timeMs - currentFrame.timeInMs;
      const t = frameDuration > 0 ? Math.min(1, elapsed / frameDuration) : 0;
      
      // Interpolate each driver's position
      return currentFrame.drivers.map((driver) => {
        const nextDriver = nextFrame.drivers.find((d) => d.driverId === driver.driverId);
        
        if (!nextDriver) return driver;
        
        // Smooth interpolation of progress
        let interpolatedProgress = driver.progress + (nextDriver.progress - driver.progress) * t;
        
        // Handle lap transitions
        if (nextDriver.lap > driver.lap && nextDriver.progress < driver.progress) {
          // Moving to next lap - handle wrap around
          interpolatedProgress = driver.progress + (100 - driver.progress + nextDriver.progress) * t;
          if (interpolatedProgress > 100) {
            interpolatedProgress = interpolatedProgress % 100;
          }
        }
        
        return {
          ...driver,
          progress: interpolatedProgress,
          lap: t > 0.5 ? nextDriver.lap : driver.lap,
          position: t > 0.5 ? nextDriver.position : driver.position,
        };
      });
    },
    [timeline, findFrameIndex]
  );

  /**
   * Animation loop
   */
  const animate = useCallback(
    (timestamp: number) => {
      if (!timeline) return;
      
      if (lastTimestampRef.current === null) {
        lastTimestampRef.current = timestamp;
      }
      
      const deltaMs = timestamp - lastTimestampRef.current;
      lastTimestampRef.current = timestamp;
      
      setPlaybackState((prev) => {
        // Calculate new time with speed multiplier
        // Using a 20x base multiplier for readable pace (adjust speed 1x/2x/4x for faster playback)
        const newTimeMs = prev.currentTimeMs + (deltaMs * prev.speed * 20);
        
        // Check if we've reached the end
        if (newTimeMs >= timeline.totalDurationMs) {
          return {
            ...prev,
            isPlaying: false,
            currentTimeMs: timeline.totalDurationMs,
            currentFrameIndex: timeline.frames.length - 1,
          };
        }
        
        const newFrameIndex = findFrameIndex(newTimeMs);
        
        return {
          ...prev,
          currentTimeMs: newTimeMs,
          currentFrameIndex: newFrameIndex,
        };
      });
      
      // Continue animation if still playing
      if (playbackState.isPlaying) {
        animationFrameRef.current = requestAnimationFrame(animate);
      }
    },
    [timeline, playbackState.isPlaying, findFrameIndex]
  );

  /**
   * Update interpolated drivers when time changes
   */
  useEffect(() => {
    const drivers = interpolateDrivers(playbackState.currentTimeMs);
    setInterpolatedDrivers(drivers);
  }, [playbackState.currentTimeMs, interpolateDrivers]);

  /**
   * Start/stop animation loop based on play state
   */
  useEffect(() => {
    if (playbackState.isPlaying && timeline) {
      lastTimestampRef.current = null;
      animationFrameRef.current = requestAnimationFrame(animate);
    } else {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    }
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [playbackState.isPlaying, timeline, animate]);

  /**
   * Reset state when timeline changes
   */
  useEffect(() => {
    if (timeline) {
      setPlaybackState({
        isPlaying: false,
        currentTimeMs: 0,
        speed: 1,
        currentFrameIndex: 0,
      });
    }
  }, [timeline]);

  const play = useCallback(() => {
    setPlaybackState((prev) => ({ ...prev, isPlaying: true }));
  }, []);

  const pause = useCallback(() => {
    setPlaybackState((prev) => ({ ...prev, isPlaying: false }));
  }, []);

  const restart = useCallback(() => {
    setPlaybackState({
      isPlaying: false,
      currentTimeMs: 0,
      speed: playbackState.speed,
      currentFrameIndex: 0,
    });
  }, [playbackState.speed]);

  const setSpeed = useCallback((speed: number) => {
    setPlaybackState((prev) => ({ ...prev, speed }));
  }, []);

  const seekTo = useCallback(
    (timeMs: number) => {
      if (!timeline) return;
      
      const clampedTime = Math.max(0, Math.min(timeMs, timeline.totalDurationMs));
      const frameIndex = findFrameIndex(clampedTime);
      
      setPlaybackState((prev) => ({
        ...prev,
        currentTimeMs: clampedTime,
        currentFrameIndex: frameIndex,
      }));
    },
    [timeline, findFrameIndex]
  );

  const seekToPercent = useCallback(
    (percent: number) => {
      if (!timeline) return;
      const timeMs = (percent / 100) * timeline.totalDurationMs;
      seekTo(timeMs);
    },
    [timeline, seekTo]
  );

  return {
    playbackState,
    currentFrame: getFrame(playbackState.currentFrameIndex),
    interpolatedDrivers,
    play,
    pause,
    restart,
    setSpeed,
    seekTo,
    seekToPercent,
  };
}

export default useAnimation;
