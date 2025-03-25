const mongoose = require("mongoose");

const InstallmentSchema = new mongoose.Schema({
  transactionId: { type: mongoose.Schema.Types.ObjectId, ref: "Transaction", required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  cardId: { type: mongoose.Schema.Types.ObjectId, ref: "Card", required: true },
  installmentNumber: { type: Number, required: true }, // 1. taksit, 2. taksit vb.
  installmentAmount: { type: Number, required: true },
  dueDate: { type: Date, required: true },
  isPaid: { type: Boolean, default: false },
});

module.exports = mongoose.model("Installment", InstallmentSchema);
