import "../styles/globals.css";
import Navbar from "../components/Navbar";

export const metadata = {
  title: "KartMate",
  description: "Kredi kartı harcamalarını takip et",
};

export default function RootLayout({ children }) {
  return (
    <html lang="tr">
      <body>
        <Navbar />
        <main className="container mx-auto p-4">{children}</main>
      </body>
    </html>
  );
}