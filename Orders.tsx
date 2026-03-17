import React, { useState, useEffect } from 'react';
import { Upload, Image as ImageIcon, Plus, Trash2, Edit2, Save, X } from 'lucide-react';
import { STORE } from '../../utils/auth';

const CATEGORIES = ['Cleansing','Toner & Mist','Cream','Special Treatment','Mask','Sun Protection','Professional Spa Line','Beauty Tools','Gift'];
const PAGES = ['Trang chủ (Hero)','Trang Discovery','Skin Science','Spa Solution','News','About Us'];

const INITIAL_BANNERS = [
  { id: 1, type: 'Hero Home', title: `${STORE.name} — Chăm sóc da thuần Việt`, page: 'Trang chủ (Hero)', image: 'https://picsum.photos/seed/hero90s/1920/600', status: 'Đang hiển thị', link: '/' },
  { id: 2, type: 'Category Banner', title: 'Làm sạch sâu & Dịu nhẹ', page: 'Cleansing', image: 'https://picsum.photos/seed/cleansing/1920/400', status: 'Đang hiển thị', link: '/category/cleansing' },
  { id: 3, type: 'Category Banner', title: 'Cân bằng & Tươi mới', page: 'Toner & Mist', image: 'https://picsum.photos/seed/toner/1920/400', status: 'Đang hiển thị', link: '/category/toner-mist' },
  { id: 4, type: 'Category Banner', title: 'Dưỡng ẩm chuyên sâu', page: 'Cream', image: 'https://picsum.photos/seed/cream/1920/400', status: 'Đang hiển thị', link: '/category/cream' },
  { id: 5, type: 'Category Banner', title: 'Điều trị đặc biệt', page: 'Special Treatment', image: 'https://picsum.photos/seed/special/1920/400', status: 'Đang hiển thị', link: '/category/special-treatment' },
  { id: 6, type: 'Category Banner', title: 'Mặt nạ dưỡng da', page: 'Mask', image: 'https://picsum.photos/seed/mask/1920/400', status: 'Đang hiển thị', link: '/category/mask' },
  { id: 7, type: 'Category Banner', title: 'Bảo vệ da tối ưu', page: 'Sun Protection', image: 'https://picsum.photos/seed/sun/1920/400', status: 'Đang hiển thị', link: '/category/sun-protection' },
  { id: 8, type: 'Category Banner', title: 'Dòng Spa chuyên nghiệp', page: 'Professional Spa Line', image: 'https://picsum.photos/seed/pro/1920/400', status: 'Đang hiển thị', link: '/category/professional-spa-line' },
  { id: 9, type: 'Category Banner', title: 'Dụng cụ làm đẹp', page: 'Beauty Tools', image: 'https://picsum.photos/seed/tools/1920/400', status: 'Đang hiển thị', link: '/category/beauty-tools' },
  { id: 10, type: 'Category Banner', title: 'Quà tặng ý nghĩa', page: 'Gift', image: 'https://picsum.photos/seed/gift/1920/400', status: 'Đang hiển thị', link: '/category/gift' },
];

export default function AdminBanners() {
  const [banners, setBanners] = useState(() => {
    const saved = localStorage.getItem('app_banners');
    return saved ? JSON.parse(saved) : INITIAL_BANNERS;
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [current, setCurrent] = useState<any>(null);
  const [filterType, setFilterType] = useState('Tất cả');
  const [tempImageUrl, setTempImageUrl] = useState('');
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => { localStorage.setItem('app_banners', JSON.stringify(banners)); }, [banners]);

  useEffect(() => {
    if (isModalOpen) setTempImageUrl(current?.image || '');
  }, [isModalOpen, current]);

  const filtered = banners.filter((b: any) => filterType === 'Tất cả' || b.type === filterType);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setTempImageUrl(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data = { title: fd.get('title') as string, type: fd.get('type') as string, page: fd.get('page') as string, link: fd.get('link') as string, status: fd.get('status') as string, image: tempImageUrl || `https://picsum.photos/seed/${Date.now()}/1920/600` };
    if (current?.id) { setBanners(banners.map((b: any) => b.id === current.id ? { ...b, ...data } : b)); }
    else { setBanners([{ id: Date.now(), ...data }, ...banners]); }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div><h1 className="text-2xl font-bold tracking-tight uppercase">Quản lý Banner & Hero</h1><p className="text-xs text-gray-500 uppercase tracking-widest mt-1">Thay đổi hình ảnh chủ đạo</p></div>
        <button onClick={() => { setCurrent(null); setIsModalOpen(true); }} className="bg-black text-white px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center hover:bg-gray-800"><Plus size={16} className="mr-2" /> Thêm Banner mới</button>
      </div>

      <div className="flex items-center space-x-2 pb-2 overflow-x-auto">
        {['Tất cả','Hero Home','Category Banner'].map(type => (
          <button key={type} onClick={() => setFilterType(type)} className={`px-5 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap ${filterType===type?'bg-black text-white shadow-md':'bg-white text-gray-400 border border-gray-100 hover:bg-gray-50'}`}>{type}</button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6">
        {filtered.map((banner: any) => (
          <div key={banner.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden group hover:shadow-lg transition-all">
            <div className="relative aspect-[21/9] md:aspect-[4/1] bg-gray-100 overflow-hidden">
              <img src={banner.image} alt={banner.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" referrerPolicy="no-referrer" />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
              <div className="absolute inset-0 flex flex-col justify-center px-10 text-white">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] bg-white/20 backdrop-blur-md px-3 py-1 rounded-full">{banner.type}</span>
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] bg-white/20 backdrop-blur-md px-3 py-1 rounded-full">{banner.page}</span>
                </div>
                <h3 className="text-2xl font-bold tracking-tight uppercase max-w-2xl">{banner.title}</h3>
              </div>
              <div className="absolute top-4 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                <button onClick={() => { setCurrent(banner); setIsModalOpen(true); }} className="bg-white text-black p-2.5 rounded-xl hover:bg-black hover:text-white transition-all shadow-lg"><Edit2 size={16} /></button>
                <button onClick={() => window.confirm('Xóa banner này?') && setBanners(banners.filter((b: any) => b.id !== banner.id))} className="bg-white text-red-500 p-2.5 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-lg"><Trash2 size={16} /></button>
              </div>
              <div className="absolute bottom-4 left-10">
                <span className={`text-[9px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full flex items-center gap-1.5 ${banner.status==='Đang hiển thị'?'bg-emerald-500 text-white':'bg-gray-500 text-white'}`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${banner.status==='Đang hiển thị'?'bg-white animate-pulse':'bg-gray-300'}`} />{banner.status}
                </span>
              </div>
            </div>
            <div className="p-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3"><div className="p-2 bg-gray-50 rounded-xl"><ImageIcon size={18} className="text-gray-400" /></div><div><p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Vị trí</p><p className="text-sm font-bold uppercase tracking-tight">{banner.page}</p></div></div>
              <button onClick={() => { setCurrent(banner); setIsModalOpen(true); }} className="px-6 py-2.5 border border-gray-100 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-gray-50">Thay đổi ảnh</button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-6 backdrop-blur-md">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-black text-white">
              <h2 className="text-sm font-bold uppercase tracking-[0.2em]">{current ? 'Chỉnh sửa Banner' : 'Thêm Banner mới'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/10 rounded-xl"><X size={20} /></button>
            </div>
            <form onSubmit={handleSave} className="p-8 space-y-5 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-2"><label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Loại Banner</label>
                  <select name="type" defaultValue={current?.type||'Hero Home'} className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 text-sm outline-none focus:ring-1 focus:ring-black cursor-pointer appearance-none"><option>Hero Home</option><option>Category Banner</option></select>
                </div>
                <div className="space-y-2"><label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Vị trí / Trang</label>
                  <select name="page" defaultValue={current?.page||'Trang chủ (Hero)'} className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 text-sm outline-none focus:ring-1 focus:ring-black cursor-pointer appearance-none">
                    <optgroup label="Trang chính">{PAGES.map(p=><option key={p} value={p}>{p}</option>)}</optgroup>
                    <optgroup label="Danh mục sản phẩm">{CATEGORIES.map(c=><option key={c} value={c}>{c}</option>)}</optgroup>
                  </select>
                </div>
              </div>
              <div className="space-y-2"><label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Tiêu đề hiển thị</label><input name="title" type="text" defaultValue={current?.title} required className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 text-sm outline-none focus:ring-1 focus:ring-black" placeholder="VD: BST Mùa Xuân 2026" /></div>
              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-2"><label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Đường dẫn</label><input name="link" type="text" defaultValue={current?.link||'/'} className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 text-sm outline-none focus:ring-1 focus:ring-black" placeholder="/category/..." /></div>
                <div className="space-y-2"><label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Trạng thái</label><select name="status" defaultValue={current?.status||'Đang hiển thị'} className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 text-sm outline-none focus:ring-1 focus:ring-black cursor-pointer appearance-none"><option>Đang hiển thị</option><option>Ẩn</option></select></div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Hình ảnh (URL hoặc upload)</label>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                <input type="text" value={tempImageUrl} onChange={e=>setTempImageUrl(e.target.value)} className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 text-sm outline-none focus:ring-1 focus:ring-black" placeholder="Dán URL ảnh hoặc nhấn upload bên dưới" />
                <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-black transition-all cursor-pointer group bg-gray-50">
                  {tempImageUrl ? (
                    <div className="relative aspect-[4/1] rounded-xl overflow-hidden"><img src={tempImageUrl} className="w-full h-full object-cover" alt="Preview" referrerPolicy="no-referrer" /><div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100"><Upload size={24} className="text-white" /></div></div>
                  ) : (
                    <><div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mx-auto mb-3 shadow-sm group-hover:bg-black group-hover:text-white transition-all"><Upload size={20} /></div><p className="text-xs font-bold uppercase tracking-widest">Chọn ảnh từ máy tính</p><p className="text-[9px] text-gray-400 uppercase mt-1">JPG, PNG, WebP — tối đa 5MB</p></>
                  )}
                </div>
              </div>
              <div className="pt-2 flex items-center justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 text-[10px] font-bold uppercase hover:text-gray-500">Hủy</button>
                <button type="submit" className="bg-black text-white px-8 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-gray-800 flex items-center shadow-lg"><Save size={14} className="mr-2" /> Lưu thay đổi</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
