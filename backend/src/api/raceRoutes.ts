/**
 * Race API Routes
 * Handles all endpoints for race data retrieval and processing
 */

import { Router, Request, Response } from 'express';
import jolpicaApi from '../services/jolpicaApi';
import lapProcessor from '../services/lapProcessor';
import eventManager from '../services/eventManager';
import timelineGenerator from '../services/timelineGenerator';
import { mockRaceData } from '../data/mockData';
import { RaceMetadata } from '../types';

const router = Router();

/**
 * GET /api/seasons
 * Returns list of available F1 seasons
 */
router.get('/seasons', async (req: Request, res: Response) => {
  try {
    const seasons = await jolpicaApi.getSeasons();
    res.json({ seasons });
  } catch (error) {
    console.error('Error fetching seasons:', error);
    res.status(500).json({ error: 'Failed to fetch seasons' });
  }
});

/**
 * GET /api/circuits
 * Returns list of all F1 circuits
 */
router.get('/circuits', async (req: Request, res: Response) => {
  try {
    const circuits = await jolpicaApi.getCircuits();
    res.json({ circuits });
  } catch (error) {
    console.error('Error fetching circuits:', error);
    res.status(500).json({ error: 'Failed to fetch circuits' });
  }
});

/**
 * GET /api/races/:season
 * Returns list of races for a specific season
 */
router.get('/races/:season', async (req: Request, res: Response) => {
  try {
    const { season } = req.params;
    const races = await jolpicaApi.getRaces(season);
    res.json({ races });
  } catch (error) {
    console.error('Error fetching races:', error);
    res.status(500).json({ error: 'Failed to fetch races' });
  }
});

/**
 * GET /api/race/:season/:round/metadata
 * Returns race metadata (circuit, date, etc.)
 */
router.get('/race/:season/:round/metadata', async (req: Request, res: Response) => {
  try {
    const { season, round } = req.params;
    const useMock = req.query.mock === 'true';
    
    if (useMock) {
      res.json({ metadata: mockRaceData.metadata });
      return;
    }
    
    const raceResult = await jolpicaApi.getRaceResults(season, round);
    
    if (!raceResult) {
      res.status(404).json({ error: 'Race not found' });
      return;
    }
    
    // Calculate total laps from results
    const totalLaps = raceResult.Results 
      ? Math.max(...raceResult.Results.map(r => parseInt(r.laps, 10)))
      : 0;
    
    const metadata: RaceMetadata = {
      season: raceResult.season,
      round: raceResult.round,
      raceName: raceResult.raceName,
      circuitId: raceResult.Circuit.circuitId,
      circuitName: raceResult.Circuit.circuitName,
      country: raceResult.Circuit.Location.country,
      locality: raceResult.Circuit.Location.locality,
      date: raceResult.date,
      time: raceResult.time,
      totalLaps,
    };
    
    res.json({ metadata });
  } catch (error) {
    console.error('Error fetching race metadata:', error);
    res.status(500).json({ error: 'Failed to fetch race metadata' });
  }
});

/**
 * GET /api/race/:season/:round/drivers
 * Returns driver information for a specific race
 */
router.get('/race/:season/:round/drivers', async (req: Request, res: Response) => {
  try {
    const { season, round } = req.params;
    const useMock = req.query.mock === 'true';
    
    if (useMock) {
      res.json({ drivers: mockRaceData.drivers });
      return;
    }
    
    const raceResult = await jolpicaApi.getRaceResults(season, round);
    
    if (!raceResult || !raceResult.Results) {
      res.status(404).json({ error: 'Race results not found' });
      return;
    }
    
    const drivers = lapProcessor.processDrivers(raceResult.Results);
    res.json({ drivers });
  } catch (error) {
    console.error('Error fetching drivers:', error);
    res.status(500).json({ error: 'Failed to fetch drivers' });
  }
});

/**
 * GET /api/race/:season/:round/laps
 * Returns processed lap timing data
 */
router.get('/race/:season/:round/laps', async (req: Request, res: Response) => {
  try {
    const { season, round } = req.params;
    const useMock = req.query.mock === 'true';
    
    if (useMock) {
      res.json({ 
        lapTimings: mockRaceData.lapTimings,
        processedLapData: mockRaceData.processedLapData 
      });
      return;
    }
    
    // Fetch lap times
    const jolpicaLaps = await jolpicaApi.getLapTimes(season, round);
    const lapTimings = lapProcessor.processLapData(jolpicaLaps);
    
    // Get driver IDs from lap data
    const driverIds = [...new Set(
      jolpicaLaps.flatMap(lap => lap.Timings.map(t => t.driverId))
    )];
    
    // Calculate processed lap data
    const processedLapData = lapProcessor.calculateDriverLapData(lapTimings, driverIds);
    
    res.json({ lapTimings, processedLapData });
  } catch (error) {
    console.error('Error fetching lap data:', error);
    res.status(500).json({ error: 'Failed to fetch lap data' });
  }
});

/**
 * GET /api/race/:season/:round/pitstops
 * Returns pitstop data for a specific race
 */
router.get('/race/:season/:round/pitstops', async (req: Request, res: Response) => {
  try {
    const { season, round } = req.params;
    const useMock = req.query.mock === 'true';
    
    if (useMock) {
      res.json({ pitStops: mockRaceData.pitStops });
      return;
    }
    
    const jolpicaPitStops = await jolpicaApi.getPitStops(season, round);
    const pitStops = lapProcessor.processPitStops(jolpicaPitStops);
    
    res.json({ pitStops });
  } catch (error) {
    console.error('Error fetching pitstops:', error);
    res.status(500).json({ error: 'Failed to fetch pitstops' });
  }
});

/**
 * GET /api/race/:season/:round/timeline
 * Returns complete race timeline with animation frames
 */
router.get('/race/:season/:round/timeline', async (req: Request, res: Response) => {
  try {
    const { season, round } = req.params;
    const useMock = req.query.mock === 'true';
    const frameInterval = parseInt(req.query.frameInterval as string) || 1000;
    
    if (useMock) {
      res.json({ timeline: mockRaceData.timeline });
      return;
    }
    
    // Fetch all required data in parallel
    const [raceResult, jolpicaLaps, jolpicaPitStops] = await Promise.all([
      jolpicaApi.getRaceResults(season, round),
      jolpicaApi.getLapTimes(season, round).catch(() => []),
      jolpicaApi.getPitStops(season, round).catch(() => []),
    ]);
    
    if (!raceResult || !raceResult.Results) {
      res.status(404).json({ 
        error: 'Race not found',
        message: 'This race may not have happened yet or results are not available.'
      });
      return;
    }
    
    // Check if lap data is available
    if (!jolpicaLaps || jolpicaLaps.length === 0) {
      res.status(404).json({ 
        error: 'Lap data not available',
        message: 'Lap timing data is not yet available for this race. This could mean the race hasn\'t happened yet or detailed timing data wasn\'t recorded.'
      });
      return;
    }
    
    // Process data
    const drivers = lapProcessor.processDrivers(raceResult.Results);
    const lapTimings = lapProcessor.processLapData(jolpicaLaps);
    const pitStops = lapProcessor.processPitStops(jolpicaPitStops);
    
    const driverIds = drivers.map(d => d.driverId);
    const processedLapData = lapProcessor.calculateDriverLapData(lapTimings, driverIds);
    
    // Identify DNFs and fastest lap
    const dnfs = lapProcessor.identifyDNFs(raceResult.Results);
    const fastestLap = lapProcessor.findFastestLap(raceResult.Results);
    
    // Build event timeline
    const events = eventManager.buildEventTimeline(
      lapTimings,
      pitStops,
      processedLapData,
      dnfs,
      fastestLap
    );
    
    // Calculate total laps
    const totalLaps = Math.max(...raceResult.Results.map(r => parseInt(r.laps, 10)));
    
    // Create metadata
    const metadata: RaceMetadata = {
      season: raceResult.season,
      round: raceResult.round,
      raceName: raceResult.raceName,
      circuitId: raceResult.Circuit.circuitId,
      circuitName: raceResult.Circuit.circuitName,
      country: raceResult.Circuit.Location.country,
      locality: raceResult.Circuit.Location.locality,
      date: raceResult.date,
      time: raceResult.time,
      totalLaps,
    };
    
    // Generate timeline
    const timeline = timelineGenerator.generateRaceTimeline(
      metadata,
      drivers,
      lapTimings,
      processedLapData,
      pitStops,
      events,
      dnfs,
      fastestLap?.driverId || null,
      frameInterval
    );
    
    res.json({ timeline });
  } catch (error) {
    console.error('Error generating timeline:', error);
    res.status(500).json({ error: 'Failed to generate race timeline' });
  }
});

/**
 * GET /api/race/:season/:round/events
 * Returns race events (overtakes, pitstops, DNFs, etc.)
 */
router.get('/race/:season/:round/events', async (req: Request, res: Response) => {
  try {
    const { season, round } = req.params;
    const useMock = req.query.mock === 'true';
    const eventType = req.query.type as string | undefined;
    
    if (useMock) {
      let events = mockRaceData.events;
      if (eventType) {
        events = events.filter(e => e.type === eventType);
      }
      res.json({ events });
      return;
    }
    
    // Fetch all required data
    const [raceResult, jolpicaLaps, jolpicaPitStops] = await Promise.all([
      jolpicaApi.getRaceResults(season, round),
      jolpicaApi.getLapTimes(season, round),
      jolpicaApi.getPitStops(season, round),
    ]);
    
    if (!raceResult || !raceResult.Results) {
      res.status(404).json({ error: 'Race not found' });
      return;
    }
    
    const lapTimings = lapProcessor.processLapData(jolpicaLaps);
    const pitStops = lapProcessor.processPitStops(jolpicaPitStops);
    const driverIds = [...new Set(jolpicaLaps.flatMap(lap => lap.Timings.map(t => t.driverId)))];
    const processedLapData = lapProcessor.calculateDriverLapData(lapTimings, driverIds);
    const dnfs = lapProcessor.identifyDNFs(raceResult.Results);
    const fastestLap = lapProcessor.findFastestLap(raceResult.Results);
    
    let events = eventManager.buildEventTimeline(
      lapTimings,
      pitStops,
      processedLapData,
      dnfs,
      fastestLap
    );
    
    // Filter by event type if specified
    if (eventType) {
      events = eventManager.filterEventsByType(events, eventType as any);
    }
    
    res.json({ events });
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'Failed to fetch race events' });
  }
});

/**
 * GET /api/race/:season/:round/qualifying
 * Returns qualifying results for a specific race
 */
router.get('/race/:season/:round/qualifying', async (req: Request, res: Response) => {
  try {
    const { season, round } = req.params;
    const qualifying = await jolpicaApi.getQualifying(season, round);
    
    if (!qualifying) {
      res.status(404).json({ error: 'Qualifying data not found' });
      return;
    }
    
    // Format qualifying results
    const results = qualifying.QualifyingResults?.map((qr: any) => ({
      position: parseInt(qr.position),
      driver: {
        driverId: qr.Driver.driverId,
        code: qr.Driver.code,
        givenName: qr.Driver.givenName,
        familyName: qr.Driver.familyName,
        nationality: qr.Driver.nationality,
      },
      constructor: {
        constructorId: qr.Constructor.constructorId,
        name: qr.Constructor.name,
      },
      q1: qr.Q1 || null,
      q2: qr.Q2 || null,
      q3: qr.Q3 || null,
    })) || [];
    
    res.json({
      qualifying: {
        season: qualifying.season,
        round: qualifying.round,
        raceName: qualifying.raceName,
        circuit: qualifying.Circuit,
        date: qualifying.date,
        time: qualifying.time,
        results,
      }
    });
  } catch (error) {
    console.error('Error fetching qualifying:', error);
    res.status(500).json({ error: 'Failed to fetch qualifying results' });
  }
});

/**
 * GET /api/race/:season/:round/sprint
 * Returns sprint race results for a specific race (if available)
 */
router.get('/race/:season/:round/sprint', async (req: Request, res: Response) => {
  try {
    const { season, round } = req.params;
    const sprint = await jolpicaApi.getSprintResults(season, round);
    
    if (!sprint) {
      res.json({ sprint: null, message: 'No sprint race for this event' });
      return;
    }
    
    // Format sprint results
    const results = sprint.SprintResults?.map((sr: any) => ({
      position: parseInt(sr.position),
      driver: {
        driverId: sr.Driver.driverId,
        code: sr.Driver.code,
        givenName: sr.Driver.givenName,
        familyName: sr.Driver.familyName,
      },
      constructor: {
        constructorId: sr.Constructor.constructorId,
        name: sr.Constructor.name,
      },
      grid: parseInt(sr.grid),
      laps: parseInt(sr.laps),
      status: sr.status,
      time: sr.Time?.time || null,
      points: parseFloat(sr.points) || 0,
    })) || [];
    
    res.json({
      sprint: {
        season: sprint.season,
        round: sprint.round,
        raceName: sprint.raceName,
        circuit: sprint.Circuit,
        date: sprint.date,
        time: sprint.time,
        results,
      }
    });
  } catch (error) {
    console.error('Error fetching sprint:', error);
    res.status(500).json({ error: 'Failed to fetch sprint results' });
  }
});

/**
 * GET /api/race/:season/:round/results
 * Returns full race results for a specific race
 */
router.get('/race/:season/:round/results', async (req: Request, res: Response) => {
  try {
    const { season, round } = req.params;
    const race = await jolpicaApi.getRaceResults(season, round);
    
    if (!race) {
      res.status(404).json({ error: 'Race results not found' });
      return;
    }
    
    // Format race results
    const results = race.Results?.map((r: any) => ({
      position: parseInt(r.position),
      positionText: r.positionText,
      driver: {
        driverId: r.Driver.driverId,
        code: r.Driver.code,
        permanentNumber: r.Driver.permanentNumber,
        givenName: r.Driver.givenName,
        familyName: r.Driver.familyName,
        nationality: r.Driver.nationality,
      },
      constructor: {
        constructorId: r.Constructor.constructorId,
        name: r.Constructor.name,
        nationality: r.Constructor.nationality,
      },
      grid: parseInt(r.grid),
      laps: parseInt(r.laps),
      status: r.status,
      time: r.Time?.time || null,
      millis: r.Time?.millis ? parseInt(r.Time.millis) : null,
      points: parseFloat(r.points) || 0,
      fastestLap: r.FastestLap ? {
        rank: parseInt(r.FastestLap.rank),
        lap: parseInt(r.FastestLap.lap),
        time: r.FastestLap.Time?.time,
        averageSpeed: r.FastestLap.AverageSpeed?.speed,
      } : null,
    })) || [];
    
    res.json({
      results: {
        season: race.season,
        round: race.round,
        raceName: race.raceName,
        circuit: race.Circuit,
        date: race.date,
        time: race.time,
        results,
      }
    });
  } catch (error) {
    console.error('Error fetching results:', error);
    res.status(500).json({ error: 'Failed to fetch race results' });
  }
});

/**
 * GET /api/race/:season/:round/standings
 * Returns driver and constructor standings after a specific race
 */
router.get('/race/:season/:round/standings', async (req: Request, res: Response) => {
  try {
    const { season, round } = req.params;
    
    const [driverStandings, constructorStandings] = await Promise.all([
      jolpicaApi.getDriverStandingsAfterRace(season, round),
      jolpicaApi.getConstructorStandingsAfterRace(season, round),
    ]);
    
    res.json({
      standings: {
        drivers: driverStandings.map((ds: any) => ({
          position: parseInt(ds.position),
          positionText: ds.positionText,
          points: parseFloat(ds.points),
          wins: parseInt(ds.wins),
          driver: {
            driverId: ds.Driver.driverId,
            code: ds.Driver.code,
            givenName: ds.Driver.givenName,
            familyName: ds.Driver.familyName,
            nationality: ds.Driver.nationality,
          },
          constructors: ds.Constructors?.map((c: any) => ({
            constructorId: c.constructorId,
            name: c.name,
          })) || [],
        })),
        constructors: constructorStandings.map((cs: any) => ({
          position: parseInt(cs.position),
          positionText: cs.positionText,
          points: parseFloat(cs.points),
          wins: parseInt(cs.wins),
          constructor: {
            constructorId: cs.Constructor.constructorId,
            name: cs.Constructor.name,
            nationality: cs.Constructor.nationality,
          },
        })),
      }
    });
  } catch (error) {
    console.error('Error fetching standings:', error);
    res.status(500).json({ error: 'Failed to fetch standings' });
  }
});

/**
 * GET /api/race/:season/:round/weekend
 * Returns all available data for a race weekend (qualifying, sprint, race, standings)
 */
router.get('/race/:season/:round/weekend', async (req: Request, res: Response) => {
  try {
    const { season, round } = req.params;
    
    // Fetch all data in parallel
    const [raceInfo, qualifying, sprint, results, pitStops, driverStandings, constructorStandings] = 
      await Promise.all([
        jolpicaApi.getRaces(season).then(races => races.find(r => r.round === round)),
        jolpicaApi.getQualifying(season, round).catch(() => null),
        jolpicaApi.getSprintResults(season, round).catch(() => null),
        jolpicaApi.getRaceResults(season, round).catch(() => null),
        jolpicaApi.getPitStops(season, round).catch(() => []),
        jolpicaApi.getDriverStandingsAfterRace(season, round).catch(() => []),
        jolpicaApi.getConstructorStandingsAfterRace(season, round).catch(() => []),
      ]);
    
    res.json({
      weekend: {
        info: raceInfo ? {
          season: raceInfo.season,
          round: raceInfo.round,
          raceName: raceInfo.raceName,
          circuit: raceInfo.Circuit,
          date: raceInfo.date,
          time: raceInfo.time,
          // Session times if available
          firstPractice: raceInfo.FirstPractice || null,
          secondPractice: raceInfo.SecondPractice || null,
          thirdPractice: raceInfo.ThirdPractice || null,
          qualifying: raceInfo.Qualifying || null,
          sprint: raceInfo.Sprint || null,
        } : null,
        qualifying: qualifying ? {
          date: qualifying.date,
          time: qualifying.time,
          results: qualifying.QualifyingResults?.map((qr: any) => ({
            position: parseInt(qr.position),
            driverCode: qr.Driver.code,
            driverName: `${qr.Driver.givenName} ${qr.Driver.familyName}`,
            constructor: qr.Constructor.name,
            q1: qr.Q1 || null,
            q2: qr.Q2 || null,
            q3: qr.Q3 || null,
          })) || [],
        } : null,
        sprint: sprint ? {
          date: sprint.date,
          time: sprint.time,
          results: sprint.SprintResults?.map((sr: any) => ({
            position: parseInt(sr.position),
            driverCode: sr.Driver.code,
            driverName: `${sr.Driver.givenName} ${sr.Driver.familyName}`,
            constructor: sr.Constructor.name,
            grid: parseInt(sr.grid),
            time: sr.Time?.time || null,
            status: sr.status,
            points: parseFloat(sr.points) || 0,
          })) || [],
        } : null,
        race: results ? {
          date: results.date,
          time: results.time,
          results: results.Results?.map((r: any) => ({
            position: parseInt(r.position),
            positionText: r.positionText,
            driverCode: r.Driver.code,
            driverName: `${r.Driver.givenName} ${r.Driver.familyName}`,
            constructor: r.Constructor.name,
            grid: parseInt(r.grid),
            laps: parseInt(r.laps),
            time: r.Time?.time || null,
            status: r.status,
            points: parseFloat(r.points) || 0,
            fastestLap: r.FastestLap ? {
              lap: parseInt(r.FastestLap.lap),
              time: r.FastestLap.Time?.time,
              rank: parseInt(r.FastestLap.rank),
            } : null,
          })) || [],
        } : null,
        pitStops: pitStops.map((ps: any) => ({
          driverId: ps.driverId,
          lap: parseInt(ps.lap),
          stop: parseInt(ps.stop),
          time: ps.time,
          duration: ps.duration,
        })),
        standingsAfterRace: {
          drivers: driverStandings.slice(0, 10).map((ds: any) => ({
            position: parseInt(ds.position),
            driverCode: ds.Driver.code,
            driverName: `${ds.Driver.givenName} ${ds.Driver.familyName}`,
            points: parseFloat(ds.points),
            wins: parseInt(ds.wins),
          })),
          constructors: constructorStandings.map((cs: any) => ({
            position: parseInt(cs.position),
            name: cs.Constructor.name,
            points: parseFloat(cs.points),
            wins: parseInt(cs.wins),
          })),
        },
      }
    });
  } catch (error) {
    console.error('Error fetching weekend data:', error);
    res.status(500).json({ error: 'Failed to fetch race weekend data' });
  }
});

/**
 * GET /api/race/:season/:round/telemetry
 * Returns comprehensive telemetry data for all drivers in a race
 * Includes fastest lap times, average speeds, grid positions, race times, status
 */
router.get('/race/:season/:round/telemetry', async (req: Request, res: Response) => {
  try {
    const { season, round } = req.params;
    
    const race = await jolpicaApi.getRaceResults(season, round);
    
    if (!race || !race.Results) {
      res.status(404).json({ error: 'Race telemetry not found' });
      return;
    }
    
    // Helper to parse lap time string to ms
    const parseTimeToMs = (timeStr: string): number => {
      if (!timeStr) return 0;
      const parts = timeStr.split(':');
      if (parts.length === 2) {
        const [mins, secs] = parts;
        return (parseInt(mins) * 60 + parseFloat(secs)) * 1000;
      }
      return parseFloat(timeStr) * 1000;
    };
    
    // Process each driver's telemetry
    const driversTelemetry = race.Results.map((result: any) => {
      const position = parseInt(result.position);
      const grid = parseInt(result.grid);
      const positionsGained = grid - position; // Positive = gained, negative = lost
      const lapsCompleted = parseInt(result.laps);
      const status = result.status;
      const isFinished = status === 'Finished' || status.includes('Lap');
      
      // Parse fastest lap data
      let fastestLap = null;
      if (result.FastestLap) {
        const fl = result.FastestLap;
        fastestLap = {
          rank: parseInt(fl.rank),
          lap: parseInt(fl.lap),
          time: fl.Time?.time || '',
          timeInMs: parseTimeToMs(fl.Time?.time || ''),
          averageSpeed: parseFloat(fl.AverageSpeed?.speed || '0'),
          speedUnit: fl.AverageSpeed?.units || 'kph',
        };
      }
      
      return {
        driverId: result.Driver.driverId,
        driverCode: result.Driver.code || result.Driver.driverId.substring(0, 3).toUpperCase(),
        driverName: `${result.Driver.givenName} ${result.Driver.familyName}`,
        constructorId: result.Constructor.constructorId,
        constructorName: result.Constructor.name,
        position,
        positionText: result.positionText,
        points: parseFloat(result.points) || 0,
        grid,
        positionsGained,
        lapsCompleted,
        status,
        isFinished,
        isClassified: position <= 20 && lapsCompleted > 0,
        raceTimeMs: result.Time?.millis ? parseInt(result.Time.millis) : undefined,
        raceTimeFormatted: result.Time?.time || undefined,
        gapToWinner: position === 1 ? 'WINNER' : (result.Time?.time || status),
        fastestLap,
      };
    });
    
    // Find fastest lap holder
    const fastestLapHolder = driversTelemetry.find(
      (d: any) => d.fastestLap?.rank === 1
    );
    
    // Calculate stats
    const totalLaps = Math.max(...driversTelemetry.map((d: any) => d.lapsCompleted));
    const finishers = driversTelemetry.filter((d: any) => d.isFinished).length;
    const retirements = driversTelemetry.length - finishers;
    
    res.json({
      telemetry: {
        season: race.season,
        round: race.round,
        raceName: race.raceName,
        drivers: driversTelemetry,
        fastestLapHolder: fastestLapHolder || null,
        totalLaps,
        finishers,
        retirements,
      }
    });
  } catch (error) {
    console.error('Error fetching telemetry:', error);
    res.status(500).json({ error: 'Failed to fetch race telemetry' });
  }
});

export default router;
