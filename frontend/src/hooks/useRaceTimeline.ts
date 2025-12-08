/**
 * useRaceTimeline Hook
 * Manages race timeline data fetching and state
 */

import { useState, useEffect, useCallback } from 'react';
import { RaceTimeline } from '../types';
import api from '../services/api';

interface UseRaceTimelineResult {
  timeline: RaceTimeline | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useRaceTimeline(
  season: string,
  round: string,
  useMock: boolean = false
): UseRaceTimelineResult {
  const [timeline, setTimeline] = useState<RaceTimeline | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTimeline = useCallback(async () => {
    if (!season || !round) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await api.getRaceTimeline(season, round, useMock);
      setTimeline(data);
    } catch (err: any) {
      // Extract error message from API response if available
      const apiMessage = err?.response?.data?.message || err?.response?.data?.error;
      const message = apiMessage || (err instanceof Error ? err.message : 'Failed to fetch timeline');
      setError(message);
      console.error('Error fetching timeline:', err);
    } finally {
      setIsLoading(false);
    }
  }, [season, round, useMock]);

  useEffect(() => {
    fetchTimeline();
  }, [fetchTimeline]);

  return {
    timeline,
    isLoading,
    error,
    refetch: fetchTimeline,
  };
}

export default useRaceTimeline;
