

 "use client";
 
 import { useEffect, useState } from "react";
 import api, { setAuthToken } from "../../utils/api";
 import { useRouter } from "next/navigation";
 
 export default function PaymentSchedule() {
   const [payments, setPayments] = useState([]);
   const router = useRouter();
 
   useEffect(() => {
     const token = localStorage.getItem("token");
 
     if (!token) {
       router.push("/login"); // Token yoksa giriş sayfasına yönlendir
       return;
     }
 
     setAuthToken(token); // Axios'a token ekle
 
     const fetchPayments = async () => {
       try {
         const res = await api.get("/payment-schedule");
         setPayments(res.data);
       } catch (error) {
         console.error("Ödeme planları yüklenemedi", error);
         if (error.response?.status === 401) {
           localStorage.removeItem("token");
           router.push("/login"); // Yetkilendirme hatası varsa çıkış yap
         }
       }
     };
 
     fetchPayments();
   }, []);
 
   return (
     <div className="max-w-3xl mx-auto mt-10">
       <h1 className="text-2xl font-bold mb-4">Ödeme Planları</h1>
       <ul className="bg-white p-4 rounded-lg shadow-md">
         {payments.length > 0 ? (
           payments.map((p) => (
             <li key={p._id} className="border-b py-4 hover:bg-gray-50">
               <div className="flex justify-between items-start">
                 <div className="flex flex-col">
                   <span className="font-medium text-lg">{p.cardId.bankName}</span>
                   <span className="text-sm text-gray-600">Kart No: {p.cardId.lastFourDigits}</span>
                   <span className="text-sm text-gray-600">Açıklama: {p.description || "Açıklama yok"}</span>
                 </div>
                 <div className="flex flex-col items-end">
                   <span className="font-bold text-lg text-green-600">{p.totalAmountDue}₺</span>
                   <span className="text-sm text-gray-500">
                     Son Ödeme: {new Date(p.dueDate).toLocaleDateString('tr-TR')}
                   </span>
                   <span className={`text-sm mt-1 px-2 py-1 rounded-full ${
                     new Date(p.dueDate) < new Date() 
                       ? 'bg-red-100 text-red-600'
                       : 'bg-green-100 text-green-600'
                   }`}>
                     {new Date(p.dueDate) < new Date() ? 'Gecikmiş Ödeme' : 'Zamanında'}
                   </span>
                 </div>
               </div>
             </li>
           ))
         ) : (
           <p className="text-center text-gray-500 py-4">Henüz ödeme planı bulunmuyor.</p>
         )}
       </ul>
     </div>
   );
 }