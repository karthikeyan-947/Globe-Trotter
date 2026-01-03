import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import tripRoutes from "./routes/trip.js";

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/trip", tripRoutes);

// Health check endpoint
app.get("/", (req, res) => {
  res.json({
    status: "running",
    message: "GlobeTrotter Backend API",
    endpoints: {
      "GET /api/trip": "List all trips",
      "POST /api/trip": "Create a new trip",
      "GET /api/trip/:id": "Get trip with stops",
      "PUT /api/trip/:id": "Update a trip",
      "DELETE /api/trip/:id": "Delete a trip",
      "POST /api/trip/:id/stops": "Add stop to trip",
      "DELETE /api/trip/:tripId/stops/:stopId": "Delete a stop",
      "POST /api/trip/estimate": "Estimate single leg",
      "POST /api/trip/:id/estimate-all": "Estimate full itinerary"
    }
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🌍 GlobeTrotter server running on port ${PORT}`);
  console.log(`📍 API available at http://localhost:${PORT}/api/trip`);
});
