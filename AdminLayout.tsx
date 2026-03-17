import React, { useState, useMemo, useEffect } from 'react';
import { TrendingUp, Users, ShoppingBag, DollarSign, ArrowUpRight, ArrowDownRight, Calendar as CalendarIcon } from 'lucide-react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

type FilterType = 'day' | 'week' | 'month' | 'year' | 'range';

export default function Dashboard() {
  const [filter, setFilter] = useState<FilterType>('week');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [realOrders, setRealOrders] = useState<any[]>([]);

  // Load real orders from localStorage
  useEffect(() => {
    const loadOrders = () => {
      const saved = localStorage.getItem('app_orders');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setRealOrders(parsed);
        } catch { setRealOrders([]); }
      }
    };
    loadOrders();
    window.addEventListener('orders-updated', loadOrders);
    window.addEventListener('storage', loadOrders);
    return () => { window.removeEventListener('orders-updated', loadOrders); window.removeEventListener('storage', loadOrders); };
  }, []);

  // Normalize orders: parse timestamp, get numeric total
  const allOrders = useMemo(() => {
    return realOrders.map((o: any) => ({
      ...o,
      _timestamp: o.timestamp || Date.now(),
      _total: typeof (o.finalTotal || o.total) === 'number' ? (o.finalTotal || o.total) : 0,
    }));
  }, [realOrders]);

  const filteredOrders = useMemo(() => {
    const now = new Date();
    let result = allOrders;
    if (filter === 'range') {
      const s = new Date(startDate); s.setHours(0,0,0,0);
      const e = new Date(endDate); e.setHours(23,59,59,999);
      result = allOrders.filter(o => o._timestamp >= s.getTime() && o._timestamp <= e.getTime());
    } else {
      const start = new Date(now);
      if (filter === 'day') start.setHours(0,0,0,0);
      else if (filter === 'week') start.setDate(now.getDate()-7);
      else if (filter === 'month') start.setMonth(now.getMonth()-1);
      else if (filter === 'year') start.setFullYear(now.getFullYear()-1);
      result = allOrders.filter(o => o._timestamp >= start.getTime());
    }
    return result.filter(o => o.status !== 'Đã hủy');
  }, [allOrders, filter, startDate, endDate]);

  const chartData = useMemo(() => {
    const dataMap: Record<string, { name: string; sales: number; orders: number }> = {};
    if (filter === 'week') {
      const days = ['T2','T3','T4','T5','T6','T7','CN'];
      days.forEach(d => dataMap[d] = { name: d, sales: 0, orders: 0 });
      filteredOrders.forEach(o => {
        const d = new Date(o._timestamp);
        const dayIdx = d.getDay(); // 0=Sun
        const key = ['CN','T2','T3','T4','T5','T6','T7'][dayIdx];
        if (dataMap[key]) { dataMap[key].sales += o._total/1000; dataMap[key].orders += 1; }
      });
      return ['T2','T3','T4','T5','T6','T7','CN'].map(d => dataMap[d]);
    } else if (filter === 'month') {
      for (let i=1;i<=4;i++) { const k=`Tuần ${i}`; dataMap[k]={name:k,sales:0,orders:0}; }
      filteredOrders.forEach(o => {
        const d = new Date(o._timestamp);
        const week = Math.min(Math.floor((d.getDate()-1)/7)+1,4);
        const k = `Tuần ${week}`;
        dataMap[k].sales += o._total/1000; dataMap[k].orders += 1;
      });
    } else if (filter === 'year' || filter === 'range') {
      for (let i=1;i<=12;i++) { const k=`T${i}`; dataMap[k]={name:k,sales:0,orders:0}; }
      filteredOrders.forEach(o => {
        const d = new Date(o._timestamp);
        const k = `T${d.getMonth()+1}`;
        if (dataMap[k]) { dataMap[k].sales += o._total/1000; dataMap[k].orders += 1; }
      });
    } else { // day
      for (let h=0;h<24;h+=4) { const k=`${h}h`; dataMap[k]={name:k,sales:0,orders:0}; }
      filteredOrders.forEach(o => {
        const d = new Date(o._timestamp);
        const h = Math.floor(d.getHours()/4)*4;
        const k = `${h}h`;
        if (dataMap[k]) { dataMap[k].sales += o._total/1000; dataMap[k].orders += 1; }
      });
    }
    return Object.values(dataMap);
  }, [filteredOrders, filter]);

  const stats = useMemo(() => {
    const totalSales = filteredOrders.reduce((acc, o) => acc + o._total, 0);
    const totalOrders = filteredOrders.length;
    const totalItems = filteredOrders.reduce((acc, o) => acc + (o.items?.length || 0), 0);
    const uniqueCustomers = new Set(filteredOrders.map(o => o.customerEmail || o.email)).size;
    return [
      { label: 'Tổng doanh thu', value: `${totalSales.toLocaleString('vi-VN')}đ`, icon: DollarSign },
      { label: 'Đơn hàng', value: totalOrders.toString(), icon: ShoppingBag },
      { label: 'Sản phẩm đã bán', value: totalItems.toString(), icon: TrendingUp },
      { label: 'Khách hàng', value: uniqueCustomers.toString(), icon: Users },
    ];
  }, [filteredOrders]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold tracking-tight uppercase">Tổng quan kinh doanh</h1>
          <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">Dữ liệu từ đơn hàng thực tế</p>
        </div>
        <div className="flex flex-col lg:flex-row items-center gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-2 bg-gray-50 p-2 rounded-xl w-full lg:w-auto">
            <div className="relative w-full sm:w-auto"><CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={12} /><input type="date" value={startDate} onChange={(e) => { setStartDate(e.target.value); setFilter('range'); }} className="w-full sm:w-40 bg-white border border-gray-100 rounded-lg py-1.5 pl-9 pr-3 text-[10px] font-bold focus:ring-1 focus:ring-black outline-none cursor-pointer" /></div>
            <span className="text-[10px] font-bold text-gray-400 uppercase">đến</span>
            <div className="relative w-full sm:w-auto"><CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={12} /><input type="date" value={endDate} onChange={(e) => { setEndDate(e.target.value); setFilter('range'); }} className="w-full sm:w-40 bg-white border border-gray-100 rounded-lg py-1.5 pl-9 pr-3 text-[10px] font-bold focus:ring-1 focus:ring-black outline-none cursor-pointer" /></div>
          </div>
          <div className="flex items-center bg-gray-50 p-1 rounded-xl w-full lg:w-auto overflow-x-auto">
            {(['day','week','month','year'] as FilterType[]).map(type => (
              <button key={type} onClick={() => setFilter(type)} className={`flex-1 lg:flex-none px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest whitespace-nowrap transition-all ${filter===type?'bg-black text-white shadow-md':'text-gray-400 hover:text-black'}`}>
                {type==='day'?'Ngày':type==='week'?'Tuần':type==='month'?'Tháng':'Năm'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-gray-50 rounded-lg"><stat.icon size={20} className="text-black" /></div>
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">{stat.label}</p>
            <h3 className="text-2xl font-bold tracking-tight">{stat.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-bold uppercase tracking-wider mb-8">Doanh thu theo {filter==='day'?'giờ':filter==='week'?'ngày':filter==='month'?'tuần':'tháng'}</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#000" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#000" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af', fontWeight: 600 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af', fontWeight: 600 }} />
                <Tooltip contentStyle={{ borderRadius:'12px',border:'none',boxShadow:'0 10px 15px -3px rgb(0 0 0 / 0.1)' }} formatter={(value: number) => [`${(value*1000).toLocaleString('vi-VN')}đ`,'Doanh thu']} />
                <Area type="monotone" dataKey="sales" stroke="#000" strokeWidth={2} fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-bold uppercase tracking-wider mb-8">Đơn hàng gần đây</h3>
          <div className="space-y-5 max-h-[400px] overflow-y-auto pr-1">
            {filteredOrders.length > 0 ? filteredOrders.slice(0,10).map((order) => (
              <div key={order.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-[9px] font-bold">{order.id?.slice(-4)}</div>
                  <div>
                    <p className="text-sm font-bold">{order.customerName || order.customer || 'Khách hàng'}</p>
                    <p className="text-[10px] text-gray-400 uppercase">{order._total.toLocaleString('vi-VN')}đ</p>
                  </div>
                </div>
                <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${order.status==='Đã giao'?'bg-emerald-50 text-emerald-600':order.status==='Đã hủy'?'bg-red-50 text-red-600':'bg-amber-50 text-amber-600'}`}>{order.status}</span>
              </div>
            )) : (
              <div className="text-center py-10">
                <p className="text-xs text-gray-400 uppercase tracking-widest">Chưa có đơn hàng nào</p>
                <p className="text-[10px] text-gray-300 mt-2">Đặt đơn đầu tiên từ trang shop!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
