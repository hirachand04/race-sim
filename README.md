# F1 Race Replay Simulator 🏎️

A full-stack web application that visualizes F1 race replays with animated driver positions on 2D SVG track maps. Watch races unfold lap-by-lap with real-time position updates, overtakes, pitstops, and more!

![F1 Race Replay Simulator](https://via.placeholder.com/800x400/15151E/E10600?text=F1+Race+Replay+Simulator)

## Features

### 🏁 Track Visualization
- SVG-based track maps for multiple circuits (Monza, Silverstone, Monaco, Spa)
- Smooth car animation using `requestAnimationFrame`
- Pitlane visualization with pit stop animations
- Start/finish line markers

### 🎮 Playback Controls
- Play / Pause / Restart functionality
- Variable speed playback (1x, 2x, 4x)
- Timeline scrubber for seeking to any point in the race
- Current lap and time display

### 📊 Live Standings Sidebar
- Real-time position updates
- Team colors for each driver
- Last lap time display
- Gap to leader calculation
- Pitstop indicator (PIT badge)
- Fastest lap highlight (purple)
- DNF indication

### 📢 Event Feed
- Live race events as they happen
- Overtake notifications
- Pitstop announcements
- DNF alerts
- Fastest lap celebration

### 🔌 API Integration
- Real F1 data from Jolpica API (open-source Ergast alternative)
- Mock data fallback for offline testing
- Season and race selection

## Tech Stack

| Component | Technology |
|-----------|------------|
| Frontend | React 18 + TypeScript + Vite |
| Styling | TailwindCSS |
| Animation | SVG + requestAnimationFrame |
| Backend | Node.js + Express + TypeScript |
| HTTP Client | Axios |
| Data Source | [Jolpica F1 API](https://api.jolpi.ca/ergast/f1/) |

## Project Structure

```
race-sim/
├── backend/                    # Express API server
│   ├── src/
│   │   ├── api/               # Route handlers
│   │   │   └── raceRoutes.ts  # Race data endpoints
│   │   ├── data/              # Mock/sample data
│   │   │   └── mockData.ts    # Test data for Monza 2024
│   │   ├── services/          # Business logic
│   │   │   ├── jolpicaApi.ts  # External API calls
│   │   │   ├── lapProcessor.ts # Lap time processing
│   │   │   ├── eventManager.ts # Race event generation
│   │   │   └── timelineGenerator.ts # Animation frames
│   │   ├── types/             # TypeScript interfaces
│   │   └── index.ts           # Server entry point
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                   # React application
│   ├── public/
│   │   └── f1-icon.svg        # App icon
│   ├── src/
│   │   ├── components/        # React components
│   │   │   ├── TrackViewer.tsx    # SVG track renderer
│   │   │   ├── PlaybackControls.tsx # Play/pause/speed
│   │   │   ├── DriverSidebar.tsx  # Standings display
│   │   │   ├── EventFeed.tsx      # Race events
│   │   │   ├── RaceSelector.tsx   # Race picker
│   │   │   └── Loading.tsx        # Loading spinner
│   │   ├── data/              # Static data
│   │   │   └── tracks.ts      # SVG circuit paths
│   │   ├── hooks/             # Custom React hooks
│   │   │   ├── useAnimation.ts    # Animation logic
│   │   │   └── useRaceTimeline.ts # Data fetching
│   │   ├── services/          # API client
│   │   │   └── api.ts         # Backend API calls
│   │   ├── types/             # TypeScript interfaces
│   │   ├── utils/             # Utility functions
│   │   │   └── eventManager.ts # Event formatting
│   │   ├── App.tsx            # Main application
│   │   ├── main.tsx           # Entry point
│   │   └── index.css          # Global styles
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── tsconfig.json
│
└── README.md
```

## Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/hirachand04/race-sim.git
   cd race-sim
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

## Running the Application

### Development Mode

1. **Start the backend server** (Terminal 1)
   ```bash
   cd backend
   npm run dev
   ```
   The API server will start at `http://localhost:3001`

2. **Start the frontend dev server** (Terminal 2)
   ```bash
   cd frontend
   npm run dev
   ```
   The React app will start at `http://localhost:5173`

3. **Open your browser** and navigate to `http://localhost:5173`

### Production Build

1. **Build the backend**
   ```bash
   cd backend
   npm run build
   npm start
   ```

2. **Build the frontend**
   ```bash
   cd frontend
   npm run build
   npm run preview
   ```

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /api/seasons` | List all F1 seasons |
| `GET /api/circuits` | List all circuits |
| `GET /api/races/:season` | List races for a season |
| `GET /api/race/:season/:round/metadata` | Race information |
| `GET /api/race/:season/:round/drivers` | Driver data |
| `GET /api/race/:season/:round/laps` | Lap timing data |
| `GET /api/race/:season/:round/pitstops` | Pitstop data |
| `GET /api/race/:season/:round/events` | Race events |
| `GET /api/race/:season/:round/timeline` | Complete animation timeline |

Add `?mock=true` to any race endpoint to use mock data.

## How It Works

### Data Processing Pipeline

1. **Fetch Raw Data**: The backend fetches lap times, results, and pitstop data from the Jolpica API.

2. **Process Lap Times**: Lap time strings (e.g., "1:23.456") are converted to milliseconds for calculations.

3. **Calculate Cumulative Times**: For each driver, we calculate their total race time at each lap.

4. **Generate Events**: Overtakes, pitstops, DNFs, and fastest laps are detected and logged.

5. **Create Animation Frames**: The timeline is divided into frames (default: 1 per second of race time).

6. **Interpolate Positions**: The frontend smoothly interpolates driver positions between frames.

### Animation System

The animation uses `requestAnimationFrame` for smooth 60fps rendering:

```
Race Time (ms) → Frame Index → Driver Progress (0-100%) → SVG Path Position (x, y)
```

Key functions:
- `interpolatePosition()`: Calculates exact position at any time
- `getPointAtLength()`: SVG API for converting progress to coordinates
- `requestAnimationFrame()`: Browser API for smooth animation

### Track Rendering

Tracks are defined as SVG paths with:
- Main circuit path (the racing line)
- Pitlane path (for pit animations)
- ViewBox for proper scaling
- Start/finish line position

## Customization

### Adding New Circuits

Edit `frontend/src/data/tracks.ts`:

```typescript
export const newCircuit: Circuit = {
  circuitId: 'new_circuit',
  name: 'New Circuit',
  viewBox: '0 0 800 600',
  startFinishPosition: 0,
  svgPath: `M 100,300 L 200,300 ...`, // Your SVG path
  pitlanePath: `M 100,320 L 100,380 ...`, // Optional pitlane
};
```

### Changing Team Colors

Edit `backend/src/services/lapProcessor.ts`:

```typescript
const TEAM_COLORS: Record<string, string> = {
  'red_bull': '#3671C6',
  'ferrari': '#E8002D',
  // Add more teams...
};
```

### Adjusting Animation Speed

In `frontend/src/hooks/useAnimation.ts`, modify the speed multiplier:

```typescript
const newTimeMs = prev.currentTimeMs + (deltaMs * prev.speed * 100);
//                                                          ^^^ Adjust this
```

## Troubleshooting

### "Failed to fetch" errors
- Ensure the backend server is running on port 3001
- Check CORS settings if accessing from a different origin

### Animation is too fast/slow
- Adjust the speed multiplier in `useAnimation.ts`
- Change the `frameInterval` parameter when fetching timeline

### Missing lap data
- Some older races may have incomplete data in the Jolpica API
- Use mock data (`?mock=true`) for testing

## Data Source

This project uses the [Jolpica F1 API](https://github.com/jolpica/jolpica-f1), an open-source continuation of the Ergast API. Available endpoints include:

- Seasons: `https://api.jolpi.ca/ergast/f1/seasons`
- Circuits: `https://api.jolpi.ca/ergast/f1/circuits`
- Races: `https://api.jolpi.ca/ergast/f1/{year}/races`
- Results: `https://api.jolpi.ca/ergast/f1/{year}/results`
- Laps: `https://api.jolpi.ca/ergast/f1/{year}/{round}/laps`
- Pitstops: `https://api.jolpi.ca/ergast/f1/{year}/{round}/pitstops`

## Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - feel free to use this project for learning and personal projects.

---

Built with ❤️ for F1 fans
