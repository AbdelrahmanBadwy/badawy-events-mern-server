const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();
const { connectDB } = require("./config/db-config");
const mongoose = require("mongoose");
//routers
const userRouter = require("./routes/users-routes");
const eventRouter = require("./routes/event-routes");
const paymentRouter = require("./routes/payment-routes");
const bookingRouter = require("./routes/bookings-route");
const reportsRouter = require("./routes/reports-route");
const app = express();

app.use(
  cors({
    credentials: true,
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type"],
  })
);

// app.use((req, res, next) => {
//   res.setHeader("Access-Control-Allow-Origin", "*");
//   res.setHeader(
//     "Access-Control-Allow-Methods",
//     "OPTIONS, GET, POST, PUT, PATCH, DELETE"
//   );
//   res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
//   if (req.method === "OPTIONS") {
//     return res.sendStatus(200);
//   }
//   next();
// });
connectDB();
app.use(express.json());
app.use(cookieParser());
app.use("/api/users", userRouter);
app.use("/api/events", eventRouter);
app.use("/api/payments", paymentRouter);
app.use("/api/bookings", bookingRouter);
app.use("/api/reports", reportsRouter);
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
