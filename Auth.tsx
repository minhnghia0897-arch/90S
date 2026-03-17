import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  const [heroBanner, setHeroBanner] = useState<any>(null);

  useEffect(() => {
    const saved = localStorage.getItem('app_banners');
    if (saved) {
      const banners = JSON.parse(saved);
      const hero = banners.find((b: any) => b.page === 'Trang chủ (Hero)' && b.status === 'Đang hiển thị');
      if (hero) setHeroBanner(hero);
    }
  }, []);

  return (
    <div className="w-full">
      {/* Hero Banner Section */}
      {heroBanner && (
        <div className="relative w-full h-[60vh] md:h-[80vh] overflow-hidden bg-gray-900">
          <img 
            src={heroBanner.image} 
            alt={heroBanner.title} 
            className="w-full h-full object-cover opacity-80"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 flex flex-col justify-center items-center text-white text-center p-8">
            <h1 className="text-4xl md:text-7xl font-bold tracking-[0.2em] uppercase mb-6 animate-in fade-in slide-in-from-bottom-8 duration-1000">
              {heroBanner.title}
            </h1>
            <Link 
              to={heroBanner.link || '/category/products'} 
              className="border border-white px-12 py-4 text-xs font-bold tracking-[0.3em] uppercase hover:bg-white hover:text-black transition-all duration-300 transform hover:scale-105"
            >
              Khám phá ngay
            </Link>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 h-[80vh]">
        {/* Left Image */}
        <div className="relative h-full w-full group overflow-hidden">
          <img 
            src="https://picsum.photos/seed/candle/1200/1600" 
            alt="Chăm sóc nến" 
            className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-black/20 flex flex-col justify-center items-center text-white text-center p-8">
            <h2 className="text-4xl md:text-5xl font-bold tracking-widest uppercase mb-4">Chăm sóc nến</h2>
            <p className="text-sm md:text-base tracking-widest uppercase mb-8">Cách chăm sóc nến của bạn</p>
            <Link to="/discovery" className="border border-white px-8 py-3 text-sm tracking-widest uppercase hover:bg-white hover:text-black transition-colors">
              Khám phá thêm
            </Link>
          </div>
        </div>

        {/* Right Image */}
        <div className="relative h-full w-full group overflow-hidden">
          <img 
            src="https://picsum.photos/seed/journal/1200/1600" 
            alt="Le Journal" 
            className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-black/20 flex flex-col justify-center items-center text-white text-center p-8">
            <h2 className="text-4xl md:text-5xl font-bold tracking-widest uppercase mb-4">Violette 30</h2>
            <p className="text-sm md:text-base tracking-widest uppercase mb-8">Sáng tạo mới của chúng tôi</p>
            <Link to="/product/violette-30" className="border border-white px-8 py-3 text-sm tracking-widest uppercase hover:bg-white hover:text-black transition-colors">
              Mua ngay
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 h-[80vh]">
        {/* Left Image 2 */}
        <div className="relative h-full w-full group overflow-hidden">
          <img 
            src="https://picsum.photos/seed/body/1200/1600" 
            alt="Body Hair Face" 
            className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-black/20 flex flex-col justify-center items-center text-white text-center p-8">
            <h2 className="text-4xl md:text-5xl font-bold tracking-widest uppercase mb-4">Cơ thể — Tóc — Mặt</h2>
            <p className="text-sm md:text-base tracking-widest uppercase mb-8">Các sáng tạo từ thực vật</p>
            <Link to="/category/body-hair-face" className="border border-white px-8 py-3 text-sm tracking-widest uppercase hover:bg-white hover:text-black transition-colors">
              Mua bộ sưu tập
            </Link>
          </div>
        </div>

        {/* Right Image 2 */}
        <div className="relative h-full w-full group overflow-hidden">
          <img 
            src="https://picsum.photos/seed/about/1200/1600" 
            alt="Về 90S Skin" 
            className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-black/20 flex flex-col justify-center items-center text-white text-center p-8">
            <h2 className="text-4xl md:text-5xl font-bold tracking-widest uppercase mb-4">Về 90S Skin</h2>
            <p className="text-sm md:text-base tracking-widest uppercase mb-8">Tuyên ngôn của chúng tôi</p>
            <Link to="/about" className="border border-white px-8 py-3 text-sm tracking-widest uppercase hover:bg-white hover:text-black transition-colors">
              Đọc tuyên ngôn
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
