const express = require("express");
const router = express.Router();
const BookingModel = require("../models/booking-model");
const validateToken = require("../middlewares/validate-token");
const EventModel = require("../models/event-model");
const UserModel = require("../models/user-model");
const sendEmail = require("../helpers/send-email");
const e = require("express");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

router.post("/create-booking", validateToken, async (req, res) => {
  try {
    req.body.user = req.user.id;
    console.log("Creating booking for user:", req.body.user);
    console.log("Booking details:", req.body);
    const booking = await BookingModel.create(req.body);

    const event = await EventModel.findById(req.body.event);
    const ticketTypes = event.ticketTypes;

    const updatedTicketTypes = ticketTypes.map((ticketType) => {
      if (ticketType.name === req.body.ticketType) {
        ticketType.booked =
          Number(ticketType.booked ?? 0) + Number(req.body.ticketsCount);

        ticketType.available =
          Number(ticketType.available ?? ticketType.limit) -
          Number(req.body.ticketsCount);
      }
      return ticketType;
    });
    await EventModel.findByIdAndUpdate(
      req.body.event,
      { ticketTypes: updatedTicketTypes },
      { new: true }
    );
    const userObj = await UserModel.findById(req.body.user);
    // send confirmation email
    const emailPayload = {
      email: userObj.email,
      subject: "Booking Confirmation",
      text: `Your booking for ${event.name} has been confirmed.`,
      html: `<h1>Your booking for ${event.name} has been confirmed.</h1>
             <p>Booking ID: ${booking._id}</p>
             <p>Event: ${event.name}</p>
             <p>Date: ${event.date}</p>
             <p>Time: ${event.time}</p>
             <p>Tickets Count: ${req.body.ticketsCount}</p>
             <p>Ticket Type: ${req.body.ticketType}</p>`,
    };
    await sendEmail(emailPayload);
    res
      .status(201)
      .json({ message: "Booking created successfully", data: booking });
  } catch (error) {
    console.error("Error creating booking:", error);
    res.status(500).json({ error: "Error creating booking" });
  }
});

router.get("/get-user-bookings", validateToken, async (req, res) => {
  try {
    console.log("Fetching user bookings for user:", req.user.id);
    console.log("Fetching user bookings for user:", req.user._id);

    let userId = req.user.id;
    const bookings = await BookingModel.find({ user: userId })
      .populate("event")
      .sort({ createdAt: -1 })
      .catch((err) => {
        console.error("Error fetching bookings from database:", err);
        throw new Error("Database query failed");
      });
    res.status(200).json({ data: bookings });
  } catch (error) {
    console.error("Error fetching user bookings:", error);
    res.status(500).json({ error: "Error fetching user bookings" });
  }
});

router.post("/cancel-booking", validateToken, async (req, res) => {
  try {
    const { eventId, paymentId, bookingId, ticketsCount, ticketTypeName } =
      req.body;
    const refund = await stripe.refunds.create({
      payment_intent: paymentId,
    });
    if (refund.status === "succeeded") {
      await BookingModel.findByIdAndUpdate(bookingId, {
        status: "cancelled",
      });
      const event = await EventModel.findById(eventId);
      const ticketTypes = event.ticketTypes;

      const updatedTicketTypes = ticketTypes.map((ticketType) => {
        if (ticketType.name === ticketTypeName) {
          ticketType.booked =
            Number(ticketType.booked ?? 0) - Number(ticketsCount);

          ticketType.available =
            Number(ticketType.available ?? ticketType.limit) +
            Number(ticketsCount);
        }
        return ticketType;
      });
      await EventModel.findByIdAndUpdate(
        eventId,
        { ticketTypes: updatedTicketTypes },
        { new: true }
      );
      const userObj = await UserModel.findById(req.user.id);
      // send cancellation email
      const emailPayload = {
        email: userObj.email,
        subject: "Booking Cancellation",
        text: `Your booking for ${event.name} has been cancelled.`,
        html: `<h1>Your booking for ${event.name} has been cancelled.</h1>
               <p>Booking ID: ${bookingId}</p>
               <p>Event: ${event.name}</p>
               <p>Date: ${event.date}</p>
               <p>Time: ${event.time}</p>
               <p>Tickets Count: ${ticketsCount}</p>
               <p>Ticket Type: ${ticketTypeName}</p>`,
      };
      await sendEmail(emailPayload);
      console.log("Cancellation email sent to:", userObj.email);
      console.log("Booking cancelled successfully:", bookingId);
      res.status(200).json({ message: "Booking cancelled successfully" });
    } else {
      return res.status(400).json({ error: "Refund failed" });
    }
  } catch (error) {
    console.error("Error cancelling booking:", error);
    res.status(500).json({ error: "Error cancelling booking" });
  }
});

router.get("/get-all-bookings", validateToken, async (req, res) => {
  try {
    const bookings = await BookingModel.find()
      .populate("event")
      .populate("user")
      .sort({ createdAt: -1 })
      .catch((err) => {
        console.error("Error fetching bookings from database:", err);
        throw new Error("Database query failed");
      });
    res.status(200).json({ data: bookings });
  } catch (error) {
    console.error("Error fetching all bookings:", error);
    res.status(500).json({ error: "Error fetching all bookings" });
  }
});

module.exports = router;
