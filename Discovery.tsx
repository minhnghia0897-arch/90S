import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { STORE } from '../utils/auth';

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
    (e.target as HTMLFormElement).reset();
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-20">
      <h1 className="text-3xl font-bold mb-2 uppercase tracking-widest">Liên hệ với chúng tôi</h1>
      <p className="text-gray-500 text-sm mb-12">{STORE.tagline}</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="space-y-8">
          <div className="flex items-start space-x-4">
            <Mail className="w-5 h-5 mt-1 flex-shrink-0" />
            <div><h3 className="font-bold uppercase tracking-wider text-sm">Email</h3><p className="text-sm text-gray-600">{STORE.email}</p></div>
          </div>
          <div className="flex items-start space-x-4">
            <Phone className="w-5 h-5 mt-1 flex-shrink-0" />
            <div><h3 className="font-bold uppercase tracking-wider text-sm">Hotline</h3><p className="text-sm text-gray-600">{STORE.phone}</p></div>
          </div>
          <div className="flex items-start space-x-4">
            <MapPin className="w-5 h-5 mt-1 flex-shrink-0" />
            <div><h3 className="font-bold uppercase tracking-wider text-sm">Địa chỉ</h3><p className="text-sm text-gray-600">{STORE.address}</p></div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {submitted && <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs p-3 rounded-lg">Tin nhắn đã được gửi thành công!</div>}
          <input type="text" required placeholder="Họ tên" className="w-full border border-gray-200 p-3 text-xs focus:outline-none focus:border-black" />
          <input type="email" required placeholder="Email" className="w-full border border-gray-200 p-3 text-xs focus:outline-none focus:border-black" />
          <textarea placeholder="Lời nhắn" rows={5} className="w-full border border-gray-200 p-3 text-xs focus:outline-none focus:border-black" />
          <button type="submit" className="bg-black text-white px-8 py-3 text-[11px] uppercase tracking-widest hover:bg-gray-800 transition-colors flex items-center gap-2">
            <Send size={13} /> Gửi lời nhắn
          </button>
        </form>
      </div>
    </div>
  );
}
