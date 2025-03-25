const express = require("express");
const auth = require("../middleware/auth");
const Card = require("../models/Card");

const router = express.Router();

// 📌 Kullanıcının tüm kartlarını getir
router.get("/", auth, async (req, res) => {
  try {
    const cards = await Card.find({ userId: req.user.userId });
    res.json(cards);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Sunucu hatası" });
  }
});

// 📌 Yeni kart ekleme
router.post("/", auth, async (req, res) => {
  try {
    const { bankName, cardType, cardNumber, cardNumberLast4, expiryDate, cvc, cardLimit, cardDebt, cutoffDate, dueDate } = req.body;

    // Eksik alanları kontrol et
    const missingFields = [];
    if (!bankName) missingFields.push("bankName");
    if (!cardType) missingFields.push("cardType");
    if (!cardNumber) missingFields.push("cardNumber");
    if (!cardNumberLast4) missingFields.push("cardNumberLast4");
    if (!expiryDate) missingFields.push("expiryDate");
    if (!cvc) missingFields.push("cvc");
    if (!cardLimit) missingFields.push("cardLimit");
    if (!cutoffDate) missingFields.push("cutoffDate");
    if (!dueDate) missingFields.push("dueDate");

    if (missingFields.length > 0) {
      return res.status(400).json({
        msg: "Lütfen zorunlu olan eksik alanları doldurun",
        missingFields
      });
    }

    if (!/^\d{16}$/.test(cardNumber)) {
      return res.status(400).json({ msg: "Kart numarası geçersiz" });
    }

    if (!/^\d{4}$/.test(cardNumberLast4)) {
      return res.status(400).json({ msg: "Kart numarasının son 4 hanesi geçersiz" });
    }

    if (!/^\d{3,4}$/.test(cvc)) {
      return res.status(400).json({ msg: "Geçersiz CVC kodu" });
    }

    if (isNaN(cardLimit) || cardLimit <= 0) {
      return res.status(400).json({ msg: "Geçerli bir kart limiti girin" });
    }

    if (cardDebt && (isNaN(cardDebt) || cardDebt < 0)) {
      return res.status(400).json({ msg: "Kart borcu geçersiz" });
    }

    const newCard = new Card({
      userId: req.user.userId,
      bankName,
      cardType,
      cardNumber,
      cardNumberLast4,
      expiryDate: new Date(expiryDate),
      cvc,
      cardLimit,
      cardDebt: cardDebt || 0,
      cutoffDate: new Date(cutoffDate),
      dueDate: new Date(dueDate),
    });

    await newCard.save();
    res.status(201).json(newCard);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Sunucu hatası" });
  }
});

// 📌 Kart Güncelleme
router.put("/:id", auth, async (req, res) => {
  try {
    const { bankName, cardType, cardNumber, cardNumberLast4, expiryDate, cvc, cardLimit, cardDebt, cutoffDate, dueDate } = req.body;

    // Eksik alanları kontrol et
    const missingFields = [];
    if (!bankName) missingFields.push("bankName");
    if (!cardType) missingFields.push("cardType");
    if (!cardNumber) missingFields.push("cardNumber");
    if (!cardNumberLast4) missingFields.push("cardNumberLast4");
    if (!expiryDate) missingFields.push("expiryDate");
    if (!cvc) missingFields.push("cvc");
    if (!cardLimit) missingFields.push("cardLimit");
    if (!cutoffDate) missingFields.push("cutoffDate");
    if (!dueDate) missingFields.push("dueDate");

    if (missingFields.length > 0) {
      return res.status(400).json({
        msg: "Lütfen zorunlu olan eksik alanları doldurun",
        missingFields
      });
    }

    if (!/^\d{16}$/.test(cardNumber)) {
      return res.status(400).json({ msg: "Kart numarası geçersiz" });
    }

    if (!/^\d{4}$/.test(cardNumberLast4)) {
      return res.status(400).json({ msg: "Kart numarasının son 4 hanesi geçersiz" });
    }

    if (!/^\d{3,4}$/.test(cvc)) {
      return res.status(400).json({ msg: "Geçersiz CVC kodu" });
    }

    if (isNaN(cardLimit) || cardLimit <= 0) {
      return res.status(400).json({ msg: "Geçerli bir kart limiti girin" });
    }

    if (cardDebt && (isNaN(cardDebt) || cardDebt < 0)) {
      return res.status(400).json({ msg: "Kart borcu geçersiz" });
    }

    const updatedCard = await Card.findById(req.params.id);
    if (!updatedCard) return res.status(404).json({ msg: "Kart bulunamadı" });

    if (updatedCard.userId.toString() !== req.user.userId) {
      return res.status(403).json({ msg: "Yetkiniz yok" });
    }

    updatedCard.bankName = bankName;
    updatedCard.cardType = cardType;
    updatedCard.cardNumber = cardNumber;
    updatedCard.cardNumberLast4 = cardNumberLast4;
    updatedCard.expiryDate = new Date(expiryDate);
    updatedCard.cvc = cvc;
    updatedCard.cardLimit = cardLimit;
    updatedCard.cardDebt = cardDebt || 0;
    updatedCard.cutoffDate = new Date(cutoffDate);
    updatedCard.dueDate = new Date(dueDate);

    await updatedCard.save();
    res.json(updatedCard);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Sunucu hatası" });
  }
});

// 📌 Kart Silme
router.delete("/:id", auth, async (req, res) => {
  try {
    const card = await Card.findById(req.params.id);
    if (!card) return res.status(404).json({ msg: "Kart bulunamadı" });

    if (card.userId.toString() !== req.user.userId) {
      return res.status(403).json({ msg: "Yetkiniz yok" });
    }

    await card.deleteOne();
    res.json({ msg: "Kart başarıyla silindi" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Sunucu hatası" });
  }
});

module.exports = router;
