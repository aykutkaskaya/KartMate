"use client";

import { useEffect, useState } from "react";
import api, { setAuthToken } from "../../utils/api";
import { useRouter } from "next/navigation";

// Harcama kategorileri
const CATEGORIES = [
  "Market",
  "Alışveriş",
  "Teknoloji",
  "Sağlık",
  "Ulaşım",
  "Eğitim",
  "Eğlence",
  "Restoran",
  "Fatura",
  "Diğer"
];

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [cards, setCards] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    date: new Date().toISOString().split('T')[0],
    cardId: "",
    merchant: "",
    category: "",
    installments: 1,
    currency: "TRY"
  });
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    setAuthToken(token);
    fetchTransactions();
    fetchCards();
  }, []);

  const fetchCards = async () => {
    try {
      const res = await api.get("/cards");
      setCards(res.data);
      // Eğer kartlar varsa, ilk kartı varsayılan olarak seç
      if (res.data.length > 0) {
        setFormData(prev => ({ ...prev, cardId: res.data[0]._id }));
      }
    } catch (error) {
      console.error("Kartlar yüklenemedi", error);
    }
  };

  const fetchTransactions = async () => {
    try {
      const res = await api.get("/transactions");
      setTransactions(res.data);
    } catch (error) {
      console.error("Harcamalar yüklenemedi", error);
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        router.push("/login");
      }
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = {
        ...formData,
        transactionDate: formData.date,
        remainingInstallments: formData.installments
      };

      if (editingTransaction) {
        await api.put(`/transactions/${editingTransaction._id}`, submitData);
      } else {
        await api.post("/transactions", submitData);
      }
      setIsModalOpen(false);
      setEditingTransaction(null);
      setFormData({
        description: "",
        amount: "",
        date: new Date().toISOString().split('T')[0],
        cardId: "",
        merchant: "",
        category: "",
        installments: 1,
        currency: "TRY"
      });
      fetchTransactions();
    } catch (error) {
      console.error("İşlem hatası", error);
      if (error.response) {
        alert(`Hata: ${error.response.data.msg || 'Harcama eklenirken bir hata oluştu'}`);
      }
    }
  };

  const handleEdit = (transaction) => {
    setEditingTransaction(transaction);
    setFormData({
      description: transaction.description,
      amount: transaction.amount,
      date: new Date(transaction.transactionDate).toISOString().split('T')[0],
      cardId: transaction.cardId,
      merchant: transaction.merchant,
      category: transaction.category,
      installments: transaction.installments,
      currency: transaction.currency
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bu harcamayı silmek istediğinizden emin misiniz?")) {
      try {
        await api.delete(`/transactions/${id}`);
        fetchTransactions();
      } catch (error) {
        console.error("Silme hatası", error);
      }
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-10 p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Harcamalarım</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Yeni Harcama Ekle
        </button>
      </div>

      {/* Harcama Listesi */}
      <div className="bg-white p-4 rounded-lg shadow-md overflow-x-auto">
        {transactions.length > 0 ? (
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  İşlem Detayı
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kategori
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tutar
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tarih
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kart
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions.map((t) => (
                <tr key={t._id} className="hover:bg-gray-50">
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div>
                      <div className="font-medium text-gray-900">{t.merchant}</div>
                      {t.description && (
                        <div className="text-sm text-gray-500">{t.description}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {t.category}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {t.amount} {t.currency}
                    </div>
                    {t.installments > 1 && (
                      <div className="text-xs text-gray-500">
                        {t.remainingInstallments}/{t.installments} Taksit
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(t.transactionDate).toLocaleDateString('tr-TR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-blue-600">
                      {cards.find(c => c._id === t.cardId)?.bankName || 'Kart Silinmiş'}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEdit(t)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      Düzenle
                    </button>
                    <button
                      onClick={() => handleDelete(t._id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Sil
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-gray-50">
                <td colSpan="2" className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                  Toplam İşlem: {transactions.length}
                </td>
                <td colSpan="4" className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                  Toplam Tutar: {transactions.reduce((acc, t) => {
                    if (t.currency === 'TRY') return acc + Number(t.amount);
                    return acc;
                  }, 0).toFixed(2)} ₺
                </td>
              </tr>
            </tfoot>
          </table>
        ) : (
          <p className="text-center py-4 text-gray-500">Henüz harcama yok.</p>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editingTransaction ? "Harcama Düzenle" : "Yeni Harcama Ekle"}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Kart Seçimi</label>
                <select
                  name="cardId"
                  value={formData.cardId}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  required
                >
                  <option value="">Kart Seçin</option>
                  {cards.map((card) => (
                    <option key={card._id} value={card._id}>
                      {card.bankName} ({card.cardNumberLast4})
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">İşlem Yeri</label>
                <input
                  type="text"
                  name="merchant"
                  value={formData.merchant}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  required
                  placeholder="Örn: Migros, Amazon, MediaMarkt"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Kategori</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  required
                >
                  <option value="">Kategori Seçin</option>
                  {CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Açıklama</label>
                <input
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Tutar</label>
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    required
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Para Birimi</label>
                  <select
                    name="currency"
                    value={formData.currency}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    required
                  >
                    <option value="TRY">TRY</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Tarih</label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Taksit</label>
                  <input
                    type="number"
                    name="installments"
                    value={formData.installments}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    required
                    min="1"
                    max="36"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingTransaction(null);
                    setFormData({
                      description: "",
                      amount: "",
                      date: new Date().toISOString().split('T')[0],
                      cardId: "",
                      merchant: "",
                      category: "",
                      installments: 1,
                      currency: "TRY"
                    });
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  {editingTransaction ? "Güncelle" : "Ekle"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}