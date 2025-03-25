const mongoose = require("mongoose");

const TransactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  cardId: { type: mongoose.Schema.Types.ObjectId, ref: "Card", required: true },
  amount: { type: Number, required: true },
  description: { type: String, required: true },
  currency: { type: String, default: "TRY" },
  merchant: { type: String, required: true }, // İşlem yapılan yer
  category: { type: String, required: true }, // Harcama kategorisi (Market, Teknoloji vb.)
  transactionDate: { type: Date, required: true },
  installments: { type: Number, default: 1 }, // Kaç taksit yapıldığı
  remainingInstallments: { type: Number }, // Kalan taksit sayısı
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Transaction", TransactionSchema);
