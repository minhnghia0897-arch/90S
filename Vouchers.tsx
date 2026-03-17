import React, { useState, useMemo, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { Search, Edit2, Trash2, User, Mail, Phone, Users, ShoppingBag, ChevronLeft, ChevronRight, X, CheckCircle2, Clock, AlertCircle, UserCheck, UserPlus, Download } from 'lucide-react';
import { generateId } from '../../utils/auth';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  type: 'Đại Lý' | 'Khách Lẻ';
  totalOrders: number;
  totalSpent: number;
  status: 'Hoạt động' | 'Tạm khóa' | 'Chờ phê duyệt';
  joinDate: string;
}

const INITIAL_CUSTOMERS: Customer[] = [
  { id: '1', name: 'Nguyễn Văn A', email: 'nguyenvana@gmail.com', phone: '0901234567', address: '123 Lê Lợi, Q.1, TP.HCM', type: 'Khách Lẻ', totalOrders: 5, totalSpent: 12500000, status: 'Hoạt động', joinDate: '15/01/2024' },
  { id: '2', name: 'Công ty Mỹ phẩm X', email: 'contact@myphamx.com', phone: '02838445566', address: '456 Nguyễn Huệ, Q.1, TP.HCM', type: 'Đại Lý', totalOrders: 12, totalSpent: 150000000, status: 'Hoạt động', joinDate: '20/02/2024' },
  { id: '3', name: 'Trần Thị B', email: 'tranthib@gmail.com', phone: '0909888777', address: '789 CMT8, Q.3, TP.HCM', type: 'Khách Lẻ', totalOrders: 2, totalSpent: 3400000, status: 'Tạm khóa', joinDate: '05/03/2024' },
  { id: '4', name: 'Đại lý Mỹ phẩm Sài Gòn', email: 'saigon.beauty@gmail.com', phone: '0912345678', address: '101 Đồng Khởi, Q.1, TP.HCM', type: 'Đại Lý', totalOrders: 0, totalSpent: 0, status: 'Chờ phê duyệt', joinDate: '16/03/2024' },
];

export default function AdminCustomers() {
  const [customers, setCustomers] = useState<Customer[]>(() => {
    // Merge demo customers with real registered users from app_user
    const saved = localStorage.getItem('app_customers');
    if (saved) return JSON.parse(saved);
    return INITIAL_CUSTOMERS;
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('Tất cả');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [current, setCurrent] = useState<Partial<Customer>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const PER_PAGE = 20;

  // Sync new registrations from app_user
  useEffect(() => {
    const syncUser = () => {
      const savedUser = localStorage.getItem('app_user');
      if (savedUser) {
        const u = JSON.parse(savedUser);
        setCustomers(prev => {
          if (prev.some(c => c.email === u.email)) return prev;
          const newCustomer: Customer = { id: u.id || generateId(), name: `${u.lastName || ''} ${u.firstName || ''}`.trim() || u.email, email: u.email, phone: '', address: '', type: (u.accountType as any) || 'Khách Lẻ', totalOrders: 0, totalSpent: 0, status: 'Hoạt động', joinDate: new Date().toLocaleDateString('vi-VN') };
          const updated = [newCustomer, ...prev];
          localStorage.setItem('app_customers', JSON.stringify(updated));
          return updated;
        });
      }
    };
    syncUser();
    window.addEventListener('user-changed', syncUser);
    return () => window.removeEventListener('user-changed', syncUser);
  }, []);

  const saveCustomers = (updated: Customer[]) => {
    setCustomers(updated);
    localStorage.setItem('app_customers', JSON.stringify(updated));
  };

  const filtered = useMemo(() => customers.filter(c => {
    const q = searchTerm.toLowerCase();
    const matchSearch = c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || c.phone.includes(q);
    const matchType = selectedType === 'Tất cả' ? true : selectedType === 'Chờ phê duyệt' ? c.status === 'Chờ phê duyệt' : c.type === selectedType;
    return matchSearch && matchType;
  }), [customers, searchTerm, selectedType]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paged = filtered.slice((currentPage-1)*PER_PAGE, currentPage*PER_PAGE);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing) {
      saveCustomers(customers.map(c => c.id === current.id ? { ...c, ...current } as Customer : c));
    } else {
      saveCustomers([{ id: generateId(), totalOrders: 0, totalSpent: 0, joinDate: new Date().toLocaleDateString('vi-VN'), ...current } as Customer, ...customers]);
    }
    setIsModalOpen(false);
  };

  const fmtVND = (n: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

  const handleExport = () => {
    const data = filtered.map(c => ({ 'Tên': c.name, 'Email': c.email, 'SĐT': c.phone, 'Địa chỉ': c.address, 'Loại': c.type, 'Đơn hàng': c.totalOrders, 'Chi tiêu': c.totalSpent, 'Trạng thái': c.status, 'Ngày gia nhập': c.joinDate }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'KhachHang');
    XLSX.writeFile(wb, 'DanhSachKhachHang.xlsx');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div><h1 className="text-2xl font-bold tracking-tight uppercase">Quản lý khách hàng</h1><p className="text-xs text-gray-500 uppercase tracking-widest mt-1">Đại lý & Khách lẻ</p></div>
        <div className="flex items-center gap-3">
          <button onClick={handleExport} className="bg-white border border-gray-100 px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center hover:bg-gray-50"><Download size={15} className="mr-2" /> Xuất Excel</button>
          <button onClick={() => { setIsEditing(false); setCurrent({ type: 'Khách Lẻ', status: 'Hoạt động' }); setIsModalOpen(true); }} className="bg-black text-white px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center hover:bg-gray-800"><UserPlus size={15} className="mr-2" /> Thêm khách hàng</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[['Tổng khách hàng', customers.length, User, 'blue'], ['Đại lý', customers.filter(c=>c.type==='Đại Lý').length, UserCheck, 'emerald'], ['Chờ phê duyệt', customers.filter(c=>c.status==='Chờ phê duyệt').length, Clock, 'amber']].map(([label, val, Icon, color]: any) => (
          <div key={label} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center space-x-4">
            <div className={`p-3 bg-${color}-50 text-${color}-600 rounded-xl`}><Icon size={22} /></div>
            <div><p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{label}</p><p className="text-2xl font-bold">{val}</p></div>
          </div>
        ))}
      </div>

      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" /><input type="text" placeholder="Tên, email, số điện thoại..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} className="w-full bg-gray-50 border-none rounded-xl py-2.5 pl-10 pr-4 text-sm focus:ring-1 focus:ring-black outline-none" /></div>
        <select value={selectedType} onChange={(e) => { setSelectedType(e.target.value); setCurrentPage(1); }} className="flex-1 md:flex-none bg-gray-50 border-none rounded-xl text-xs font-bold uppercase tracking-widest px-4 py-2.5 focus:ring-1 focus:ring-black outline-none cursor-pointer">
          {['Tất cả','Đại Lý','Khách Lẻ','Chờ phê duyệt'].map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[900px]">
            <thead><tr className="bg-gray-50 border-b border-gray-100">
              {['Khách hàng','Loại','Liên hệ','Đơn hàng','Chi tiêu','Trạng thái','Thao tác'].map(h => <th key={h} className="px-5 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">{h}</th>)}
            </tr></thead>
            <tbody className="divide-y divide-gray-50">
              {paged.length > 0 ? paged.map(c => (
                <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4"><div className="flex items-center gap-3"><div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-400"><User size={18} /></div><div><p className="text-sm font-bold">{c.name}</p><p className="text-[10px] text-gray-400">{c.joinDate}</p></div></div></td>
                  <td className="px-5 py-4"><span className={`text-[9px] font-bold uppercase px-2 py-1 rounded-full ${c.type==='Đại Lý'?'bg-purple-50 text-purple-600':'bg-blue-50 text-blue-600'}`}>{c.type}</span></td>
                  <td className="px-5 py-4"><div className="space-y-0.5"><div className="flex items-center text-xs text-gray-500 gap-1"><Mail size={11} />{c.email}</div><div className="flex items-center text-xs text-gray-500 gap-1"><Phone size={11} />{c.phone||'—'}</div></div></td>
                  <td className="px-5 py-4 text-center"><span className="text-sm font-bold">{c.totalOrders}</span></td>
                  <td className="px-5 py-4"><span className="text-sm font-bold">{fmtVND(c.totalSpent)}</span></td>
                  <td className="px-5 py-4"><span className={`text-[9px] font-bold uppercase px-2 py-1 rounded-full ${c.status==='Hoạt động'?'bg-emerald-50 text-emerald-600':c.status==='Chờ phê duyệt'?'bg-amber-50 text-amber-600':'bg-red-50 text-red-600'}`}>{c.status}</span></td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-1">
                      {c.status==='Chờ phê duyệt' && <button onClick={() => saveCustomers(customers.map(x=>x.id===c.id?{...x,status:'Hoạt động' as const}:x))} className="p-2 hover:bg-emerald-50 rounded-lg text-emerald-500" title="Phê duyệt"><CheckCircle2 size={15} /></button>}
                      <button onClick={() => { setIsEditing(true); setCurrent(c); setIsModalOpen(true); }} className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-black"><Edit2 size={15} /></button>
                      <button onClick={() => window.confirm('Xóa khách hàng này?') && saveCustomers(customers.filter(x=>x.id!==c.id))} className="p-2 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500"><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              )) : <tr><td colSpan={7} className="px-6 py-12 text-center"><AlertCircle size={30} className="text-gray-200 mx-auto mb-2" /><p className="text-sm text-gray-400 uppercase tracking-widest">Không tìm thấy</p></td></tr>}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
          <p className="text-xs text-gray-400">Hiển thị {paged.length} / {filtered.length}</p>
          <div className="flex items-center gap-2">
            <button onClick={() => setCurrentPage(p=>Math.max(1,p-1))} disabled={currentPage===1} className="p-2 border border-gray-100 rounded-lg text-gray-400 disabled:opacity-40"><ChevronLeft size={15} /></button>
            {Array.from({length:totalPages},(_,i)=>i+1).map(pg=><button key={pg} onClick={()=>setCurrentPage(pg)} className={`w-8 h-8 rounded-lg text-xs font-bold ${currentPage===pg?'bg-black text-white':'text-gray-400 hover:bg-gray-50'}`}>{pg}</button>)}
            <button onClick={() => setCurrentPage(p=>Math.min(totalPages,p+1))} disabled={currentPage===totalPages||totalPages===0} className="p-2 border border-gray-100 rounded-lg text-gray-400 disabled:opacity-40"><ChevronRight size={15} /></button>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-black text-white">
              <h2 className="text-lg font-bold uppercase">{isEditing?'Chỉnh sửa':'Thêm mới'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full"><X size={20} /></button>
            </div>
            <form onSubmit={handleSave} className="p-8 space-y-5 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2"><label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Tên khách hàng</label><input type="text" required value={current.name||''} onChange={e=>setCurrent({...current,name:e.target.value})} className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 text-sm outline-none focus:ring-1 focus:ring-black" /></div>
                <div className="space-y-2"><label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Loại khách</label><select value={current.type||'Khách Lẻ'} onChange={e=>setCurrent({...current,type:e.target.value as any})} className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 text-sm outline-none focus:ring-1 focus:ring-black cursor-pointer"><option>Khách Lẻ</option><option>Đại Lý</option></select></div>
                <div className="space-y-2"><label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Email</label><input type="email" required value={current.email||''} onChange={e=>setCurrent({...current,email:e.target.value})} className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 text-sm outline-none focus:ring-1 focus:ring-black" /></div>
                <div className="space-y-2"><label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Số điện thoại</label><input type="tel" value={current.phone||''} onChange={e=>setCurrent({...current,phone:e.target.value})} className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 text-sm outline-none focus:ring-1 focus:ring-black" /></div>
                <div className="md:col-span-2 space-y-2"><label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Địa chỉ</label><textarea rows={2} value={current.address||''} onChange={e=>setCurrent({...current,address:e.target.value})} className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 text-sm outline-none focus:ring-1 focus:ring-black resize-none" /></div>
                <div className="space-y-2"><label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Trạng thái</label><select value={current.status||'Hoạt động'} onChange={e=>setCurrent({...current,status:e.target.value as any})} className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 text-sm outline-none focus:ring-1 focus:ring-black cursor-pointer"><option>Hoạt động</option><option>Tạm khóa</option><option>Chờ phê duyệt</option></select></div>
              </div>
              <div className="pt-4 flex items-center justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 rounded-xl text-xs font-bold uppercase hover:bg-gray-100">Hủy</button>
                <button type="submit" className="bg-black text-white px-8 py-3 rounded-xl text-xs font-bold uppercase hover:bg-gray-800 shadow-lg">{isEditing?'Cập nhật':'Thêm khách hàng'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
