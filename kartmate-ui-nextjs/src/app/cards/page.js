"use client";

import { useEffect, useState } from "react";
import api, { setAuthToken } from "../../utils/api";
import { useRouter } from "next/navigation";

export default function Cards() {
  const [cards, setCards] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    bankName: "",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardType: "",
    cardLimit: "",
    cutoffDate: "",
    dueDate: ""
  });
  const [editingCard, setEditingCard] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    setAuthToken(token);
    fetchCards();
  }, []);

  const fetchCards = async () => {
    try {
      const res = await api.get("/cards");
      setCards(res.data);
    } catch (error) {
      console.error("Kartlar yüklenemedi", error);
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        router.push("/login");
      }
    }
  };

  const formatCardNumber = (value) => {
    // Sadece rakamları al
    const numbers = value.replace(/\D/g, '');
    // 4'lü gruplar halinde formatla
    return numbers.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
  };

  const formatExpiryDate = (value) => {
    // Sadece rakamları al
    const numbers = value.replace(/\D/g, '');
    if (numbers.length >= 2) {
      // MM/YY formatına çevir
      return `${numbers.slice(0, 2)}/${numbers.slice(2, 4)}`;
    }
    return numbers;
  };

  const formatCVV = (value) => {
    // Sadece rakamları al ve 3-4 karakterle sınırla
    return value.replace(/\D/g, '').slice(0, 4);
  };

  const validateForm = () => {
    const cardNumberClean = formData.cardNumber.replace(/\s/g, '');
    if (cardNumberClean.length < 16) {
      alert('Geçerli bir kart numarası giriniz');
      return false;
    }

    const [month, year] = formData.expiryDate.split('/');
    if (!month || !year || month > 12 || month < 1) {
      alert('Geçerli bir son kullanma tarihi giriniz (AA/YY)');
      return false;
    }

    if (formData.cvv.length < 3) {
      alert('Geçerli bir CVV giriniz');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const cleanedFormData = {
      ...formData,
      cardNumber: formData.cardNumber.replace(/\s/g, ''),
      cardNumberLast4: formData.cardNumber.slice(-4),
      expiryDate: formData.expiryDate.trim(),
      cvc: formData.cvv.trim(),
      cardLimit: parseFloat(formData.cardLimit) || 0,
      cutoffDate: parseInt(formData.cutoffDate) || 1,
      dueDate: parseInt(formData.dueDate) || 1
    };

    try {
      if (editingCard) {
        await api.put(`/cards/${editingCard._id}`, cleanedFormData);
      } else {
        await api.post("/cards", cleanedFormData);
      }
      setShowForm(false);
      setFormData({ bankName: "", cardNumber: "", expiryDate: "", cvc: "", cardType: "", cardLimit: "", cutoffDate: "", dueDate: "" });
      setEditingCard(null);
      fetchCards();
    } catch (error) {
      console.error("Kart işlemi başarısız", error);
      console.error(error.response.data.msg);
      console.error(error.response.data.missingFields);
      if (error.response) {
        alert(`Hata: ${error.response.data.msg + "\n" + error.response.data.missingFields  || 'Kart eklenirken bir hata oluştu'}`);
      }
    }
  };

  const handleEdit = (card) => {
    setFormData({
      bankName: card.bankName,
      cardNumber: card.cardNumber,
      expiryDate: card.expiryDate || "",
      cvv: card.cvv || "",
      cardType: card.cardType || "",
      cardLimit: card.cardLimit?.toString() || "",
      cutoffDate: card.cutoffDate?.toString() || "",
      dueDate: card.dueDate?.toString() || ""
    });
    setEditingCard(card);
    setShowForm(true);
  };

  const handleDelete = async (cardId) => {
    if (window.confirm("Bu kartı silmek istediğinizden emin misiniz?")) {
      try {
        await api.delete(`/cards/${cardId}`);
        fetchCards();
      } catch (error) {
        console.error("Kart silinemedi", error);
      }
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Kartlarım</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          {showForm ? "İptal" : "Yeni Kart Ekle"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-4 rounded-lg shadow-md mb-4">
          <div className="grid gap-4">
            <div>
              <label className="block mb-1">Banka Adı</label>
              <input
                type="text"
                value={formData.bankName}
                onChange={(e) => setFormData({...formData, bankName: e.target.value})}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block mb-1">Kart Numarası</label>
              <input
                type="text"
                value={formData.cardNumber}
                onChange={(e) => setFormData({...formData, cardNumber: formatCardNumber(e.target.value)})}
                className="w-full p-2 border rounded"
                maxLength="19"
                placeholder="1234 5678 9012 3456"
                required
              />
            </div>
            <div>
              <label className="block mb-1">Son Kullanma Tarihi</label>
              <input
                type="text"
                value={formData.expiryDate}
                onChange={(e) => setFormData({...formData, expiryDate: formatExpiryDate(e.target.value)})}
                className="w-full p-2 border rounded"
                maxLength="5"
                placeholder="MM/YY"
                required
              />
            </div>
            <div>
              <label className="block mb-1">CVC/CVV</label>
              <input
                type="text"
                value={formData.cvv}
                onChange={(e) => setFormData({...formData, cvv: formatCVV(e.target.value)})}
                className="w-full p-2 border rounded"
                maxLength="4"
                placeholder="123"
                required
              />
            </div>
            <div>
              <label className="block mb-1">Kart Tipi</label>
              <select
                value={formData.cardType}
                onChange={(e) => setFormData({...formData, cardType: e.target.value})}
                className="w-full p-2 border rounded"
                required
              >
                <option value="">Seçiniz</option>
                <option value="CREDIT">Kredi Kartı</option>
                <option value="DEBIT">Banka Kartı</option>
                <option value="PREPAID">Ön Ödemeli Kart</option>
              </select>
            </div>
            <div>
              <label className="block mb-1">Kart Limiti</label>
              <input
                type="number"
                value={formData.cardLimit}
                onChange={(e) => setFormData({...formData, cardLimit: e.target.value})}
                className="w-full p-2 border rounded"
                min="0"
                step="0.01"
                required
              />
            </div>
            <div>
              <label className="block mb-1">Hesap Kesim Günü</label>
              <input
                type="number"
                value={formData.cutoffDate}
                onChange={(e) => setFormData({...formData, cutoffDate: e.target.value})}
                className="w-full p-2 border rounded"
                min="1"
                max="31"
                required
              />
            </div>
            <div>
              <label className="block mb-1">Son Ödeme Günü</label>
              <input
                type="number"
                value={formData.dueDate}
                onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                className="w-full p-2 border rounded"
                min="1"
                max="31"
                required
              />
            </div>
            <button
              type="submit"
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              {editingCard ? "Güncelle" : "Kaydet"}
            </button>
          </div>
        </form>
      )}

      <div className="bg-white p-4 rounded-lg shadow-md">
        {cards.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {cards.map((card) => (
              <li key={card._id} className="py-3 flex justify-between items-center">
                <div>
                  <strong>{card.bankName}</strong>
                  <p className="text-gray-600">{card.cardNumber}</p>
                  {card.expiryDate && <p className="text-sm text-gray-500">Son Kullanma: {card.expiryDate}</p>}
                  <p className="text-sm text-gray-500">Kart Tipi: {card.cardType === 'CREDIT' ? 'Kredi Kartı' : card.cardType === 'DEBIT' ? 'Banka Kartı' : 'Ön Ödemeli Kart'}</p>
                  <p className="text-sm text-gray-500">Limit: {card.cardLimit?.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</p>
                  <p className="text-sm text-gray-500">Hesap Kesim: Her ayın {card.cutoffDate}. günü</p>
                  <p className="text-sm text-gray-500">Son Ödeme: Her ayın {card.dueDate}. günü</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(card)}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    Düzenle
                  </button>
                  <button
                    onClick={() => handleDelete(card._id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Sil
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p>Kart bulunamadı.</p>
        )}
      </div>
    </div>
  );
}