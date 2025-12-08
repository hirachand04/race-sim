/**
 * F1 Race Replay Simulator - Backend Server
 * 
 * This Express server provides API endpoints for fetching and processing
 * F1 race data from the Jolpica API. It handles:
 * - Race metadata (circuit, date, drivers)
 * - Lap timing data
 * - Pitstop information
 * - Race events (overtakes, DNFs, fastest laps)
 * - Complete race timeline generation for animation
 */

import express from 'express';
import cors from 'cors';
import raceRoutes from './api/raceRoutes';

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'], // Vite dev server
  credentials: true,
}));
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// API Routes
app.use('/api', raceRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║          F1 Race Replay Simulator - Backend               ║
╠═══════════════════════════════════════════════════════════╣
║  Server running on: http://localhost:${PORT}                 ║
║  Health check: http://localhost:${PORT}/health               ║
║  API Base: http://localhost:${PORT}/api                      ║
╚═══════════════════════════════════════════════════════════╝

Available endpoints:
  GET /api/seasons                       - List all F1 seasons
  GET /api/circuits                      - List all circuits
  GET /api/races/:season                 - List races for a season
  GET /api/race/:season/:round/metadata  - Race metadata
  GET /api/race/:season/:round/drivers   - Driver information
  GET /api/race/:season/:round/laps      - Lap timing data
  GET /api/race/:season/:round/pitstops  - Pitstop data
  GET /api/race/:season/:round/events    - Race events
  GET /api/race/:season/:round/timeline  - Complete race timeline
  GET /api/race/:season/:round/qualifying - Qualifying results
  GET /api/race/:season/:round/sprint    - Sprint results (if any)
  GET /api/race/:season/:round/results   - Full race results
  GET /api/race/:season/:round/standings - Standings after race
  GET /api/race/:season/:round/weekend   - All weekend data
  `);
});
