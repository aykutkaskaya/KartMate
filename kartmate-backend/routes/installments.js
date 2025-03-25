const express = require("express");
const auth = require("../middleware/auth");
const Installment = require("../models/Installment");

const router = express.Router();

// 📌 Kullanıcının tüm taksitlerini getir
router.get("/", auth, async (req, res) => {
  try {
    const installments = await Installment.find({ userId: req.user.userId }).sort({ dueDate: 1 });
    res.json(installments);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

// 📌 Belirli bir kartın taksitlerini getir
router.get("/:cardId", auth, async (req, res) => {
  try {
    const installments = await Installment.find({ userId: req.user.userId, cardId: req.params.cardId }).sort({ dueDate: 1 });
    res.json(installments);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

// 📌 Yeni taksit ekleme
router.post("/", auth, async (req, res) => {
  try {
    const { cardId, transactionId, installmentNumber, installmentAmount, dueDate } = req.body;

    if (!cardId || !transactionId || !installmentNumber || !installmentAmount || !dueDate) {
      return res.status(400).json({ msg: "Lütfen zorunlu olan eksik alanları doldurun" });
    }

    const newInstallment = new Installment({
      userId: req.user.userId,
      cardId,
      transactionId,
      installmentNumber,
      installmentAmount,
      dueDate: new Date(dueDate),
    });

    await newInstallment.save();
    res.status(201).json(newInstallment);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

// 📌 Taksit Güncelleme
router.put("/:id", auth, async (req, res) => {
  try {
    const { installmentNumber, installmentAmount, dueDate } = req.body;

    const installment = await Installment.findById(req.params.id);
    if (!installment) return res.status(404).json({ msg: "Taksit bulunamadı" });

    if (installment.userId.toString() !== req.user.userId) {
      return res.status(403).json({ msg: "Yetkiniz yok" });
    }

    installment.installmentNumber = installmentNumber;
    installment.installmentAmount = installmentAmount;
    installment.dueDate = new Date(dueDate);

    await installment.save();
    res.json(installment);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

// 📌 Taksit Silme
router.delete("/:id", auth, async (req, res) => {
  try {
    const installment = await Installment.findById(req.params.id);
    if (!installment) return res.status(404).json({ msg: "Taksit bulunamadı" });

    if (installment.userId.toString() !== req.user.userId) {
      return res.status(403).json({ msg: "Yetkiniz yok" });
    }

    await installment.deleteOne();
    res.json({ msg: "Taksit başarıyla silindi" });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
