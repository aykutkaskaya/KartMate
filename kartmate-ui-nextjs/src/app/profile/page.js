"use client";

import { useEffect, useState } from "react";
import api, { setAuthToken } from "../../utils/api";
import { useRouter } from "next/navigation";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [claims, setClaims] = useState(null);
  const router = useRouter();

   
  useEffect(() => {
    const storedToken = localStorage.getItem("token");

    if (!storedToken) {
      router.push("/login"); // Token yoksa giriş sayfasına yönlendir
      return;
    }

    setAuthToken(storedToken); // Axios'a token ekle
    setToken(storedToken);

    // Token içeriğini decode et ve claim'leri al
    try {
      const tokenPayload = JSON.parse(atob(storedToken.split(".")[1])); // JWT decode
      setClaims(tokenPayload);
    } catch (error) {
      console.error("Token çözümlenemedi", error);
    }

    const fetchProfile = async () => {
      try {
        const res = await api.get("/user/profile");
        setUser(res.data);
      } catch (error) {
        console.error("Profil yüklenemedi", error);
        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          router.push("/login"); // Yetkilendirme hatası varsa çıkış yap
        }
      }
    };

    fetchProfile();
  }, []);

  return (
    <div className="max-w-md mx-auto mt-10 bg-white p-6 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-4">Profil Bilgileri</h1>
      {user ? (
        <div>
          <p className="text-lg"><strong>İsim:</strong> {user.name}</p>
          <p className="text-lg"><strong>Email:</strong> {user.email}</p>
        </div>
      ) : (
        <p className="text-gray-500">Yükleniyor...</p>
      )}

      {token && (
        <div className="mt-6">
          <h2 className="text-xl font-bold">JWT Token</h2>
          <p className="break-all bg-gray-100 p-2 rounded">{token}</p>
        </div>
      )}

      {claims && (
        <div className="mt-6">
          <h2 className="text-xl font-bold">Token İçeriği</h2>
          <ul className="bg-gray-100 p-2 rounded">
            {Object.entries(claims).map(([key, value]) => (
              <li key={key}><strong>{key}:</strong> {JSON.stringify(value)}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
