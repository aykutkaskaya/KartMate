export default function Home() {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
        <h1 className="text-4xl font-bold text-blue-600 mb-4">KartMate'e Hoşgeldiniz</h1>
        <p className="text-lg text-gray-700 mb-6 text-center max-w-2xl">
          Kredi kartı harcamalarınızı ve taksitlerinizi kolayca yönetin. Gelir-giderlerinizi takip edin
          ve finansal durumunuzu kontrol altına alın.
        </p>
        <a href="/login" className="px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700">
          Giriş Yap
        </a>
      </div>
    );
}