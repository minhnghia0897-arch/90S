import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Package, ShoppingCart, Users,
  Image as ImageIcon, FileText, LogOut, Menu, X,
  ChevronRight, Tag
} from 'lucide-react';
import { STORE } from '../../utils/auth';

const SIDEBAR_ITEMS = [
  { icon: LayoutDashboard, label: 'Bảng điều khiển', path: '/admin' },
  { icon: ShoppingCart,    label: 'Đơn hàng',        path: '/admin/orders' },
  { icon: Package,         label: 'Sản phẩm',         path: '/admin/products' },
  { icon: Users,           label: 'Khách hàng',       path: '/admin/customers' },
  { icon: FileText,        label: 'Bài viết',         path: '/admin/seo' },
  { icon: ImageIcon,       label: 'Banner & Hero',    path: '/admin/banners' },
  { icon: Tag,             label: 'Mã giảm giá',      path: '/admin/vouchers' },
];

export default function AdminLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const auth = localStorage.getItem('admin_auth');
    if (auth === 'true') {
      setIsAuthenticated(true);
    } else if (location.pathname !== '/admin/login') {
      navigate('/admin/login');
    }
  }, [location.pathname, navigate]);

  if (location.pathname === '/admin/login') return <Outlet />;
  if (!isAuthenticated) return null;

  const activeLabel = SIDEBAR_ITEMS.find(i => i.path === location.pathname)?.label || 'Bảng điều khiển';

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className={`bg-white border-r border-gray-100 transition-all duration-300 flex flex-col fixed inset-y-0 left-0 z-50 shadow-sm ${isSidebarOpen ? 'w-64' : 'w-20'}`}>
        <div className="p-5 flex items-center justify-between border-b border-gray-100 h-16">
          {isSidebarOpen && (
            <span className="font-bold tracking-tighter text-base uppercase leading-none">
              {STORE.name}<br />
              <span className="text-[9px] font-normal text-gray-400 tracking-widest">Quản trị hệ thống</span>
            </span>
          )}
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0 ml-auto">
            {isSidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {SIDEBAR_ITEMS.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <div key={item.path} className="relative group">
                <Link
                  to={item.path}
                  className={`flex items-center p-3 rounded-xl transition-all ${isActive ? 'bg-black text-white shadow-md' : 'text-gray-500 hover:bg-gray-100 hover:text-black'}`}
                >
                  <item.icon size={20} className={`flex-shrink-0 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-black'}`} />
                  {isSidebarOpen && <span className="ml-3 font-medium text-sm truncate">{item.label}</span>}
                </Link>
                {/* Tooltip when collapsed — fixed z-index to avoid being covered */}
                {!isSidebarOpen && (
                  <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 bg-black text-white px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-widest whitespace-nowrap z-[200] opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
                    {item.label}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className="p-3 border-t border-gray-100">
          <div className="relative group">
            <button
              onClick={() => { localStorage.removeItem('admin_auth'); navigate('/admin/login'); }}
              className={`flex items-center w-full p-3 rounded-xl text-red-500 hover:bg-red-50 transition-all ${!isSidebarOpen ? 'justify-center' : ''}`}
            >
              <LogOut size={20} className="flex-shrink-0" />
              {isSidebarOpen && <span className="ml-3 font-medium text-sm">Đăng xuất</span>}
            </button>
            {!isSidebarOpen && (
              <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 bg-black text-white px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-widest whitespace-nowrap z-[200] opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
                Đăng xuất
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className={`flex-1 transition-all duration-300 min-h-screen flex flex-col ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>
        <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-8 sticky top-0 z-40 shadow-sm">
          <div className="flex items-center text-sm text-gray-400">
            <span className="text-[10px] uppercase tracking-widest">Quản trị</span>
            <ChevronRight size={12} className="mx-2 text-gray-300" />
            <span className="text-black font-bold text-[11px] uppercase tracking-widest">{activeLabel}</span>
          </div>
          <div className="flex items-center space-x-3">
            <Link to="/" target="_blank" className="text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-black px-3 py-1.5 border border-gray-100 rounded-lg">Xem trang</Link>
            <div className="w-9 h-9 rounded-full bg-black text-white flex items-center justify-center text-xs font-bold">AD</div>
          </div>
        </header>
        <div className="flex-1 p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
