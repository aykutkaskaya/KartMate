"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api, { setAuthToken } from "../../utils/api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const res = await api.post("/auth/login", { email, password });

      // Token'i localStorage'e kaydet ve yetkilendirme ayarını güncelle
      localStorage.setItem("token", res.data.token);
      setAuthToken(res.data.token);

      // Navbar'ın güncellenmesini sağla
      window.dispatchEvent(new Event("storage"));

      // Profil sayfasına yönlendir
      router.push("/profile");
    } catch (error) {
      console.error("Giriş başarısız", error);
      setError(error.response?.data?.message || "Bilinmeyen bir hata oluştu. Lütfen tekrar deneyin.");
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-bold mb-4 text-center">Giriş Yap</h1>
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="E-posta"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
          <input
            type="password"
            placeholder="Şifre"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
          <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-700">
            Giriş Yap
          </button>
        </form>
      </div>
    </div>
  );
}
