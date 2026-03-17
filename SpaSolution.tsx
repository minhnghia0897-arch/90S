import React from 'react';
import { Link } from 'react-router-dom';

const discoverySections = [
  {
    id: 'discovery-sets',
    title: 'Bộ khám phá',
    image: 'https://picsum.photos/seed/discoverysets/1600/800',
    link: '/category/discovery-sets',
  },
  {
    id: 'classic-collection',
    title: 'Bộ sưu tập cổ điển',
    image: 'https://picsum.photos/seed/classiccollection/1600/800',
    link: '/category/classic-collection',
  },
  {
    id: 'classic-candle',
    title: 'Nến cổ điển',
    image: 'https://picsum.photos/seed/classiccandle/1600/800',
    link: '/category/classic-candle',
  },
  {
    id: 'proust-questionnaire',
    title: 'Bảng câu hỏi Proust',
    image: 'https://picsum.photos/seed/proust/1600/800',
    link: '/about/proust',
  },
];

export default function Discovery() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Breadcrumb */}
      <div className="text-xs tracking-widest uppercase mb-8 text-gray-500">
        <Link to="/" className="hover:text-black">Trang chủ</Link>
      </div>

      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold tracking-[0.2em] uppercase">Khám phá</h1>
      </div>

      {/* Stacked Sections */}
      <div className="flex flex-col gap-8">
        {discoverySections.map((section) => (
          <div key={section.id} className="relative w-full h-64 md:h-96 group overflow-hidden bg-gray-100">
            <img 
              src={section.image} 
              alt={section.title} 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-black/20 flex flex-col justify-center items-center text-white text-center p-8">
              <h2 className="text-3xl md:text-4xl font-bold tracking-[0.2em] uppercase mb-6">{section.title}</h2>
              <Link 
                to={section.link} 
                className="border border-white px-8 py-3 text-xs font-bold tracking-widest uppercase hover:bg-white hover:text-black transition-colors"
              >
                Khám phá
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
