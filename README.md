# GlobeTrotter 🌍

A full-stack travel planning application built with Node.js and vanilla JavaScript.

## Features

- ✅ **Multi-city Itinerary Planning** - Create trips with multiple stops
- ✅ **Travel Mode Selection** - Choose Flight, Train, or Bus
- ✅ **Budget Estimation** - Auto-calculates travel, stay, and activity costs
- ✅ **CRUD Operations** - Create, view, update, and delete trips
- ✅ **Database Storage** - SQLite database for data persistence
- ✅ **AI Integration** - Google Gemini API for smart estimates (with fallback)
- ✅ **Modern UI** - TailwindCSS responsive design

## Tech Stack

**Backend:**
- Node.js + Express.js
- SQLite (better-sqlite3)
- Google Gemini AI API

**Frontend:**
- HTML5 + Vanilla JavaScript
- TailwindCSS

## Getting Started

### Prerequisites
- Node.js (v16+)
- npm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/YOUR_USERNAME/globetrotter.git
cd globetrotter
```

2. Install backend dependencies:
```bash
cd backend
npm install
```

3. Create `.env` file in backend folder:
```
GEMINI_API_KEY=your_api_key_here
```

4. Start the backend server:
```bash
npm start
```
Server runs at http://localhost:5000

5. Start the frontend (in another terminal):
```bash
cd frontend
npx serve -l 3000
```
UI available at http://localhost:3000

## Pages

| Page | URL | Description |
|------|-----|-------------|
| Dashboard | `/dashboard.html` | View and manage all trips |
| Create Trip | `/create%20trip.html` | Create new trip with stops |
| Itinerary | `/itinerary.html` | View trip details and timeline |
| Budget | `/budget%20summary.html` | Cost breakdown by category |

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/trip` | List all trips |
| POST | `/api/trip` | Create a trip |
| GET | `/api/trip/:id` | Get trip with stops |
| PUT | `/api/trip/:id` | Update a trip |
| DELETE | `/api/trip/:id` | Delete a trip |
| POST | `/api/trip/:id/stops` | Add stop to trip |
| DELETE | `/api/trip/:tripId/stops/:stopId` | Remove a stop |
| POST | `/api/trip/estimate` | AI estimation (single leg) |
| POST | `/api/trip/:id/estimate-all` | AI estimation (full trip) |

## Screenshots

*Add screenshots of your app here*

## License

MIT

## Author

Built for hackathon submission
