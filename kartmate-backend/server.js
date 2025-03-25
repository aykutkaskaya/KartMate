require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const authRoutes = require("./routes/auth");
const cardRoutes = require("./routes/cards");
const transactionRoutes = require("./routes/transactions");
const installmentRoutes = require("./routes/installments");
const paymentScheduleRoutes = require("./routes/paymentSchedule");
const userRoutes = require("./routes/user");


const app = express();
app.use(express.json());
app.use(cors());
app.use("/api/auth", authRoutes);
app.use("/api/cards", cardRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/installments", installmentRoutes);
app.use("/api/payment-schedule", paymentScheduleRoutes);
app.use("/api/user", userRoutes);
// MongoDB bağlantısı

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

// Test endpoint
app.get("/", (req, res) => {
  res.send("KartMate API is running...");
});

// API portu
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
