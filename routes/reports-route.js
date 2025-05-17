const express = require("express");
const router = express.Router();
const BookingModel = require("../models/booking-model");
const EventModel = require("../models/event-model");
const validateToken = require("../middlewares/validate-token");

router.post("/get-admin-reports", validateToken, async (req, res) => {
  try {
    const { startDate, endDate, eventId } = req.body;

    let query = {};
    if (eventId) {
      query = { event: eventId };
    }
    if (startDate && endDate) {
      query = {
        ...query,
        createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        },
      };
    }

    const bookings = await BookingModel.find(query);
    console.log("Bookings:", bookings);
    const totalBookings = bookings.length;
    const cancelledBookings = bookings.filter(
      (booking) => booking.status === "cancelled"
    ).length;

    const totalTickets = bookings.reduce(
      (acc, booking) => acc + booking.ticketsCount,
      0
    );

    const cancelledTickets = bookings
      .filter((booking) => booking.status === "cancelled")
      .reduce((acc, booking) => acc + booking.ticketsCount, 0);

    const totalRevenueCollected = bookings.reduce(
      (acc, booking) => acc + booking?.totalAmount,
      0
    );
    const totalRevenueRefunded = bookings
      .filter((booking) => booking.status === "cancelled")
      .reduce((acc, booking) => acc + booking?.totalAmount, 0);

    const response = {
      totalBookings,
      cancelledBookings,
      totalTickets,
      cancelledTickets,
      totalRevenueCollected,
      totalRevenueRefunded,
    };
    if (!eventId) {
      return res.status(200).json({ data: response });
    }
    const event = await EventModel.findById(eventId);

    const ticketTypesInEvent = event.ticketTypes;

    const ticketTypesAndTheirSales = [];
    ticketTypesInEvent.forEach((ticketType) => {
      const bookingsWithTicketType = bookings.filter(
        (booking) => booking.ticketType === ticketType.name
      );
      ticketTypesAndTheirSales.push({
        name: ticketType.name,
        ticketsSold:
          bookingsWithTicketType.reduce(
            (acc, booking) => acc + booking.ticketsCount,
            0
          ) || 0,
        revenue:
          bookingsWithTicketType.reduce(
            (acc, booking) => acc + booking.totalAmount,
            0
          ) || 0,
      });
    });

    response.ticketTypesAndTheirSales = ticketTypesAndTheirSales;
    return res.status(200).json({ data: response });
  } catch (error) {
    console.error("Error fetching admin reports:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/get-user-reports", validateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const bookings = await BookingModel.find({ user: userId });
    console.log("Bookings:", bookings);
    const totalBookings = bookings.length;
    const cancelledBookings = bookings.filter(
      (booking) => booking.status === "cancelled"
    ).length;

    const totalTickets = bookings.reduce(
      (acc, booking) => acc + booking.ticketsCount,
      0
    );

    const cancelledTickets = bookings
      .filter((booking) => booking.status === "cancelled")
      .reduce((acc, booking) => acc + booking.ticketsCount, 0);

    const totalAmountSpent = bookings.reduce(
      (acc, booking) => acc + booking?.totalAmount,
      0
    );
    const totalAmountReceivedAsRefund = bookings
      .filter((booking) => booking.status === "cancelled")
      .reduce((acc, booking) => acc + booking?.totalAmount, 0);

    const response = {
      totalBookings,
      cancelledBookings,
      totalTickets,
      cancelledTickets,
      totalAmountSpent,
      totalAmountReceivedAsRefund,
    };

    return res.status(200).json({ data: response });
  } catch (error) {
    console.error("Error fetching user reports:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
