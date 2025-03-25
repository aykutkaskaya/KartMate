"use client";

import { useEffect, useState } from "react";
import api, { setAuthToken } from "../../utils/api";
import { useRouter } from "next/navigation";

export default function Installments() {
  const [installments, setInstallments] = useState([]);
  const [filteredInstallments, setFilteredInstallments] = useState([]);
  const [cards, setCards] = useState({});
  const [transactions, setTransactions] = useState({});
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const router = useRouter();

  const months = [
    { value: "0", label: "Ocak" },
    { value: "1", label: "Şubat" },
    { value: "2", label: "Mart" },
    { value: "3", label: "Nisan" },
    { value: "4", label: "Mayıs" },
    { value: "5", label: "Haziran" },
    { value: "6", label: "Temmuz" },
    { value: "7", label: "Ağustos" },
    { value: "8", label: "Eylül" },
    { value: "9", label: "Ekim" },
    { value: "10", label: "Kasım" },
    { value: "11", label: "Aralık" }
  ];

  const years = Array.from(
    { length: 5 },
    (_, i) => new Date().getFullYear() - 2 + i
  );

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    setAuthToken(token);
    fetchData();
  }, []);

  useEffect(() => {
    filterInstallments();
  }, [selectedMonth, selectedYear, installments]);

  const fetchData = async () => {
    try {
      const [cardsRes, installmentsRes, transactionsRes] = await Promise.all([
        api.get("/cards"),
        api.get("/installments"),
        api.get("/transactions")
      ]);

      const cardsMap = {};
      cardsRes.data.forEach(card => {
        cardsMap[card._id] = card;
      });
      setCards(cardsMap);

      const transactionsMap = {};
      transactionsRes.data.forEach(transaction => {
        if (transaction._id && transaction.description) {
          transactionsMap[transaction._id] = {
            ...transaction,
            description: transaction.description || transaction.merchantName || "Tanımsız İşlem"
          };
        }
      });
      setTransactions(transactionsMap);

      const installmentsWithTransactions = installmentsRes.data.map(installment => ({
        ...installment,
        transactionDetails: transactionsMap[installment.transactionId] || {}
      }));

      setInstallments(installmentsWithTransactions);
      setFilteredInstallments(installmentsWithTransactions);
    } catch (error) {
      console.error("Veriler yüklenemedi", error);
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        router.push("/login");
      }
    }
  };

  const filterInstallments = () => {
    let filtered = [...installments];
    
    if (selectedMonth !== "" || selectedYear !== "") {
      filtered = installments.filter(i => {
        const dueDate = new Date(i.dueDate);
        const monthMatch = selectedMonth === "" || dueDate.getMonth() === parseInt(selectedMonth);
        const yearMatch = selectedYear === "" || dueDate.getFullYear() === parseInt(selectedYear);
        return monthMatch && yearMatch;
      });
    }

    setFilteredInstallments(filtered);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR');
  };

  return (
    <div className="max-w-6xl mx-auto mt-10 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Taksitlerim</h1>
        <div className="flex gap-4">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="border rounded-md p-2"
          >
            <option value="">Ay Seçin</option>
            {months.map((month) => (
              <option key={month.value} value={month.value}>
                {month.label}
              </option>
            ))}
          </select>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="border rounded-md p-2"
          >
            <option value="">Yıl Seçin</option>
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-50 text-left">
              <th className="px-6 py-3 text-sm font-semibold text-gray-600">İşlem</th>
              <th className="px-6 py-3 text-sm font-semibold text-gray-600">İşlem Detayı</th>
              <th className="px-6 py-3 text-sm font-semibold text-gray-600">Banka</th>
              <th className="px-6 py-3 text-sm font-semibold text-gray-600">Kart</th>
              <th className="px-6 py-3 text-sm font-semibold text-gray-600">Taksit</th>
              <th className="px-6 py-3 text-sm font-semibold text-gray-600">Tutar</th>
              <th className="px-6 py-3 text-sm font-semibold text-gray-600">Vade</th>
              <th className="px-6 py-3 text-sm font-semibold text-gray-600">Durum</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredInstallments.length > 0 ? (
              filteredInstallments.map((i) => (
                <tr key={i._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      {transactions[i.transactionId]?.description || "Tanımsız İşlem"}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">{cards[i.cardId]?.bankName || "Banka bilgisi yok"}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      {cards[i.cardId] ? `**** ${cards[i.cardId].cardNumber.slice(-4)}` : "Kart bilgisi yok"}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">{i.installmentNumber}. Taksit</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium">{i.installmentAmount}₺</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">{formatDate(i.dueDate)}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      i.isPaid 
                        ? "bg-green-100 text-green-800" 
                        : "bg-red-100 text-red-800"
                    }`}>
                      {i.isPaid ? "Ödendi" : "Ödenmedi"}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="px-6 py-4 text-center text-gray-500">
                  Gösterilecek taksit bulunamadı.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
