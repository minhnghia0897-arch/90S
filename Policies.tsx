import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { BANK_INFO, STORE, formatPrice } from '../utils/auth';
import { ChevronLeft, CreditCard, Truck, ShieldCheck, Info, Loader2, CheckCircle2, Printer, Download, MapPin, Phone, Mail, Calendar, Copy, Check, Tag, X } from 'lucide-react';

export default function Checkout() {
  const { cart, totalPrice, checkout, totalItems } = useCart();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<any>(null);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', address: '', note: '', paymentMethod: 'COD' });
  const [copied, setCopied] = useState(false);
  const [voucherCode, setVoucherCode] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState<any>(null);
  const [voucherError, setVoucherError] = useState('');

  useEffect(() => {
    if (cart.length === 0 && !orderSuccess) navigate('/');
    const savedUser = localStorage.getItem('app_user');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      setFormData(prev => ({ ...prev, name: `${user.lastName||''} ${user.firstName||''}`.trim(), email: user.email || '', address: user.address || '' }));
    }
  }, [cart, navigate, orderSuccess]);

  const handleCopy = () => { navigator.clipboard.writeText(BANK_INFO.accountNumber); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  const handleDownloadQR = (orderId: string, total: number) => {
    const link = document.createElement('a');
    link.href = BANK_INFO.getQR(orderId, total);
    link.download = `QR_${orderId}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleApplyVoucher = () => {
    setVoucherError('');
    if (!voucherCode.trim()) return;
    const savedVouchers = localStorage.getItem('app_vouchers');
    if (!savedVouchers) { setVoucherError('Mã giảm giá không tồn tại'); return; }
    const vouchers = JSON.parse(savedVouchers);
    const voucher = vouchers.find((v: any) => v.code === voucherCode.toUpperCase());
    if (!voucher) { setVoucherError('Mã giảm giá không tồn tại'); return; }
    if (voucher.status !== 'active') { setVoucherError('Mã giảm giá đã hết hạn'); return; }
    if (totalPrice < voucher.minOrderValue) { setVoucherError(`Đơn hàng tối thiểu ${voucher.minOrderValue.toLocaleString('vi-VN')}đ`); return; }
    setAppliedVoucher(voucher);
    setVoucherCode('');
  };

  const shippingFee = totalPrice > 2500000 ? 0 : 35000;
  let discountAmount = 0;
  if (appliedVoucher) {
    discountAmount = appliedVoucher.discountType === 'percentage' ? (totalPrice * appliedVoucher.discountValue) / 100 : appliedVoucher.discountValue;
    if (discountAmount > totalPrice) discountAmount = totalPrice;
  }
  const finalTotal = totalPrice + shippingFee - discountAmount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    const order = checkout(
      { name: formData.name, email: formData.email, phone: formData.phone, address: formData.address },
      { note: formData.note, paymentMethod: formData.paymentMethod, shippingFee, discountAmount, appliedVoucher: appliedVoucher?.code || null, finalTotal }
    );
    setPlacedOrder(order);
    setIsSubmitting(false);
    setOrderSuccess(true);
  };

  if (orderSuccess && placedOrder) {
    return (
      <div className="min-h-screen bg-[#f0f2f5] py-12 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
            <div className="bg-black text-white p-10 text-center">
              <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6"><CheckCircle2 size={40} className="text-white" /></div>
              <h1 className="text-2xl font-bold uppercase tracking-[0.3em] mb-2">Đặt hàng thành công</h1>
              <p className="text-gray-400 text-[10px] uppercase tracking-widest">Cảm ơn bạn đã tin dùng {STORE.name}</p>
            </div>
            <div className="p-10">
              <div className="flex flex-col md:flex-row justify-between gap-8 mb-10 pb-8 border-b border-gray-100">
                <div className="space-y-3">
                  <div><p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Mã đơn hàng</p><p className="text-sm font-mono font-bold">#{placedOrder.id}</p></div>
                  <div><p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Ngày đặt</p><p className="text-xs flex items-center gap-2"><Calendar size={12} className="text-gray-400" />{placedOrder.date}</p></div>
                </div>
                <div className="space-y-3">
                  <div><p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Trạng thái</p><span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-bold uppercase">{placedOrder.status}</span></div>
                  <div><p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Thanh toán</p><p className="text-xs flex items-center gap-2"><CreditCard size={12} className="text-gray-400" />{placedOrder.paymentMethod==='COD'?'Thanh toán khi nhận hàng':'Chuyển khoản ngân hàng'}</p></div>
                </div>
              </div>

              {placedOrder.paymentMethod === 'BANK' && (
                <div className="mb-10 p-7 bg-gray-50 rounded-2xl border border-gray-100">
                  <h3 className="text-[11px] font-bold uppercase tracking-widest mb-5 flex items-center gap-2"><CreditCard size={12} className="text-gray-400" /> Thông tin chuyển khoản</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3 text-xs">
                      <div><p className="text-[9px] uppercase text-gray-400 mb-1">Chủ tài khoản</p><p className="font-bold">{BANK_INFO.accountHolder}</p></div>
                      <div><p className="text-[9px] uppercase text-gray-400 mb-1">Số tài khoản</p>
                        <div className="flex items-center gap-2"><p className="font-mono font-bold">{BANK_INFO.accountNumber}</p>
                          <button onClick={handleCopy} className="p-1.5 bg-white hover:bg-gray-100 rounded-lg shadow-sm">{copied?<Check size={12} className="text-emerald-500"/>:<Copy size={12} />}</button>
                        </div>
                      </div>
                      <div><p className="text-[9px] uppercase text-gray-400 mb-1">Ngân hàng</p><p className="font-medium">{BANK_INFO.bankName} — {BANK_INFO.branch}</p></div>
                    </div>
                    <div className="flex flex-col items-center gap-3">
                      <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100"><img src={BANK_INFO.getQR(placedOrder.id, placedOrder.finalTotal)} alt="QR" className="w-32 h-32 object-contain" /></div>
                      <button onClick={() => handleDownloadQR(placedOrder.id, placedOrder.finalTotal)} className="flex items-center gap-2 text-[10px] font-bold uppercase text-gray-400 hover:text-black"><Download size={12} /> Tải mã QR</button>
                    </div>
                  </div>
                  <p className="text-[9px] text-gray-400 italic mt-5 pt-4 border-t border-gray-200 uppercase tracking-widest">* Nội dung chuyển khoản: <span className="font-bold text-black">#{placedOrder.id}</span></p>
                </div>
              )}

              <div className="mb-10">
                <h3 className="text-[11px] font-bold uppercase tracking-widest mb-5 pb-2 border-b border-gray-100">Chi tiết sản phẩm</h3>
                <div className="space-y-4">
                  {placedOrder.items?.map((item: any, idx: number) => (
                    <div key={idx} className="flex gap-4 items-center">
                      <div className="w-14 h-14 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0"><img src={item.image} alt={item.name} className="w-full h-full object-cover" /></div>
                      <div className="flex-grow">
                        <div className="flex justify-between"><h4 className="text-[11px] font-bold uppercase">{item.name}</h4><span className="text-xs font-bold">{item.price}</span></div>
                        <p className="text-[9px] text-gray-400 uppercase mt-1">{item.size} / {item.scent}</p>
                        <p className="text-[10px] mt-1">Số lượng: {item.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-7 space-y-3">
                <div className="flex justify-between text-xs uppercase text-gray-500"><span>Tạm tính</span><span>{placedOrder.total?.toLocaleString()}đ</span></div>
                <div className="flex justify-between text-xs uppercase text-gray-500"><span>Phí vận chuyển</span><span>{placedOrder.shippingFee===0?'Miễn phí':`${placedOrder.shippingFee?.toLocaleString()}đ`}</span></div>
                {placedOrder.discountAmount > 0 && <div className="flex justify-between text-xs uppercase text-green-600"><span>Giảm giá ({placedOrder.appliedVoucher})</span><span>-{placedOrder.discountAmount?.toLocaleString()}đ</span></div>}
                <div className="flex justify-between items-center pt-4 border-t border-gray-200"><span className="text-sm font-bold uppercase tracking-[0.2em]">Tổng cộng</span><span className="text-2xl font-bold">{placedOrder.finalTotal?.toLocaleString()}đ</span></div>
              </div>
            </div>
            <div className="p-8 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row gap-4">
              <button onClick={() => window.print()} className="flex-1 flex items-center justify-center gap-2 bg-white border border-gray-200 text-black py-4 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-gray-50"><Printer size={14} /> In hóa đơn</button>
              <button onClick={() => navigate('/auth')} className="flex-1 flex items-center justify-center bg-black text-white py-4 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-gray-800">Quản lý đơn hàng</button>
            </div>
          </div>
          <div className="mt-8 text-center"><Link to="/" className="text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-black">Tiếp tục mua sắm</Link></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f8f8] py-12 px-6 relative">
      {isSubmitting && (
        <div className="fixed inset-0 z-[200] bg-white/80 backdrop-blur-md flex flex-col items-center justify-center">
          <Loader2 size={48} className="text-black animate-spin" />
          <h2 className="mt-6 text-sm font-bold uppercase tracking-[0.3em] animate-pulse">Đang xử lý thanh toán...</h2>
          <p className="mt-2 text-[10px] text-gray-400 uppercase tracking-widest">Vui lòng không đóng trình duyệt</p>
        </div>
      )}
      <div className="max-w-6xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-black mb-8"><ChevronLeft size={12} /> Quay lại mua sắm</Link>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-7 space-y-8">
            <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
              <h2 className="text-xl font-bold uppercase tracking-widest mb-8 flex items-center gap-3"><span className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-sm">1</span> Thông tin giao hàng</h2>
              <form id="checkout-form" onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2"><label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Họ và tên</label><input type="text" required value={formData.name} onChange={(e) => setFormData({...formData,name:e.target.value})} className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 text-sm outline-none focus:ring-1 focus:ring-black" placeholder="Nguyễn Văn A" /></div>
                  <div className="space-y-2"><label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Số điện thoại</label><input type="tel" required value={formData.phone} onChange={(e) => setFormData({...formData,phone:e.target.value})} className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 text-sm outline-none focus:ring-1 focus:ring-black" placeholder="0901234567" /></div>
                </div>
                <div className="space-y-2"><label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Email</label><input type="email" required value={formData.email} onChange={(e) => setFormData({...formData,email:e.target.value})} className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 text-sm outline-none focus:ring-1 focus:ring-black" placeholder="email@example.com" /></div>
                <div className="space-y-2"><label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Địa chỉ cụ thể</label><input type="text" required value={formData.address} onChange={(e) => setFormData({...formData,address:e.target.value})} className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 text-sm outline-none focus:ring-1 focus:ring-black" placeholder="Số nhà, đường, phường, quận, tỉnh/thành phố..." /></div>
                <div className="space-y-2"><label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Ghi chú (tùy chọn)</label><textarea value={formData.note} onChange={(e) => setFormData({...formData,note:e.target.value})} className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 text-sm outline-none focus:ring-1 focus:ring-black resize-none" rows={3} placeholder="Ví dụ: Giao giờ hành chính..." /></div>
              </form>
            </div>

            <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
              <h2 className="text-xl font-bold uppercase tracking-widest mb-8 flex items-center gap-3"><span className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-sm">2</span> Phương thức thanh toán</h2>
              <div className="space-y-3">
                {[['COD','Thanh toán khi nhận hàng (COD)','Thanh toán bằng tiền mặt khi nhận hàng',Truck],['BANK','Chuyển khoản ngân hàng','Thông tin tài khoản hiển thị bên dưới',CreditCard]].map(([value, title, desc, Icon]: any) => (
                  <label key={value} className={`flex items-center gap-4 p-4 border rounded-2xl cursor-pointer transition-all ${formData.paymentMethod===value?'border-black bg-gray-50':'border-gray-100 hover:border-gray-200'}`}>
                    <input type="radio" name="payment" value={value} checked={formData.paymentMethod===value} onChange={(e) => setFormData({...formData,paymentMethod:e.target.value})} className="w-4 h-4 accent-black" />
                    <div className="flex-grow"><p className="text-sm font-bold uppercase tracking-widest">{title}</p><p className="text-[10px] text-gray-400 mt-0.5 uppercase tracking-widest">{desc}</p></div>
                    <Icon size={22} className="text-gray-400" />
                  </label>
                ))}
                {formData.paymentMethod === 'BANK' && (
                  <div className="mt-4 p-6 bg-gray-50 rounded-2xl border border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-3 text-xs">
                        <p className="text-[9px] uppercase font-bold tracking-widest text-gray-400">Thông tin tài khoản</p>
                        <div><p className="text-[9px] uppercase text-gray-400 mb-1">Chủ tài khoản</p><p className="font-bold">{BANK_INFO.accountHolder}</p></div>
                        <div><p className="text-[9px] uppercase text-gray-400 mb-1">Số tài khoản</p>
                          <div className="flex items-center gap-2"><p className="font-mono font-bold text-sm">{BANK_INFO.accountNumber}</p>
                            <button type="button" onClick={handleCopy} className="p-1.5 hover:bg-white rounded-lg text-gray-400 hover:text-black">{copied?<Check size={12} className="text-emerald-500"/>:<Copy size={12} />}</button>
                          </div>
                        </div>
                        <div><p className="text-[9px] uppercase text-gray-400 mb-1">Ngân hàng</p><p className="font-medium">{BANK_INFO.bankName} — {BANK_INFO.branch}</p></div>
                      </div>
                      <div className="flex flex-col items-center justify-center gap-3">
                        <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100"><img src={BANK_INFO.getQR('preview', totalPrice)} alt="QR" className="w-28 h-28 object-contain" /></div>
                        <p className="text-[9px] text-gray-400 italic uppercase tracking-widest text-center">* Nhập mã đơn hàng vào nội dung CK</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm sticky top-8">
              <h2 className="text-sm font-bold uppercase tracking-[0.2em] mb-8 pb-4 border-b border-gray-100">Tóm tắt đơn hàng ({totalItems})</h2>
              <div className="space-y-5 mb-8 max-h-[350px] overflow-y-auto pr-2">
                {cart.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="w-18 h-18 w-[72px] h-[72px] bg-gray-50 rounded-xl overflow-hidden flex-shrink-0"><img src={item.image} alt={item.name} className="w-full h-full object-cover" /></div>
                    <div className="flex-grow py-1">
                      <div className="flex justify-between items-start"><h3 className="text-[12px] font-bold uppercase tracking-wider">{item.name}</h3><span className="text-xs font-bold">{item.price}</span></div>
                      <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">{item.size} / {item.scent}</p>
                      <p className="text-[10px] font-mono mt-1.5">Số lượng: {item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3 pt-5 border-t border-gray-100">
                <div className="pb-4 border-b border-gray-100">
                  {!appliedVoucher ? (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <div className="relative flex-grow">
                          <Tag size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input type="text" value={voucherCode} onChange={(e) => setVoucherCode(e.target.value.toUpperCase())} placeholder="Mã giảm giá" className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-xs uppercase focus:outline-none focus:border-black" />
                        </div>
                        <button type="button" onClick={handleApplyVoucher} className="px-4 py-2 bg-gray-900 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-black whitespace-nowrap">Áp dụng</button>
                      </div>
                      {voucherError && <p className="text-[10px] text-red-500">{voucherError}</p>}
                    </div>
                  ) : (
                    <div className="flex items-center justify-between bg-green-50 p-3 rounded-xl border border-green-100">
                      <div className="flex items-center gap-2"><Tag size={13} className="text-green-600" /><span className="text-xs font-bold text-green-700 uppercase">{appliedVoucher.code}</span></div>
                      <button type="button" onClick={() => setAppliedVoucher(null)} className="text-gray-400 hover:text-red-500"><X size={13} /></button>
                    </div>
                  )}
                </div>
                <div className="flex justify-between text-xs uppercase text-gray-500 pt-1"><span>Tạm tính</span><span>{totalPrice.toLocaleString()}đ</span></div>
                <div className="flex justify-between text-xs uppercase text-gray-500"><span>Phí vận chuyển</span><span>{shippingFee===0?'Miễn phí':`${shippingFee.toLocaleString()}đ`}</span></div>
                {appliedVoucher && <div className="flex justify-between text-xs uppercase text-green-600"><span>Giảm giá ({appliedVoucher.code})</span><span>-{discountAmount.toLocaleString()}đ</span></div>}
                <div className="flex justify-between items-center pt-4 border-t border-gray-100"><span className="text-sm font-bold uppercase tracking-[0.2em]">Tổng cộng</span><span className="text-2xl font-bold">{finalTotal.toLocaleString()}đ</span></div>
              </div>

              <button form="checkout-form" type="submit" disabled={isSubmitting} className="w-full bg-black text-white py-5 rounded-2xl text-[11px] font-bold uppercase tracking-[0.3em] hover:bg-gray-800 transition-all mt-8 shadow-xl shadow-black/10 flex items-center justify-center gap-3 disabled:bg-gray-400">
                {isSubmitting ? <><Loader2 size={16} className="animate-spin" /> Đang xử lý...</> : 'Xác nhận thanh toán'}
              </button>

              <div className="mt-6 space-y-3">
                <div className="flex items-center gap-3 text-[10px] text-gray-400 uppercase tracking-widest"><ShieldCheck size={14} className="text-emerald-500" /><span>Thanh toán bảo mật & an toàn</span></div>
                <div className="flex items-center gap-3 text-[10px] text-gray-400 uppercase tracking-widest"><Truck size={14} className="text-blue-500" /><span>Giao hàng 2–4 ngày làm việc</span></div>
                <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-xl text-[10px] text-amber-700 uppercase tracking-widest"><Info size={14} className="flex-shrink-0 mt-0.5" /><span>Kiểm tra kỹ thông tin trước khi xác nhận.</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
