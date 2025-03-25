const express = require("express");
const auth = require("../middleware/auth");
const Transaction = require("../models/Transaction");
const Installment = require("../models/Installment");

const router = express.Router();

// 📌 Kullanıcının tüm harcamalarını getir
router.get("/", auth, async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.user.userId });
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

// 📌 Yeni harcama ekleme
router.post("/", auth, async (req, res) => {
  try {
    const { cardId, amount, merchant, category,description, transactionDate, installments } = req.body;

    // Eksik alanları kontrol et
    const missingFields = [];
    if (!cardId) missingFields.push("cardId");
    if (!amount) missingFields.push("amount");
    if (!merchant) missingFields.push("merchant");
    if (!category) missingFields.push("category");
    if (!transactionDate) missingFields.push("transactionDate");
    if (!installments) missingFields.push("installments");
    if (!description) missingFields.push("description");

    if (missingFields.length > 0) {
      return res.status(400).json({
        msg: "Lütfen zorunlu olan eksik alanları doldurun",
        missingFields
      });    }

    const newTransaction = new Transaction({
      userId: req.user.userId,
      cardId,
      amount,
      merchant,
      description,
      category,
      transactionDate,
      installments: installments || 1,
      remainingInstallments: installments || 1,
    });

    await newTransaction.save();

    // Taksitli işlemse taksitleri oluştur
    if (installments > 1) {
      const installmentAmount = amount / installments;
      let installmentData = [];

      for (let i = 1; i <= installments; i++) {
        let dueDate = new Date(transactionDate);
        dueDate.setMonth(dueDate.getMonth() + i); // Her ay bir taksit

        installmentData.push({
          transactionId: newTransaction._id,
          userId: req.user.userId,
          cardId,
          installmentNumber: i,
          installmentAmount,
          dueDate,
        });
      }

      await Installment.insertMany(installmentData);
    }

    res.status(201).json(newTransaction);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

// 📌 Harcama Güncelleme
router.put("/:id", auth, async (req, res) => {
  try {
    const { amount, merchant, category, description, transactionDate, installments } = req.body;

    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) return res.status(404).json({ msg: "Harcama bulunamadı" });

    if (transaction.userId.toString() !== req.user.userId) {
      return res.status(403).json({ msg: "Yetkiniz yok" });
    }

    transaction.amount = amount;
    transaction.merchant = merchant;
    transaction.category = category;
    transaction.description = description;
    transaction.transactionDate = new Date(transactionDate);
    transaction.installments = installments || 1;
    transaction.remainingInstallments = installments || 1;

    await transaction.save();
    res.json(transaction);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

// 📌 Harcama Silme
router.delete("/:id", auth, async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) return res.status(404).json({ msg: "Harcama bulunamadı" });

    if (transaction.userId.toString() !== req.user.userId) {
      return res.status(403).json({ msg: "Yetkiniz yok" });
    }

    // İlgili taksitleri de sil
    await Installment.deleteMany({ transactionId: transaction._id });
    await transaction.deleteOne();
    res.json({ msg: "Harcama ve ilgili taksitler başarıyla silindi" });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
