import React, { useState, useMemo, useEffect } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { Plus, Search, Edit2, Trash2, ChevronLeft, ChevronRight, X, Upload, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { formatPrice, parsePrice } from '../../utils/auth';

interface Product {
  id: number;
  name: string;
  subtitle: string;
  category: string;
  price: number;
  priceFormatted: string;
  stock: number;
  status: string;
  image: string;
  detailImages: string[];
  description: string;
  size: string;
}

const CATEGORIES = ['Tất cả danh mục','Cleansing','Toner & Mist','Cream','Special Treatment','Mask','Sun Protection','Professional Spa Line','Beauty Tools','Gift'];
const QUILL_MODULES = { toolbar: [[{ header:[1,2,3,false] }],['bold','italic','underline','strike'],[{ list:'ordered'},{ list:'bullet'}],['link'],['clean']] };
const QUILL_FORMATS = ['header','bold','italic','underline','strike','list','bullet','link'];

const INITIAL_PRODUCTS: Product[] = [
  { id:1, name:'Gentle Cleanser', subtitle:'Dịu nhẹ & Cân bằng', category:'Cleansing', price:1200000, priceFormatted:'1.200.000đ', stock:42, status:'Còn hàng', image:'https://picsum.photos/seed/p1/400/400', detailImages:[], description:'Sữa rửa mặt dịu nhẹ cho mọi loại da.', size:'150 ml' },
  { id:2, name:'Hydrating Mist', subtitle:'Cấp ẩm tức thì', category:'Toner & Mist', price:850000, priceFormatted:'850.000đ', stock:15, status:'Sắp hết', image:'https://picsum.photos/seed/p2/400/400', detailImages:[], description:'Xịt khoáng cấp ẩm tức thì.', size:'100 ml' },
  { id:3, name:'Repair Cream', subtitle:'Phục hồi chuyên sâu', category:'Cream', price:2500000, priceFormatted:'2.500.000đ', stock:0, status:'Hết hàng', image:'https://picsum.photos/seed/p3/400/400', detailImages:[], description:'Kem dưỡng phục hồi da chuyên sâu.', size:'50 ml' },
];

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('app_products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });
  useEffect(() => { localStorage.setItem('app_products', JSON.stringify(products)); }, [products]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tất cả danh mục');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Partial<Product>>({});
  const [isUpdating, setIsUpdating] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 10;

  const filteredProducts = useMemo(() => products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.category.toLowerCase().includes(searchTerm.toLowerCase()) || (p.subtitle||'').toLowerCase().includes(searchTerm.toLowerCase());
    const matchCat = selectedCategory === 'Tất cả danh mục' || p.category === selectedCategory;
    return matchSearch && matchCat;
  }), [products, searchTerm, selectedCategory]);

  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const paginatedProducts = useMemo(() => filteredProducts.slice((currentPage-1)*productsPerPage, currentPage*productsPerPage), [filteredProducts, currentPage]);

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(0);
    await new Promise(r => setTimeout(r, 800));
    const price = currentProduct.price || 0;
    const priceFormatted = formatPrice(price);
    const status = (currentProduct.stock||0) > 20 ? 'Còn hàng' : (currentProduct.stock||0) > 0 ? 'Sắp hết' : 'Hết hàng';
    if (isEditing) {
      setProducts(products.map(p => p.id === currentProduct.id ? { ...p, ...currentProduct, price, priceFormatted, status } as Product : p));
    } else {
      const newId = Math.max(0, ...products.map(p => p.id)) + 1;
      setProducts([{ ...currentProduct, id: newId, price, priceFormatted, status, image: currentProduct.image || `https://picsum.photos/seed/${newId}/400/400`, detailImages: currentProduct.detailImages || [] } as Product, ...products]);
    }
    setIsUpdating(null);
    setIsModalOpen(false);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, index?: number) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const b64 = reader.result as string;
      if (index === undefined) { setCurrentProduct(p => ({ ...p, image: b64 })); }
      else {
        setCurrentProduct(p => {
          const imgs = [...(p.detailImages||[])];
          if (index < imgs.length) imgs[index] = b64; else imgs.push(b64);
          return { ...p, detailImages: imgs };
        });
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div><h1 className="text-2xl font-bold tracking-tight uppercase">Quản lý sản phẩm</h1><p className="text-xs text-gray-500 uppercase tracking-widest mt-1">Danh sách tất cả sản phẩm</p></div>
        <button onClick={() => { setIsEditing(false); setCurrentProduct({ name:'',subtitle:'',size:'',category:'Cleansing',price:0,stock:0,description:'',image:'',detailImages:[] }); setIsModalOpen(true); }} className="bg-black text-white px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center hover:bg-gray-800"><Plus size={15} className="mr-2" /> Thêm sản phẩm mới</button>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" /><input type="text" placeholder="Tìm kiếm sản phẩm..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} className="w-full bg-gray-50 border-none rounded-xl py-2.5 pl-10 pr-4 text-sm focus:ring-1 focus:ring-black outline-none" /></div>
        <select value={selectedCategory} onChange={(e) => { setSelectedCategory(e.target.value); setCurrentPage(1); }} className="flex-1 md:flex-none bg-gray-50 border-none rounded-xl text-xs font-bold uppercase tracking-widest px-4 py-2.5 focus:ring-1 focus:ring-black outline-none cursor-pointer">
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[800px]">
            <thead><tr className="bg-gray-50 border-b border-gray-100">
              {['Sản phẩm','Danh mục','Giá','Kho','Trạng thái','Thao tác'].map(h => <th key={h} className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">{h}</th>)}
            </tr></thead>
            <tbody className="divide-y divide-gray-50">
              {paginatedProducts.length > 0 ? paginatedProducts.map(product => (
                <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4"><div className="flex items-center space-x-4"><div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 border border-gray-100"><img src={product.image} alt={product.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" /></div><div><p className="text-sm font-bold">{product.name}</p><p className="text-[10px] text-gray-400 uppercase tracking-widest">{product.subtitle}</p></div></div></td>
                  <td className="px-6 py-4"><span className="text-xs text-gray-500 uppercase tracking-widest">{product.category}</span></td>
                  <td className="px-6 py-4"><span className="text-sm font-bold">{product.priceFormatted}</span></td>
                  <td className="px-6 py-4"><span className="text-sm text-gray-500">{product.stock}</span></td>
                  <td className="px-6 py-4"><span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded-full ${product.status==='Còn hàng'?'bg-emerald-50 text-emerald-600':product.status==='Sắp hết'?'bg-amber-50 text-amber-600':'bg-red-50 text-red-600'}`}>{product.status}</span></td>
                  <td className="px-6 py-4 text-right">
                    {isUpdating === product.id ? <Clock size={16} className="text-gray-400 animate-spin inline" /> : (
                      <div className="flex items-center justify-end space-x-1">
                        <button onClick={() => { setIsEditing(true); setCurrentProduct(product); setIsModalOpen(true); }} className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-black"><Edit2 size={15} /></button>
                        <button onClick={async () => { if (window.confirm('Xóa sản phẩm này?')) { setIsUpdating(product.id); await new Promise(r=>setTimeout(r,600)); setProducts(products.filter(p=>p.id!==product.id)); setIsUpdating(null); } }} className="p-2 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500"><Trash2 size={15} /></button>
                      </div>
                    )}
                  </td>
                </tr>
              )) : <tr><td colSpan={6} className="px-6 py-12 text-center"><AlertCircle size={30} className="text-gray-200 mx-auto mb-2" /><p className="text-sm text-gray-400 uppercase tracking-widest">Không tìm thấy sản phẩm</p></td></tr>}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
          <p className="text-xs text-gray-400">Hiển thị {paginatedProducts.length} / {filteredProducts.length} sản phẩm</p>
          <div className="flex items-center space-x-2">
            <button onClick={() => setCurrentPage(p=>Math.max(1,p-1))} disabled={currentPage===1} className="p-2 border border-gray-100 rounded-lg text-gray-400 disabled:opacity-50"><ChevronLeft size={15} /></button>
            {Array.from({length:totalPages},(_,i)=>i+1).map(pg => <button key={pg} onClick={() => setCurrentPage(pg)} className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${currentPage===pg?'bg-black text-white':'text-gray-400 hover:bg-gray-50'}`}>{pg}</button>)}
            <button onClick={() => setCurrentPage(p=>Math.min(totalPages,p+1))} disabled={currentPage===totalPages||totalPages===0} className="p-2 border border-gray-100 rounded-lg text-gray-400 disabled:opacity-50"><ChevronRight size={15} /></button>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-black text-white">
              <h2 className="text-lg font-bold uppercase">{isEditing?'Chỉnh sửa sản phẩm':'Thêm sản phẩm mới'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full"><X size={20} /></button>
            </div>
            <form onSubmit={handleSaveProduct}>
              <div className="p-8 space-y-6 max-h-[75vh] overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Ảnh đại diện</label>
                      <div className="aspect-square bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center relative overflow-hidden hover:border-black transition-colors cursor-pointer">
                        {currentProduct.image ? <img src={currentProduct.image} alt="Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" /> : <><Upload size={24} className="text-gray-300" /><span className="text-[10px] text-gray-400 mt-2">Tải ảnh lên</span></>}
                        <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleImageChange(e)} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Hoặc dán URL ảnh</label>
                      <input type="url" value={currentProduct.image||''} onChange={(e) => setCurrentProduct({...currentProduct,image:e.target.value})} className="w-full bg-gray-50 border-none rounded-xl py-2.5 px-4 text-sm outline-none focus:ring-1 focus:ring-black" placeholder="https://..." />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2"><label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Tên sản phẩm</label><input required type="text" value={currentProduct.name||''} onChange={(e) => setCurrentProduct({...currentProduct,name:e.target.value})} className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 text-sm outline-none focus:ring-1 focus:ring-black" placeholder="Nhập tên sản phẩm..." /></div>
                    <div className="space-y-2"><label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Tiêu đề nhỏ</label><input type="text" value={currentProduct.subtitle||''} onChange={(e) => setCurrentProduct({...currentProduct,subtitle:e.target.value})} className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 text-sm outline-none focus:ring-1 focus:ring-black" /></div>
                    <div className="space-y-2"><label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Kích thước</label><input type="text" value={currentProduct.size||''} onChange={(e) => setCurrentProduct({...currentProduct,size:e.target.value})} className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 text-sm outline-none focus:ring-1 focus:ring-black" placeholder="VD: 150 ml" /></div>
                    <div className="space-y-2"><label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Danh mục</label>
                      <select value={currentProduct.category||'Cleansing'} onChange={(e) => setCurrentProduct({...currentProduct,category:e.target.value})} className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 text-sm outline-none focus:ring-1 focus:ring-black cursor-pointer">
                        {CATEGORIES.filter(c=>c!=='Tất cả danh mục').map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2"><label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Giá (VND)</label><input required type="number" min="0" value={currentProduct.price||0} onChange={(e) => setCurrentProduct({...currentProduct,price:Number(e.target.value)})} className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 text-sm outline-none focus:ring-1 focus:ring-black" /></div>
                      <div className="space-y-2"><label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Số lượng kho</label><input required type="number" min="0" value={currentProduct.stock||0} onChange={(e) => setCurrentProduct({...currentProduct,stock:Number(e.target.value)})} className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 text-sm outline-none focus:ring-1 focus:ring-black" /></div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Mô tả sản phẩm</label>
                      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                        <ReactQuill theme="snow" value={currentProduct.description||''} onChange={(content) => setCurrentProduct({...currentProduct,description:content})} modules={QUILL_MODULES} formats={QUILL_FORMATS} className="h-[180px] pb-10" placeholder="Nhập mô tả..." />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-6 bg-gray-50 border-t border-gray-100 flex items-center justify-end space-x-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-black">Hủy bỏ</button>
                <button type="submit" disabled={isUpdating===0} className="bg-black text-white px-8 py-3 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-gray-800 shadow-lg flex items-center">
                  {isUpdating===0 ? <><Clock size={13} className="mr-2 animate-spin" />Đang lưu...</> : <><CheckCircle2 size={13} className="mr-2" />{isEditing?'Cập nhật':'Thêm sản phẩm'}</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
