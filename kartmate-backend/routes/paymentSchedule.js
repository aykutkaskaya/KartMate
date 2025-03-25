const express = require("express");
const auth = require("../middleware/auth");
const Installment = require("../models/Installment");
const Card = require("../models/Card");
const PaymentSchedule = require("../models/PaymentSchedule");

const router = express.Router();

// 📌 Ödeme Planı Hesaplama ve Kaydetme
router.post("/calculate", auth, async (req, res) => {
  try {
    const today = new Date();
    const currentMonth = today.getMonth() + 1;
    const currentYear = today.getFullYear();

    // Kullanıcının kartlarını al
    const userCards = await Card.find({ userId: req.user.userId });

    let paymentSchedule = [];

    for (let card of userCards) {
      console.log(card);
      // O kart için o ay ödenmesi gereken taksitleri bul
      const installmentsDue = await Installment.find({
        userId: req.user.userId,
        cardId: card._id,
        isPaid: false,
        dueDate: {
          $gte: new Date(currentYear, currentMonth - 1, 1), // Ayın başı
          $lt: new Date(currentYear, currentMonth, 1) // Sonraki ayın başı
        }
      });
      const totalAmountDue = installmentsDue.reduce((sum, i) => sum + i.installmentAmount, 0);

      if (totalAmountDue > 0) {
        paymentSchedule.push({
          userId: req.user.userId,
          cardId: card._id,
          totalAmountDue,
          dueDate: new Date(currentYear, currentMonth - 1, card.dueDate), // Kartın son ödeme günü
          isPaid: false
        });
      }
    }

    if (paymentSchedule.length > 0) {
      await PaymentSchedule.insertMany(paymentSchedule);
    }

    res.json(paymentSchedule);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

// 📌 Kullanıcının ödeme planını listeleme
router.get("/", auth, async (req, res) => {
  try {
    const payments = await PaymentSchedule.find({ userId: req.user.userId }).populate("cardId", "bankName");
    res.json(payments);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

// 📌 Ödeme Yapıldı Olarak İşaretleme
router.put("/:id/pay", auth, async (req, res) => {
  try {
    const payment = await PaymentSchedule.findById(req.params.id);
    if (!payment) return res.status(404).json({ msg: "Ödeme planı bulunamadı" });

    if (payment.userId.toString() !== req.user.userId) {
      return res.status(403).json({ msg: "Yetkiniz yok" });
    }

    payment.isPaid = true;
    await payment.save();

    // İlgili taksitleri de ödendi olarak işaretle
    await Installment.updateMany(
      { cardId: payment.cardId, userId: req.user.userId, dueDate: { $lte: payment.dueDate } },
      { $set: { isPaid: true } }
    );

    res.json({ msg: "Ödeme yapıldı olarak işaretlendi" });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
