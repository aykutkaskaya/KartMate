const e = require("cors");
const mongoose = require("mongoose");

const CardSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  bankName: { type: String, required: true },
  cardType: { type: String, required: true },
  cardNumber: { type: String, required: true },
  cardNumberLast4: { type: String, required: true },
  expiryDate: { type: String, required: true },
  cvc: { type: String, required: true },
  cardLimit: { type: Number, required: true },
  cardDebt: { type: Number, default: 0 },
  cutoffDate: { type: Number, required: true }, // Ekstre kesim günü
  dueDate: { type: Number, required: true }, // Son ödeme günü
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Card", CardSchema);
