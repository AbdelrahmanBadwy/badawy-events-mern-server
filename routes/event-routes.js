const express = require("express");
const router = express.Router();
const validateToken = require("../middlewares/validate-token");
const EventModel = require("../models/event-model");

router.post("/create-event", async (req, res) => {
  try {
    console.log("Request body:", req.body);

    // Create and save in one step
    const newEvent = await EventModel.create(req.body);

    console.log("New event created:", newEvent);

    res.status(201).json({ message: "Event created successfully", newEvent });
  } catch (error) {
    console.error("Error creating event:", error);
    res
      .status(500)
      .json({ error: "Error creating event", details: error.message });
  }
});

router.put("/edit-event/:id", validateToken, async (req, res) => {
  try {
    const updatedEvent = await EventModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedEvent) {
      return res.status(404).json({ message: "Event not found" });
    }
    res
      .status(200)
      .json({ message: "event updated successfully", updatedEvent });
  } catch (error) {
    res.status(500).json({ error: "Error updating event" });
  }
});

router.delete("/delete-event/:id", validateToken, async (req, res) => {
  try {
    const deletedEvent = await EventModel.findByIdAndDelete(req.params.id);
    if (!deletedEvent) {
      return res.status(404).json({ message: "Event not found" });
    }
    res.status(200).json({ message: "event deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error deleting event" });
  }
});
router.get("/get-events", validateToken, async (req, res) => {
  try {
    const searchText = req.query.searchText || "";
    const date = req.query.date || "";

    const events = await EventModel.find({
      name: { $regex: new RegExp(searchText, "i") },
      ...(date && { date }),
    }).sort({ createdAt: -1 });
    res.status(200).json({ data: events });
  } catch (error) {
    res.status(500).json({ error: "Error fetching events" });
  }
});

router.get("/get-event/:id", validateToken, async (req, res) => {
  try {
    const event = await EventModel.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    res.status(200).json({ data: event });
  } catch (error) {
    res.status(500).json({ error: "Error fetching event" });
  }
});

module.exports = router;
