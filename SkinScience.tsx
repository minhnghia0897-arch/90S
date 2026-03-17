import React, { useState, useEffect } from 'react';
import { CheckCircle2, LogOut, User as UserIcon, Package, Settings, Heart, ChevronRight, Trash2, Save, CreditCard, Copy, Check, Download, MapPin, Phone, Mail, Calendar, X, AlertCircle, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BANK_INFO, STORE, generateId } from '../utils/auth';

type Tab = 'orders' | 'wishlist' | 'settings';

export default function Auth() {
  const [accountType, setAccountType] = useState<'Khách Lẻ' | 'Đại Lý'>('Khách Lẻ');
  const [isRegistered, setIsRegistered] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('orders');
  const [orders, setOrders] = useState<any[]>([]);
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [registerError, setRegisterError] = useState('');
  const [settingsForm, setSettingsForm] = useState({ firstName: '', lastName: '', email: '', phone: '', address: '' });

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadQR = (orderId: string, total: number) => {
    const link = document.createElement('a');
    link.href = BANK_INFO.getQR(orderId, total);
    link.download = `QR_${orderId}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCancelOrder = (orderId: string) => {
    const savedOrders = localStorage.getItem('app_orders');
    if (savedOrders) {
      const allOrders = JSON.parse(savedOrders);
      const updatedOrders = allOrders.map((o: any) => o.id === orderId ? { ...o, status: 'Đã hủy' } : o);
      localStorage.setItem('app_orders', JSON.stringify(updatedOrders));
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'Đã hủy' } : o));
      window.dispatchEvent(new Event('orders-updated'));
      if (selectedOrder?.id === orderId) setSelectedOrder({ ...selectedOrder, status: 'Đã hủy' });
    }
  };

  const formatOrderDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      const now = new Date();
      const diffMin = Math.floor((now.getTime() - date.getTime()) / 60000);
      if (diffMin < 1) return 'Vừa xong';
      if (diffMin < 60) return `${diffMin} phút trước`;
      const diffH = Math.floor(diffMin / 60);
      if (diffH < 24) return `${diffH} giờ trước`;
      return date.toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch { return dateStr; }
  };

  useEffect(() => {
    const savedUser = localStorage.getItem('app_user');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      setSettingsForm({ firstName: parsedUser.firstName || '', lastName: parsedUser.lastName || '', email: parsedUser.email || '', phone: parsedUser.phone || '', address: parsedUser.address || '' });
      fetchUserData(parsedUser.email);
    }
    const handleUpdate = () => {
      const u = localStorage.getItem('app_user');
      if (u) fetchUserData(JSON.parse(u).email);
    };
    window.addEventListener('orders-updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => { window.removeEventListener('orders-updated', handleUpdate); window.removeEventListener('storage', handleUpdate); };
  }, []);

  const fetchUserData = (email: string) => {
    const savedOrders = localStorage.getItem('app_orders');
    if (savedOrders) {
      const all = JSON.parse(savedOrders);
      setOrders(all.filter((o: any) => o.customerEmail === email || o.email === email));
    } else { setOrders([]); }
    const savedWishlist = localStorage.getItem('app_wishlist');
    if (savedWishlist) {
      setWishlist(JSON.parse(savedWishlist).filter((i: any) => i.userEmail === email));
    } else { setWishlist([]); }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError('');
    setIsLoading(true);
    const formData = new FormData(e.target as HTMLFormElement);
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;
    if (password !== confirmPassword) {
      setRegisterError('Mật khẩu xác nhận không khớp');
      setIsLoading(false);
      return;
    }
    if (password.length < 6) {
      setRegisterError('Mật khẩu phải có ít nhất 6 ký tự');
      setIsLoading(false);
      return;
    }
    setTimeout(() => {
      const newUser = { id: generateId(), firstName: formData.get('firstName') as string, lastName: formData.get('lastName') as string, email: formData.get('email') as string, accountType };
      setIsRegistered(true);
      setIsLoading(false);
      setTimeout(() => {
        setUser(newUser);
        localStorage.setItem('app_user', JSON.stringify(newUser));
        window.dispatchEvent(new Event('user-changed'));
        setIsRegistered(false);
      }, 2000);
    }, 1500);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoading(true);
    const formData = new FormData(e.target as HTMLFormElement);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    if (!password || password.length < 1) {
      setLoginError('Vui lòng nhập mật khẩu');
      setIsLoading(false);
      return;
    }
    // Check if user exists in localStorage (registered users)
    setTimeout(() => {
      const savedUser = localStorage.getItem('app_user');
      if (savedUser) {
        const existing = JSON.parse(savedUser);
        if (existing.email === email) {
          setUser(existing);
          localStorage.setItem('app_user', JSON.stringify(existing));
          window.dispatchEvent(new Event('user-changed'));
          fetchUserData(email);
          setIsLoading(false);
          return;
        }
      }
      // New user login (demo: accept any email+password combination)
      const loggedInUser = { id: generateId(), firstName: email.split('@')[0], lastName: '', email, accountType: 'Khách Lẻ' };
      setUser(loggedInUser);
      localStorage.setItem('app_user', JSON.stringify(loggedInUser));
      window.dispatchEvent(new Event('user-changed'));
      fetchUserData(email);
      setIsLoading(false);
    }, 1000);
  };

  const handleLogout = () => { setUser(null); localStorage.removeItem('app_user'); window.dispatchEvent(new Event('user-changed')); };

  const handleUpdateSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedUser = { ...user, ...settingsForm };
    setUser(updatedUser);
    localStorage.setItem('app_user', JSON.stringify(updatedUser));
    window.dispatchEvent(new Event('user-changed'));
    alert('Cập nhật thông tin thành công!');
  };

  const handleDeleteAccount = () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa tài khoản? Hành động này không thể hoàn tác.')) {
      localStorage.removeItem('app_user');
      setUser(null);
      window.dispatchEvent(new Event('user-changed'));
    }
  };

  const removeFromWishlist = (productId: string) => {
    setWishlist(prev => prev.filter(item => item.id !== productId));
    const savedWishlist = localStorage.getItem('app_wishlist');
    if (savedWishlist) {
      const all = JSON.parse(savedWishlist);
      localStorage.setItem('app_wishlist', JSON.stringify(all.filter((i: any) => !(i.id === productId && i.userEmail === user.email))));
    }
  };

  if (user) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-16">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-black p-8 text-white">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center"><UserIcon size={32} /></div>
              <div>
                <h2 className="text-xl font-bold uppercase tracking-widest">Chào mừng, {user.firstName} {user.lastName}</h2>
                <p className="text-xs text-white/60 uppercase tracking-widest">{user.accountType || 'Khách Lẻ'}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-gray-100">
            <div className="p-8 space-y-6">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Tài khoản của tôi</h3>
              <nav className="space-y-2">
                {([['orders','Đơn hàng',Package],['wishlist','Yêu thích',Heart],['settings','Cài đặt',Settings]] as [Tab,string,any][]).map(([tab,label,Icon]) => (
                  <button key={tab} onClick={() => setActiveTab(tab)} className={`flex items-center gap-3 text-sm font-medium w-full p-3 rounded-xl transition-colors ${activeTab===tab?'bg-gray-50 text-black':'text-gray-500 hover:bg-gray-50'}`}>
                    <Icon size={18} className="flex-shrink-0" /> {label}
                  </button>
                ))}
                <button onClick={handleLogout} className="flex items-center gap-3 text-sm font-medium text-red-500 hover:text-red-600 w-full p-3 pt-4 border-t border-gray-50 mt-4">
                  <LogOut size={18} className="flex-shrink-0" /> Đăng xuất
                </button>
              </nav>
            </div>

            <div className="md:col-span-3 p-8">
              {activeTab === 'orders' && (
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-[0.2em] mb-6">Đơn hàng của tôi</h3>
                  {orders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center text-center py-12">
                      <Package size={48} className="text-gray-100 mb-4" />
                      <h4 className="text-sm font-bold uppercase tracking-widest mb-2">Bạn chưa có đơn hàng nào</h4>
                      <Link to="/category/products" className="bg-black text-white px-8 py-3 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-gray-800 mt-4 inline-block">Mua sắm ngay</Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.map((order) => (
                        <div key={order.id} className="bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-md transition-all">
                          <div className="p-5 flex flex-wrap items-center justify-between gap-4 border-b border-gray-50 bg-gray-50/30">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-gray-100"><Package size={18} className="text-gray-400" /></div>
                              <div>
                                <div className="flex items-center gap-2"><span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Đơn</span><span className="text-xs font-mono font-bold">#{order.id}</span></div>
                                <div className="flex items-center gap-1 text-[10px] text-gray-400"><Clock size={9} />{formatOrderDate(order.date)}</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${order.status==='Đã giao'||order.status==='Hoàn thành'?'bg-emerald-50 text-emerald-600':order.status==='Đã hủy'?'bg-red-50 text-red-600':'bg-amber-50 text-amber-600'}`}>{order.status}</span>
                              {(order.status==='Chờ xử lý'||order.status==='Đang xử lý') && (
                                <button onClick={() => window.confirm('Hủy đơn hàng này?') && handleCancelOrder(order.id)} className="text-[10px] font-bold text-red-500 hover:text-red-700 flex items-center gap-1"><AlertCircle size={12} /> Hủy</button>
                              )}
                            </div>
                          </div>
                          <div className="p-5 flex items-center justify-between gap-4">
                            <div className="flex -space-x-2">
                              {order.items?.slice(0,3).map((item: any, idx: number) => (
                                <div key={idx} className="w-10 h-10 rounded-lg ring-2 ring-white overflow-hidden border border-gray-100">
                                  <img src={item.image} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                </div>
                              ))}
                            </div>
                            <span className="text-lg font-bold">{typeof(order.finalTotal||order.total)==='number'?(order.finalTotal||order.total).toLocaleString():order.finalTotal||order.total}đ</span>
                            <button onClick={() => setSelectedOrder(order)} className="px-4 py-2 bg-black text-white text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-gray-800">Chi tiết <ChevronRight size={12} className="inline" /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {selectedOrder && (
                <div className="fixed inset-0 z-[300] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6">
                  <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
                    <div className="sticky top-0 bg-white border-b border-gray-100 p-6 flex justify-between items-center z-10">
                      <h3 className="text-sm font-bold uppercase tracking-[0.2em]">Chi tiết đơn #{selectedOrder.id}</h3>
                      <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-gray-100 rounded-full"><X size={20} /></button>
                    </div>
                    <div className="p-8 space-y-6">
                      <div className="grid grid-cols-2 gap-6 pb-6 border-b border-gray-100">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Trạng thái</p>
                          <span className={`text-[10px] font-bold uppercase px-3 py-1 rounded-full ${selectedOrder.status==='Đã giao'?'bg-emerald-50 text-emerald-600':selectedOrder.status==='Đã hủy'?'bg-red-50 text-red-600':'bg-amber-50 text-amber-600'}`}>{selectedOrder.status}</span>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Thanh toán</p>
                          <span className={`text-[10px] font-bold uppercase px-3 py-1 rounded-full ${selectedOrder.paymentStatus==='Đã thanh toán'?'bg-emerald-50 text-emerald-600':'bg-amber-50 text-amber-600'}`}>{selectedOrder.paymentStatus}</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3 flex items-center gap-2"><MapPin size={12} /> Thông tin giao hàng</p>
                        <div className="bg-gray-50 rounded-xl p-4 space-y-1 text-xs text-gray-600">
                          <p className="font-bold text-black">{selectedOrder.customerName||selectedOrder.customer}</p>
                          <p className="flex items-center gap-2"><Phone size={11} />{selectedOrder.customerPhone||selectedOrder.phone}</p>
                          <p className="flex items-center gap-2"><Mail size={11} />{selectedOrder.customerEmail||selectedOrder.email}</p>
                          <p className="italic mt-2 pt-2 border-t border-gray-200">"{selectedOrder.address}"</p>
                        </div>
                      </div>
                      {selectedOrder.paymentMethod==='BANK' && (
                        <div className="p-5 bg-amber-50 rounded-xl border border-amber-100">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-amber-700 mb-4 flex items-center gap-2"><CreditCard size={12} /> Thông tin chuyển khoản</p>
                          <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-3 text-xs">
                              <div><p className="text-[9px] uppercase text-amber-600 mb-1">Chủ tài khoản</p><p className="font-bold">{BANK_INFO.accountHolder}</p></div>
                              <div><p className="text-[9px] uppercase text-amber-600 mb-1">Số tài khoản</p>
                                <div className="flex items-center gap-2"><span className="font-mono font-bold">{BANK_INFO.accountNumber}</span>
                                  <button onClick={() => handleCopy(BANK_INFO.accountNumber)} className="p-1 bg-white rounded hover:bg-gray-100">{copied?<Check size={12} className="text-emerald-500"/>:<Copy size={12} />}</button>
                                </div>
                              </div>
                              <div><p className="text-[9px] uppercase text-amber-600 mb-1">Ngân hàng</p><p className="font-medium">{BANK_INFO.bankName}</p></div>
                            </div>
                            <div className="flex flex-col items-center gap-2">
                              <img src={BANK_INFO.getQR(selectedOrder.id, selectedOrder.finalTotal||selectedOrder.total)} alt="QR" className="w-24 h-24" />
                              <button onClick={() => handleDownloadQR(selectedOrder.id, selectedOrder.finalTotal||selectedOrder.total)} className="text-[9px] font-bold uppercase text-amber-700 hover:underline flex items-center gap-1"><Download size={10} /> Tải QR</button>
                            </div>
                          </div>
                          <p className="text-[9px] text-amber-700 italic mt-4 border-t border-amber-100 pt-3">* Nội dung: <span className="font-bold">#{selectedOrder.id}</span></p>
                        </div>
                      )}
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">Sản phẩm</p>
                        <div className="space-y-3">
                          {selectedOrder.items?.map((item: any, idx: number) => (
                            <div key={idx} className="flex gap-3 items-center">
                              <img src={item.image} alt="" className="w-12 h-12 rounded-lg object-cover" />
                              <div className="flex-grow"><p className="text-xs font-bold uppercase">{item.name}</p><p className="text-[10px] text-gray-400">x{item.quantity}</p></div>
                              <p className="text-xs font-bold">{item.price}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-5 space-y-2">
                        <div className="flex justify-between text-[10px] uppercase text-gray-500"><span>Tạm tính</span><span>{selectedOrder.total?.toLocaleString()}đ</span></div>
                        <div className="flex justify-between text-[10px] uppercase text-gray-500"><span>Phí vận chuyển</span><span>{selectedOrder.shippingFee===0?'Miễn phí':`${selectedOrder.shippingFee?.toLocaleString()}đ`}</span></div>
                        {selectedOrder.discountAmount>0 && <div className="flex justify-between text-[10px] uppercase text-green-600"><span>Giảm giá</span><span>-{selectedOrder.discountAmount?.toLocaleString()}đ</span></div>}
                        <div className="flex justify-between pt-3 border-t border-gray-200"><span className="text-xs font-bold uppercase">Tổng cộng</span><span className="text-lg font-bold">{(selectedOrder.finalTotal||selectedOrder.total)?.toLocaleString()}đ</span></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'wishlist' && (
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-[0.2em] mb-6">Danh sách yêu thích</h3>
                  {wishlist.length === 0 ? (
                    <div className="flex flex-col items-center py-12">
                      <Heart size={48} className="text-gray-100 mb-4" />
                      <Link to="/category/products" className="bg-black text-white px-8 py-3 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-gray-800 mt-4 inline-block">Khám phá sản phẩm</Link>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {wishlist.map((item) => (
                        <div key={item.id} className="group bg-white border border-gray-100 rounded-2xl p-4 hover:shadow-md transition-all">
                          <div className="aspect-square bg-gray-50 rounded-xl overflow-hidden mb-3 relative">
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" referrerPolicy="no-referrer" />
                            <button onClick={() => removeFromWishlist(item.id)} className="absolute top-2 right-2 p-2 bg-white/90 rounded-lg text-red-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={14} /></button>
                          </div>
                          <h4 className="text-sm font-bold uppercase tracking-wider mb-1 line-clamp-1">{item.name}</h4>
                          <p className="text-xs text-gray-400 font-bold uppercase mb-3">{item.price}</p>
                          <Link to={`/product/${item.id}`} className="block w-full text-center py-2 bg-black text-white text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-gray-800">Xem chi tiết</Link>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'settings' && (
                <div className="space-y-10">
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-[0.2em] mb-6">Cài đặt tài khoản</h3>
                    <form onSubmit={handleUpdateSettings} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[['lastName','Họ',settingsForm.lastName,(v:string)=>setSettingsForm({...settingsForm,lastName:v})],['firstName','Tên',settingsForm.firstName,(v:string)=>setSettingsForm({...settingsForm,firstName:v})],['phone','Số điện thoại',settingsForm.phone,(v:string)=>setSettingsForm({...settingsForm,phone:v})]].map(([field,label,val,setter]: any) => (
                          <div key={field} className="space-y-1">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{label}</label>
                            <input type="text" value={val} onChange={(e)=>setter(e.target.value)} className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 text-sm outline-none focus:ring-1 focus:ring-black" />
                          </div>
                        ))}
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Email</label>
                          <input type="email" value={settingsForm.email} disabled className="w-full bg-gray-100 border border-gray-100 rounded-xl py-3 px-4 text-sm text-gray-400 cursor-not-allowed" />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Địa chỉ giao hàng mặc định</label>
                        <textarea rows={3} value={settingsForm.address} onChange={(e)=>setSettingsForm({...settingsForm,address:e.target.value})} className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 text-sm outline-none focus:ring-1 focus:ring-black resize-none" />
                      </div>
                      <button type="submit" className="flex items-center gap-2 bg-black text-white px-6 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-gray-800"><Save size={14} /> Lưu thông tin</button>
                    </form>
                  </div>
                  <div className="pt-8 border-t border-gray-50">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-red-500 mb-4">Vùng nguy hiểm</h4>
                    <div className="bg-red-50/50 border border-red-100 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <p className="text-xs font-bold text-red-900 uppercase tracking-widest mb-1">Xóa tài khoản</p>
                        <p className="text-[10px] text-red-600">Tất cả dữ liệu sẽ bị xóa vĩnh viễn.</p>
                      </div>
                      <button onClick={handleDeleteAccount} className="px-5 py-2 bg-red-500 text-white text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-red-600">Xóa tài khoản</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isRegistered) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-32 flex flex-col items-center justify-center text-center">
        <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-6"><CheckCircle2 size={40} /></div>
        <h2 className="text-3xl font-bold tracking-[0.2em] uppercase mb-4">Đăng ký thành công!</h2>
        <p className="text-gray-500 uppercase tracking-widest text-xs mb-8">Chào mừng bạn đến với {STORE.name}.</p>
        <div className="flex items-center gap-3 text-gray-400">
          <div className="w-4 h-4 border-2 border-gray-200 border-t-black rounded-full animate-spin" />
          <span className="text-[10px] font-bold uppercase tracking-widest">Đang chuyển hướng...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-16">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24">
        <div className={isLoading ? 'opacity-50 pointer-events-none' : ''}>
          <h2 className="text-2xl font-bold tracking-[0.2em] uppercase mb-8">Đăng ký tài khoản</h2>
          {registerError && <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 text-xs rounded-lg">{registerError}</div>}
          <form onSubmit={handleRegister} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-xs font-bold tracking-widest uppercase mb-2">Họ</label><input name="lastName" type="text" required className="w-full border border-gray-300 p-3 text-sm focus:outline-none focus:border-black" placeholder="Nguyễn" /></div>
              <div><label className="block text-xs font-bold tracking-widest uppercase mb-2">Tên</label><input name="firstName" type="text" required className="w-full border border-gray-300 p-3 text-sm focus:outline-none focus:border-black" placeholder="Văn A" /></div>
            </div>
            <div>
              <label className="block text-xs font-bold tracking-widest uppercase mb-2">Loại tài khoản</label>
              <div className="grid grid-cols-2 gap-3">
                {(['Khách Lẻ','Đại Lý'] as const).map(type => (
                  <button key={type} type="button" onClick={() => setAccountType(type)} className={`py-3 text-xs font-bold uppercase tracking-widest border transition-all ${accountType===type?'bg-black text-white border-black':'bg-white text-gray-500 border-gray-300 hover:border-black'}`}>{type}</button>
                ))}
              </div>
            </div>
            <div><label className="block text-xs font-bold tracking-widest uppercase mb-2">Email</label><input name="email" type="email" required className="w-full border border-gray-300 p-3 text-sm focus:outline-none focus:border-black" placeholder="email@example.com" /></div>
            <div><label className="block text-xs font-bold tracking-widest uppercase mb-2">Mật khẩu</label><input name="password" type="password" required minLength={6} className="w-full border border-gray-300 p-3 text-sm focus:outline-none focus:border-black" placeholder="Ít nhất 6 ký tự" /></div>
            <div><label className="block text-xs font-bold tracking-widest uppercase mb-2">Xác nhận mật khẩu</label><input name="confirmPassword" type="password" required minLength={6} className="w-full border border-gray-300 p-3 text-sm focus:outline-none focus:border-black" placeholder="Nhập lại mật khẩu" /></div>
            <button type="submit" className="w-full bg-black text-white text-xs font-bold tracking-widest uppercase py-4 hover:bg-gray-800 transition-colors flex items-center justify-center gap-2">
              {isLoading && <div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin" />} Tạo tài khoản
            </button>
          </form>
        </div>

        <div className={isLoading ? 'opacity-50 pointer-events-none' : ''}>
          <h2 className="text-2xl font-bold tracking-[0.2em] uppercase mb-8">Đăng nhập</h2>
          {loginError && <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 text-xs rounded-lg">{loginError}</div>}
          <form onSubmit={handleLogin} className="space-y-5">
            <div><label className="block text-xs font-bold tracking-widest uppercase mb-2">Email</label><input name="email" type="email" required className="w-full border border-gray-300 p-3 text-sm focus:outline-none focus:border-black" placeholder="email@example.com" /></div>
            <div><label className="block text-xs font-bold tracking-widest uppercase mb-2">Mật khẩu</label><input name="password" type="password" required className="w-full border border-gray-300 p-3 text-sm focus:outline-none focus:border-black" placeholder="••••••••" /></div>
            <button type="submit" className="w-full bg-black text-white text-xs font-bold tracking-widest uppercase py-4 hover:bg-gray-800 transition-colors flex items-center justify-center gap-2">
              {isLoading && <div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin" />} Đăng nhập
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
