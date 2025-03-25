"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuthStatus = () => {
      if (typeof window !== "undefined" && window.localStorage) {
        setIsAuthenticated(!!window.localStorage.getItem("token"));
      }
    };

    if (typeof window !== "undefined") {
      checkAuthStatus(); // Sayfa ilk yüklendiğinde kontrol et
      window.addEventListener("storage", checkAuthStatus);
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("storage", checkAuthStatus);
      }
    };
  }, []);

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("token");
      setIsAuthenticated(false);
      window.dispatchEvent(new Event("storage")); // Manuel olarak event tetikle
      router.push("/login");
    }
  };

  const linkClass = (path) =>
    `hover:text-gray-300 transition duration-300 pb-1 ${
      pathname === path ? "border-b-2 font-bold" : ""
    }`;

  return (
    <nav className="p-4 bg-gradient-to-r from-blue-500 to-blue-700 text-white flex justify-between items-center shadow-lg rounded-b-lg">
      <div className="text-2xl font-bold tracking-wide">
        <Link href="/">KartMate</Link>
      </div>

      <div className="hidden md:flex space-x-6">
        {isAuthenticated ? (
          <>
            <Link href="/profile" className={linkClass("/profile")}>Profil</Link>
            <Link href="/cards" className={linkClass("/cards")}>Kartlar</Link>
            <Link href="/transactions" className={linkClass("/transactions")}>Harcamalar</Link>
            <Link href="/installments" className={linkClass("/installments")}>Taksitler</Link>
            <Link href="/payment-schedule" className={linkClass("/payment-schedule")}>Ödeme Planı</Link>
            <button 
              onClick={handleLogout} 
              className="ml-4 bg-red-600 px-4 py-2 rounded-lg shadow hover:bg-red-800 transition duration-300">
              Çıkış Yap
            </button>
          </>
        ) : (
          <>
            <Link href="/login" className={linkClass("/login")}>Giriş Yap</Link>
            <Link href="/register" className={linkClass("/register")}>Kayıt Ol</Link>
          </>
        )}
      </div>
    </nav>
  );
}