# F1 Race Replay Simulator - Project Instructions

## Project Overview
This is a full-stack F1 Race Replay Simulator web application that visualizes lap-by-lap race replays with animated driver positions on 2D SVG track maps.

## Tech Stack
- **Frontend**: React + Vite + TypeScript + TailwindCSS
- **Backend**: Node.js + Express + TypeScript
- **Animation**: SVG rendering + requestAnimationFrame
- **Data Source**: jolpica-f1 API (open-source F1 data)

## Project Structure
```
race-sim/
├── backend/                 # Express server
│   ├── src/
│   │   ├── api/            # API route handlers
│   │   ├── services/       # Business logic & data processing
│   │   ├── types/          # TypeScript interfaces
│   │   └── index.ts        # Server entry point
│   └── package.json
├── frontend/               # React application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── services/       # API fetching modules
│   │   ├── utils/          # Utility functions
│   │   ├── types/          # TypeScript interfaces
│   │   └── App.tsx         # Main application
│   └── package.json
└── README.md
```

## Key Modules
- **API Fetching**: `frontend/src/services/api.ts` - Fetches race data from backend
- **Lap Processing**: `backend/src/services/lapProcessor.ts` - Converts lap times to animation data
- **SVG Track Rendering**: `frontend/src/components/TrackViewer.tsx` - Renders circuit maps
- **Car Animator**: `frontend/src/components/CarAnimator.tsx` - Animates driver positions
- **Event Manager**: `frontend/src/utils/eventManager.ts` - Handles race events
- **UI Components**: `frontend/src/components/` - Sidebar, controls, etc.

## API Endpoints
- `GET /api/race/:season/:round/laps` - Lap timing data
- `GET /api/race/:season/:round/pitstops` - Pitstop data
- `GET /api/race/:season/:round/drivers` - Driver information
- `GET /api/race/:season/:round/metadata` - Race metadata

## Development Commands
- Backend: `cd backend && npm run dev`
- Frontend: `cd frontend && npm run dev`

## Data Processing
- Lap times are converted to per-frame movement speed
- SVG path's getPointAtLength() converts progress% → (x,y) coordinates
- Events (laps, pits, overtakes, DNFs) are compiled into a unified timeline
