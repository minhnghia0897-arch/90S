import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { verifyAdminCredentials, STORE } from '../../utils/auth';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const ok = await verifyAdminCredentials(username.trim(), password);
      if (ok) {
        localStorage.setItem('admin_auth', 'true');
        navigate('/admin');
      } else {
        setError('Tên đăng nhập hoặc mật khẩu không chính xác');
      }
    } catch {
      setError('Có lỗi xảy ra, vui lòng thử lại');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 md:p-12">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold tracking-tighter uppercase mb-2">{STORE.name}</h1>
          <p className="text-gray-500 text-sm uppercase tracking-widest">Hệ thống quản trị</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {error && (
            <div className="bg-red-50 text-red-500 text-xs p-3 rounded-lg border border-red-100">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block ml-1">Tên đăng nhập</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-gray-50 border-none rounded-xl py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-black transition-all outline-none"
                placeholder="admin"
                required
                autoComplete="username"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block ml-1">Mật khẩu</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-50 border-none rounded-xl py-3 pl-10 pr-10 text-sm focus:ring-2 focus:ring-black transition-all outline-none"
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-black text-white rounded-xl py-4 text-xs font-bold uppercase tracking-[0.2em] hover:bg-gray-800 transition-all flex items-center justify-center group disabled:bg-gray-400"
          >
            {isLoading ? 'Đang xác thực...' : <>Đăng nhập <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" /></>}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-[10px] text-gray-400 uppercase tracking-widest">
            Quên mật khẩu? Liên hệ quản trị viên hệ thống
          </p>
        </div>
      </div>
    </div>
  );
}
