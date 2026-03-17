import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Tag, X, Check, AlertCircle } from 'lucide-react';
import { generateId } from '../../utils/auth';

interface Voucher {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderValue: number;
  status: 'active' | 'inactive';
  createdAt: string;
}

const DEFAULT_VOUCHERS: Voucher[] = [
  { id: '1', code: 'WELCOME10', discountType: 'percentage', discountValue: 10, minOrderValue: 0, status: 'active', createdAt: '01/03/2024' },
  { id: '2', code: 'FREESHIP', discountType: 'fixed', discountValue: 35000, minOrderValue: 1000000, status: 'active', createdAt: '01/03/2024' },
  { id: '3', code: 'SUMMER20', discountType: 'percentage', discountValue: 20, minOrderValue: 2000000, status: 'inactive', createdAt: '15/03/2024' },
];

const EMPTY_FORM: Omit<Voucher, 'id' | 'createdAt'> = { code: '', discountType: 'percentage', discountValue: 10, minOrderValue: 0, status: 'active' };

export default function AdminVouchers() {
  const [vouchers, setVouchers] = useState<Voucher[]>(() => {
    const saved = localStorage.getItem('app_vouchers');
    return saved ? JSON.parse(saved) : DEFAULT_VOUCHERS;
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [codeError, setCodeError] = useState('');

  useEffect(() => { localStorage.setItem('app_vouchers', JSON.stringify(vouchers)); }, [vouchers]);

  const filtered = vouchers.filter(v => v.code.toLowerCase().includes(searchTerm.toLowerCase()));

  const openAdd = () => { setEditingId(null); setForm(EMPTY_FORM); setCodeError(''); setIsModalOpen(true); };
  const openEdit = (v: Voucher) => { setEditingId(v.id); setForm({ code: v.code, discountType: v.discountType, discountValue: v.discountValue, minOrderValue: v.minOrderValue, status: v.status }); setCodeError(''); setIsModalOpen(true); };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCodeError('');
    const code = form.code.trim().toUpperCase();
    if (!code) { setCodeError('Mã voucher không được để trống'); return; }
    const duplicate = vouchers.find(v => v.code === code && v.id !== editingId);
    if (duplicate) { setCodeError('Mã voucher đã tồn tại'); return; }
    if (editingId) {
      setVouchers(vouchers.map(v => v.id === editingId ? { ...v, ...form, code } : v));
    } else {
      setVouchers([{ id: generateId(), ...form, code, createdAt: new Date().toLocaleDateString('vi-VN') }, ...vouchers]);
    }
    setIsModalOpen(false);
  };

  const toggleStatus = (id: string) => {
    setVouchers(vouchers.map(v => v.id === id ? { ...v, status: v.status === 'active' ? 'inactive' : 'active' } : v));
  };

  const fmtDiscount = (v: Voucher) => v.discountType === 'percentage' ? `${v.discountValue}%` : `${v.discountValue.toLocaleString('vi-VN')}đ`;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div><h1 className="text-2xl font-bold tracking-tight uppercase">Mã giảm giá</h1><p className="text-xs text-gray-500 uppercase tracking-widest mt-1">Quản lý chương trình khuyến mãi</p></div>
        <button onClick={openAdd} className="bg-black text-white px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center hover:bg-gray-800"><Plus size={15} className="mr-2" /> Tạo mã mới</button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[['Tổng mã', vouchers.length, 'gray'], ['Đang hoạt động', vouchers.filter(v=>v.status==='active').length, 'emerald'], ['Đã tắt', vouchers.filter(v=>v.status==='inactive').length, 'red']].map(([label, val, color]: any) => (
          <div key={label} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm text-center">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{label}</p>
            <p className={`text-3xl font-bold mt-1 text-${color === 'gray' ? 'black' : color + '-600'}`}>{val}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <div className="relative w-full md:w-80"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" /><input type="text" placeholder="Tìm mã voucher..." value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} className="w-full bg-gray-50 border-none rounded-xl py-2.5 pl-10 pr-4 text-sm focus:ring-1 focus:ring-black outline-none" /></div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[700px]">
            <thead><tr className="bg-gray-50 border-b border-gray-100">
              {['Mã voucher','Loại giảm','Giá trị','Đơn tối thiểu','Ngày tạo','Trạng thái','Thao tác'].map(h => <th key={h} className="px-5 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">{h}</th>)}
            </tr></thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length > 0 ? filtered.map(v => (
                <tr key={v.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4"><div className="flex items-center gap-2"><div className="p-2 bg-gray-100 rounded-lg"><Tag size={13} className="text-gray-500" /></div><span className="font-mono font-bold text-sm">{v.code}</span></div></td>
                  <td className="px-5 py-4 text-xs text-gray-500 uppercase">{v.discountType === 'percentage' ? 'Phần trăm' : 'Cố định'}</td>
                  <td className="px-5 py-4"><span className="text-sm font-bold text-emerald-600">{fmtDiscount(v)}</span></td>
                  <td className="px-5 py-4 text-xs text-gray-500">{v.minOrderValue > 0 ? `${v.minOrderValue.toLocaleString('vi-VN')}đ` : 'Không yêu cầu'}</td>
                  <td className="px-5 py-4 text-xs text-gray-400">{v.createdAt}</td>
                  <td className="px-5 py-4">
                    <button onClick={() => toggleStatus(v.id)} className={`text-[9px] font-bold uppercase px-3 py-1.5 rounded-full cursor-pointer transition-colors ${v.status==='active'?'bg-emerald-50 text-emerald-600 hover:bg-emerald-100':'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                      {v.status==='active'?'Hoạt động':'Đã tắt'}
                    </button>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(v)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-black"><Edit2 size={15} /></button>
                      <button onClick={() => window.confirm('Xóa mã này?') && setVouchers(vouchers.filter(x=>x.id!==v.id))} className="p-2 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500"><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              )) : <tr><td colSpan={7} className="px-6 py-12 text-center"><AlertCircle size={28} className="text-gray-200 mx-auto mb-2" /><p className="text-sm text-gray-400 uppercase tracking-widest">Không tìm thấy mã nào</p></td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-black text-white">
              <h2 className="text-sm font-bold uppercase tracking-widest">{editingId ? 'Chỉnh sửa mã' : 'Tạo mã mới'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Mã Voucher</label>
                <input type="text" required value={form.code} onChange={e=>{setForm({...form,code:e.target.value.toUpperCase()}); setCodeError('');}} className={`w-full bg-gray-50 border rounded-xl py-3 px-4 text-sm outline-none font-mono font-bold uppercase focus:ring-1 focus:ring-black ${codeError?'border-red-300':'border-gray-100'}`} placeholder="VD: SALE20" />
                {codeError && <p className="text-[10px] text-red-500 flex items-center gap-1"><AlertCircle size={11} /> {codeError}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Loại giảm giá</label>
                  <select value={form.discountType} onChange={e=>setForm({...form,discountType:e.target.value as any})} className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 text-sm outline-none focus:ring-1 focus:ring-black cursor-pointer appearance-none">
                    <option value="percentage">Phần trăm (%)</option>
                    <option value="fixed">Số tiền cố định</option>
                  </select>
                </div>
                <div className="space-y-2"><label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{form.discountType==='percentage'?'Giá trị (%)':'Số tiền (đ)'}</label><input type="number" required min="0" max={form.discountType==='percentage'?100:undefined} value={form.discountValue} onChange={e=>setForm({...form,discountValue:Number(e.target.value)})} className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 text-sm outline-none focus:ring-1 focus:ring-black" /></div>
              </div>
              <div className="space-y-2"><label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Đơn hàng tối thiểu (VND, 0 = không giới hạn)</label><input type="number" min="0" value={form.minOrderValue} onChange={e=>setForm({...form,minOrderValue:Number(e.target.value)})} className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 text-sm outline-none focus:ring-1 focus:ring-black" /></div>
              <div className="space-y-2"><label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Trạng thái</label>
                <div className="flex gap-3">
                  {[['active','Hoạt động'],['inactive','Đã tắt']].map(([val,label]) => (
                    <button key={val} type="button" onClick={() => setForm({...form,status:val as any})} className={`flex-1 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest border transition-all ${form.status===val?'bg-black text-white border-black':'bg-white border-gray-200 text-gray-400 hover:border-black'}`}>{label}</button>
                  ))}
                </div>
              </div>
              <div className="pt-4 flex items-center justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 rounded-xl text-xs font-bold uppercase hover:bg-gray-100">Hủy</button>
                <button type="submit" className="bg-black text-white px-8 py-3 rounded-xl text-xs font-bold uppercase hover:bg-gray-800 shadow-lg flex items-center gap-2"><Check size={14} /> {editingId?'Cập nhật':'Tạo mã'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
