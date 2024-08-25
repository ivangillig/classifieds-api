import express from "express";
import Location from "../models/Location.js";

const router = express.Router();

// @desc    Get all the subcountries (states/provinces) of Argentina
// @route   GET /locations/states
router.get("/states", async (req, res) => {
  try {
    const states = await Location.find({ country: "Argentina" }).distinct(
      "subcountry"
    );
    res.json(states); // Wrap the array of states in an object with a "data" key
  } catch (error) {
    console.error("Error retrieving states:", error);
    res
      .status(500)
      .json({ message: "Error retrieving states", error: error.message });
  }
});

// @desc    Get all the cities of a specific state
// @route   GET /locations/cities/:state
router.get("/cities/:state", async (req, res) => {
  try {
    const cities = await Location.find({ subcountry: req.params.state }).select(
      "name"
    );
    res.json(cities); // Wrap the array of cities in an object with a "data" key
  } catch (error) {
    console.error("Error retrieving cities:", error);
    res
      .status(500)
      .json({ message: "Error retrieving cities", error: error.message });
  }
});

export default router;
