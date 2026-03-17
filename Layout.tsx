import React, { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { Search, Eye, Download, ChevronLeft, ChevronRight, Clock, X, ChevronDown, Mail, Trash2 } from 'lucide-react';
import { BANK_INFO, STORE } from '../../utils/auth';

interface Order { id: string; customer: string; customerName?: string; customerEmail?: string; email?: string; customerPhone?: string; phone?: string; address: string; date: string; timestamp: number; total: number; finalTotal?: number; shippingFee?: number; discountAmount?: number; appliedVoucher?: string; status: string; paymentStatus: string; items: any[]; paymentMethod: string; note?: string; }
const PAYMENT_STATUSES = ['Chờ thanh toán','Đã thanh toán','Đã hoàn tiền'];
const ORDER_STATUSES = ['Đang xử lý','Đang giao','Đã giao','Đã hủy'];

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('app_orders');
    return saved ? JSON.parse(saved) : [];
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 20;

  const saveOrders = (updated: Order[]) => {
    setOrders(updated);
    localStorage.setItem('app_orders', JSON.stringify(updated));
    window.dispatchEvent(new Event('orders-updated'));
  };

  const filteredOrders = useMemo(() => {
    let result = [...orders];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(o =>
        o.id.toLowerCase().includes(q) ||
        (o.customerName||o.customer||'').toLowerCase().includes(q) ||
        (o.customerPhone||o.phone||'').includes(q) ||
        o.items.some((p: any) => (p.name||'').toLowerCase().includes(q))
      );
    }
    return result.sort((a, b) => (b.timestamp||0) - (a.timestamp||0));
  }, [searchQuery, orders]);

  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);
  const paginatedOrders = useMemo(() => filteredOrders.slice((currentPage-1)*ordersPerPage, currentPage*ordersPerPage), [filteredOrders, currentPage]);

  const updateStatus = async (id: string, field: 'status'|'paymentStatus', value: string) => {
    setIsUpdating(id);
    await new Promise(r => setTimeout(r, 500));
    saveOrders(orders.map(o => o.id === id ? { ...o, [field]: value } : o));
    if (selectedOrder?.id === id) setSelectedOrder(prev => prev ? { ...prev, [field]: value } : null);
    setIsUpdating(null);
  };

  const handleDelete = (id: string) => {
    if (window.confirm(`Xóa đơn hàng #${id}?`)) saveOrders(orders.filter(o => o.id !== id));
  };

  const handleEmail = (order: Order) => {
    setSelectedOrder(order);
    setEmailSubject(`Thông báo về đơn hàng #${order.id}`);
    setEmailMessage(`Chào ${order.customerName||order.customer},\n\nChúng tôi xin thông báo về trạng thái đơn hàng của bạn.\n\nTrân trọng,\n${STORE.name}`);
    setIsEmailModalOpen(true);
  };

  const handleExportExcel = () => {
    const data = filteredOrders.map(o => ({
      'Mã ĐH': o.id, 'Khách hàng': o.customerName||o.customer, 'Email': o.customerEmail||o.email,
      'SĐT': o.customerPhone||o.phone, 'Địa chỉ': o.address, 'Ngày đặt': o.date,
      'Tổng tiền': o.finalTotal||o.total, 'Trạng thái': o.status,
      'Thanh toán': o.paymentStatus, 'Phương thức': o.paymentMethod==='COD'?'Tiền mặt':'Chuyển khoản'
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'DonHang');
    XLSX.writeFile(wb, 'DanhSachDonHang.xlsx');
  };

  const getTotal = (o: Order) => typeof (o.finalTotal||o.total) === 'number' ? (o.finalTotal||o.total) : 0;
  const fmtVND = (n: number) => new Intl.NumberFormat('vi-VN',{style:'currency',currency:'VND'}).format(n);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div><h1 className="text-2xl font-bold tracking-tight uppercase">Quản lý đơn hàng</h1><p className="text-xs text-gray-500 uppercase tracking-widest mt-1">Theo dõi và xử lý các đơn hàng từ khách hàng</p></div>
        <button onClick={handleExportExcel} className="bg-white border border-gray-100 px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center hover:bg-gray-50 cursor-pointer"><Download size={15} className="mr-2" /> Xuất Excel</button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <div className="relative w-full md:w-96"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" /><input type="text" placeholder="Tìm mã đơn, khách hàng, SĐT..." value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }} className="w-full bg-gray-50 border-none rounded-xl py-2.5 pl-10 pr-4 text-sm focus:ring-1 focus:ring-black outline-none" /></div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[1000px]">
            <thead><tr className="bg-gray-50 border-b border-gray-100">
              {['Mã đơn','Khách hàng','Sản phẩm','Thanh toán','Tổng tiền','Trạng thái','Thao tác'].map(h => <th key={h} className="px-5 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">{h}</th>)}
            </tr></thead>
            <tbody className="divide-y divide-gray-50">
              {paginatedOrders.length > 0 ? paginatedOrders.map(order => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4"><span className="text-sm font-bold">#{order.id}</span></td>
                  <td className="px-5 py-4"><div className="max-w-[180px]"><p className="text-sm font-medium">{order.customerName||order.customer}</p><p className="text-[10px] text-gray-400">{order.customerPhone||order.phone}</p></div></td>
                  <td className="px-5 py-4"><div className="max-w-[220px]"><div className="space-y-0.5">{order.items.slice(0,2).map((p,i) => <p key={i} className="text-xs truncate">{p.name} <span className="text-gray-400 font-bold">x{p.quantity}</span></p>)}{order.items.length>2&&<p className="text-[10px] text-gray-400">+{order.items.length-2} sản phẩm</p>}</div><p className="text-[10px] text-gray-400 uppercase mt-1">{order.date}</p></div></td>
                  <td className="px-5 py-4">
                    <div className="relative">
                      {isUpdating===order.id ? <span className="text-[9px] text-gray-400 animate-pulse">Đang lưu...</span> : (
                        <>
                          <select value={order.paymentStatus} onChange={(e) => updateStatus(order.id,'paymentStatus',e.target.value)} className={`appearance-none bg-transparent pr-6 py-1 text-[9px] font-bold uppercase outline-none cursor-pointer ${order.paymentStatus==='Đã thanh toán'?'text-emerald-600':order.paymentStatus==='Chờ thanh toán'?'text-amber-600':'text-gray-500'}`}>
                            {PAYMENT_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                          <ChevronDown size={9} className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" />
                        </>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-4"><span className="text-sm font-bold">{fmtVND(getTotal(order))}</span></td>
                  <td className="px-5 py-4">
                    <div className="relative">
                      {isUpdating===order.id ? <span className="text-[9px] text-gray-400 animate-pulse">Đang lưu...</span> : (
                        <>
                          <select value={order.status} onChange={(e) => updateStatus(order.id,'status',e.target.value)} className={`appearance-none bg-transparent pr-6 py-1 text-[9px] font-bold uppercase outline-none cursor-pointer ${order.status==='Đã giao'?'text-emerald-600':order.status==='Đang xử lý'?'text-amber-600':order.status==='Đang giao'?'text-blue-600':'text-red-600'}`}>
                            {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                          <ChevronDown size={9} className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" />
                        </>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end space-x-1">
                      <button onClick={() => { setSelectedOrder(order); setIsModalOpen(true); }} className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-blue-600"><Eye size={15} /></button>
                      <button onClick={() => handleEmail(order)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-indigo-600"><Mail size={15} /></button>
                      <button onClick={() => handleDelete(order.id)} className="p-2 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-600"><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              )) : <tr><td colSpan={7} className="px-6 py-12 text-center text-sm text-gray-400 uppercase tracking-widest">Không có đơn hàng nào</td></tr>}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
          <p className="text-xs text-gray-400">Hiển thị {paginatedOrders.length} / {filteredOrders.length} đơn hàng</p>
          <div className="flex items-center space-x-2">
            <button onClick={() => setCurrentPage(p=>Math.max(1,p-1))} disabled={currentPage===1} className="p-2 border border-gray-100 rounded-lg text-gray-400 disabled:opacity-50"><ChevronLeft size={15} /></button>
            {Array.from({length:totalPages},(_,i)=>i+1).map(pg => <button key={pg} onClick={() => setCurrentPage(pg)} className={`w-8 h-8 rounded-lg text-xs font-bold ${currentPage===pg?'bg-black text-white':'text-gray-400 hover:bg-gray-50'}`}>{pg}</button>)}
            <button onClick={() => setCurrentPage(p=>Math.min(totalPages,p+1))} disabled={currentPage===totalPages||totalPages===0} className="p-2 border border-gray-100 rounded-lg text-gray-400 disabled:opacity-50"><ChevronRight size={15} /></button>
          </div>
        </div>
      </div>

      {isModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-xl font-bold uppercase">Chi tiết đơn #{selectedOrder.id}</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full"><X size={20} /></button>
            </div>
            <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-6">
                <div><p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Khách hàng</p>
                  <p className="text-base font-bold">{selectedOrder.customerName||selectedOrder.customer}</p>
                  <p className="text-sm text-gray-500">{selectedOrder.customerEmail||selectedOrder.email}</p>
                  <p className="text-sm text-gray-500">{selectedOrder.customerPhone||selectedOrder.phone}</p>
                  <p className="text-sm text-gray-500 mt-1">{selectedOrder.address}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Trạng thái</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase mb-2 ${selectedOrder.status==='Đã giao'?'bg-emerald-50 text-emerald-600':selectedOrder.status==='Đã hủy'?'bg-red-50 text-red-600':'bg-amber-50 text-amber-600'}`}>{selectedOrder.status}</span>
                  <br /><span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase ${selectedOrder.paymentStatus==='Đã thanh toán'?'bg-emerald-50 text-emerald-600':'bg-amber-50 text-amber-600'}`}>{selectedOrder.paymentStatus}</span>
                  <p className="text-sm text-gray-500 mt-3">{selectedOrder.paymentMethod==='COD'?'Thanh toán khi nhận':'Chuyển khoản ngân hàng'}</p>
                </div>
              </div>
              {selectedOrder.note && <div className="bg-gray-50 rounded-xl p-4"><p className="text-[10px] uppercase tracking-widest text-gray-400 mb-1">Ghi chú</p><p className="text-sm italic text-gray-600">"{selectedOrder.note}"</p></div>}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">Sản phẩm</p>
                <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                  {selectedOrder.items.map((p, i) => (
                    <div key={i} className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3"><img src={p.image} alt={p.name} className="w-10 h-10 rounded-lg object-cover border border-gray-100" referrerPolicy="no-referrer" /><span className="text-sm font-medium">{p.name}</span></div>
                      <span className="text-xs text-gray-400 font-bold">x{p.quantity}</span>
                    </div>
                  ))}
                  <div className="pt-3 border-t border-gray-200 space-y-2 text-xs">
                    <div className="flex justify-between text-gray-500"><span>Tạm tính</span><span>{fmtVND(selectedOrder.total)}</span></div>
                    <div className="flex justify-between text-gray-500"><span>Phí vận chuyển</span><span>{selectedOrder.shippingFee===0?'Miễn phí':selectedOrder.shippingFee?fmtVND(selectedOrder.shippingFee):'---'}</span></div>
                    {(selectedOrder.discountAmount||0)>0 && <div className="flex justify-between text-green-600"><span>Giảm giá ({selectedOrder.appliedVoucher})</span><span>-{fmtVND(selectedOrder.discountAmount||0)}</span></div>}
                    <div className="flex justify-between font-bold text-base border-t border-gray-100 pt-2"><span>Tổng cộng</span><span>{fmtVND(getTotal(selectedOrder))}</span></div>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6 bg-gray-50 flex items-center justify-end space-x-3">
              <button onClick={() => setIsModalOpen(false)} className="px-6 py-2 text-xs font-bold uppercase text-gray-500 hover:text-black">Đóng</button>
              <button onClick={() => { handleEmail(selectedOrder); setIsModalOpen(false); }} className="bg-black text-white px-6 py-2.5 rounded-xl text-xs font-bold uppercase hover:bg-gray-800 shadow-lg">Gửi hóa đơn</button>
            </div>
          </div>
        </div>
      )}

      {isEmailModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-indigo-600 text-white">
              <div className="flex items-center gap-2"><Mail size={18} /><h2 className="text-lg font-bold uppercase">Soạn Email</h2></div>
              <button onClick={() => setIsEmailModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full"><X size={20} /></button>
            </div>
            <div className="p-8 space-y-5">
              <div className="p-4 bg-gray-50 rounded-xl"><p className="text-[10px] uppercase font-bold text-gray-400 mb-1">Người nhận</p><p className="text-sm font-bold">{selectedOrder.customerName||selectedOrder.customer}</p><p className="text-xs text-gray-500">{selectedOrder.customerEmail||selectedOrder.email}</p></div>
              <div className="space-y-2"><label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Tiêu đề</label><input type="text" value={emailSubject} onChange={(e) => setEmailSubject(e.target.value)} className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" /></div>
              <div className="space-y-2"><label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Nội dung</label><textarea rows={6} value={emailMessage} onChange={(e) => setEmailMessage(e.target.value)} className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none" /></div>
            </div>
            <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
              <button onClick={() => setIsEmailModalOpen(false)} className="px-6 py-2.5 text-xs font-bold uppercase text-gray-500 hover:text-black">Hủy</button>
              <button onClick={() => { alert(`Email đã được soạn cho ${selectedOrder.customerEmail||selectedOrder.email}. Trong môi trường thực tế, email sẽ được gửi qua backend API.`); setIsEmailModalOpen(false); }} className="bg-indigo-600 text-white px-8 py-3 rounded-xl text-xs font-bold uppercase hover:bg-indigo-700 shadow-lg flex items-center gap-2"><Mail size={14} /> Gửi Email</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
