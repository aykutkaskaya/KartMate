const mongoose = require("mongoose");

const PaymentScheduleSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  cardId: { type: mongoose.Schema.Types.ObjectId, ref: "Card", required: true },
  totalAmountDue: { type: Number, required: true }, // O ay ödenmesi gereken toplam tutar
  dueDate: { type: Date, required: true }, // Kartın son ödeme tarihi
  isPaid: { type: Boolean, default: false }, // Ödeme yapıldı mı?
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("PaymentSchedule", PaymentScheduleSchema);
