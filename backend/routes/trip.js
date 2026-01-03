import express from "express";
import db from "../db/database.js";
import { estimateTrip, estimateItinerary } from "../services/gemini.js";

const router = express.Router();

// ==================== TRIP CRUD ====================

// Create a new trip
router.post("/", (req, res) => {
  try {
    const { name, start_date, end_date } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Trip name is required" });
    }

    const stmt = db.prepare(
      "INSERT INTO trips (name, start_date, end_date) VALUES (?, ?, ?)"
    );
    const result = stmt.run(name, start_date || null, end_date || null);

    res.status(201).json({
      id: result.lastInsertRowid,
      name,
      start_date,
      end_date,
      message: "Trip created successfully"
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create trip" });
  }
});

// Get all trips
router.get("/", (req, res) => {
  try {
    const trips = db.prepare("SELECT * FROM trips ORDER BY created_at DESC").all();
    res.json(trips);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch trips" });
  }
});

// Get a single trip with its stops
router.get("/:id", (req, res) => {
  try {
    const trip = db.prepare("SELECT * FROM trips WHERE id = ?").get(req.params.id);

    if (!trip) {
      return res.status(404).json({ error: "Trip not found" });
    }

    const stops = db.prepare(
      "SELECT * FROM stops WHERE trip_id = ? ORDER BY id"
    ).all(req.params.id);

    res.json({ ...trip, stops });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch trip" });
  }
});

// Update a trip
router.put("/:id", (req, res) => {
  try {
    const { name, start_date, end_date } = req.body;
    const stmt = db.prepare(
      "UPDATE trips SET name = ?, start_date = ?, end_date = ? WHERE id = ?"
    );
    const result = stmt.run(name, start_date, end_date, req.params.id);

    if (result.changes === 0) {
      return res.status(404).json({ error: "Trip not found" });
    }

    res.json({ message: "Trip updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update trip" });
  }
});

// Delete a trip (and its stops via CASCADE)
router.delete("/:id", (req, res) => {
  try {
    // First delete stops manually (better-sqlite3 doesn't enforce FK by default)
    db.prepare("DELETE FROM stops WHERE trip_id = ?").run(req.params.id);
    const result = db.prepare("DELETE FROM trips WHERE id = ?").run(req.params.id);

    if (result.changes === 0) {
      return res.status(404).json({ error: "Trip not found" });
    }

    res.json({ message: "Trip deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete trip" });
  }
});

// ==================== STOPS CRUD ====================

// Add a stop to a trip
router.post("/:id/stops", (req, res) => {
  try {
    const { city, mode, stay_days } = req.body;
    const trip_id = req.params.id;

    // Check if trip exists
    const trip = db.prepare("SELECT id FROM trips WHERE id = ?").get(trip_id);
    if (!trip) {
      return res.status(404).json({ error: "Trip not found" });
    }

    if (!city) {
      return res.status(400).json({ error: "City is required" });
    }

    const stmt = db.prepare(
      "INSERT INTO stops (trip_id, city, mode, stay_days) VALUES (?, ?, ?, ?)"
    );
    const result = stmt.run(trip_id, city, mode || "train", stay_days || 1);

    res.status(201).json({
      id: result.lastInsertRowid,
      trip_id: Number(trip_id),
      city,
      mode: mode || "train",
      stay_days: stay_days || 1,
      message: "Stop added successfully"
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add stop" });
  }
});

// Delete a stop
router.delete("/:tripId/stops/:stopId", (req, res) => {
  try {
    const result = db.prepare(
      "DELETE FROM stops WHERE id = ? AND trip_id = ?"
    ).run(req.params.stopId, req.params.tripId);

    if (result.changes === 0) {
      return res.status(404).json({ error: "Stop not found" });
    }

    res.json({ message: "Stop deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete stop" });
  }
});

// ==================== AI ESTIMATION ====================

// Estimate a single trip leg (existing endpoint - enhanced)
router.post("/estimate", async (req, res) => {
  try {
    const result = await estimateTrip(req.body);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "AI estimation failed", details: err.message });
  }
});

// Estimate entire trip itinerary
router.post("/:id/estimate-all", async (req, res) => {
  try {
    // Get trip and stops
    const trip = db.prepare("SELECT * FROM trips WHERE id = ?").get(req.params.id);

    if (!trip) {
      return res.status(404).json({ error: "Trip not found" });
    }

    const stops = db.prepare(
      "SELECT * FROM stops WHERE trip_id = ? ORDER BY id"
    ).all(req.params.id);

    if (stops.length === 0) {
      return res.status(400).json({ error: "No stops found for this trip" });
    }

    // Get AI estimation
    const estimation = await estimateItinerary(trip.name, stops);

    res.json(estimation);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "AI estimation failed" });
  }
});

export default router;
