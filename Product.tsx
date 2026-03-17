import React, { useState, useEffect } from 'react';
import { Link, useParams, useLocation } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { parsePrice, formatPrice } from '../utils/auth';

const DEFAULT_PRODUCTS = [
  { id: '1', name: 'TRAVEL SET', size: '3 x 85 ml', scent: 'hinoki', priceNum: 1250000, price: '1.250.000đ', image: 'https://picsum.photos/seed/travelset/600/600' },
  { id: '2', name: 'SHAMPOO', size: '85 ml', scent: 'hinoki', priceNum: 320000, price: '320.000đ', image: 'https://picsum.photos/seed/shampoo1/600/600' },
  { id: '3', name: 'SHAMPOO', size: '250 ml', scent: 'hinoki', priceNum: 750000, price: '750.000đ', image: 'https://picsum.photos/seed/shampoo2/600/600' },
  { id: '4', name: 'SHAMPOO', size: '500 ml', scent: 'hinoki', priceNum: 1050000, price: '1.050.000đ', image: 'https://picsum.photos/seed/shampoo3/600/600' },
  { id: '5', name: 'SHAMPOO', size: '85 ml', scent: 'basil', priceNum: 320000, price: '320.000đ', image: 'https://picsum.photos/seed/shampoo4/600/600' },
  { id: '6', name: 'SHAMPOO', size: '250 ml', scent: 'basil', priceNum: 750000, price: '750.000đ', image: 'https://picsum.photos/seed/shampoo5/600/600' },
  { id: '7', name: 'SHAMPOO', size: '500 ml', scent: 'basil', priceNum: 1050000, price: '1.050.000đ', image: 'https://picsum.photos/seed/shampoo6/600/600' },
  { id: '8', name: 'CONDITIONER', size: '85 ml', scent: 'hinoki', priceNum: 320000, price: '320.000đ', image: 'https://picsum.photos/seed/cond1/600/600' },
  { id: '9', name: 'CONDITIONER', size: '250 ml', scent: 'hinoki', priceNum: 750000, price: '750.000đ', image: 'https://picsum.photos/seed/cond2/600/600' },
  { id: '10', name: 'CONDITIONER', size: '85 ml', scent: 'basil', priceNum: 320000, price: '320.000đ', image: 'https://picsum.photos/seed/cond3/600/600' },
  { id: '11', name: 'CONDITIONER', size: '250 ml', scent: 'basil', priceNum: 750000, price: '750.000đ', image: 'https://picsum.photos/seed/cond4/600/600' },
  { id: '12', name: 'HAIR MASK', size: '250 ml', scent: 'hinoki', priceNum: 820000, price: '820.000đ', image: 'https://picsum.photos/seed/hairmask/600/600' },
  { id: '13', name: 'SCRUB SHAMPOO', size: '300 g', scent: 'basil', priceNum: 820000, price: '820.000đ', image: 'https://picsum.photos/seed/scrub/600/600' },
];

const categoryMap: Record<string, string> = {
  'cleansing': 'Cleansing', 'toner-mist': 'Toner & Mist', 'cream': 'Cream',
  'special-treatment': 'Special Treatment', 'mask': 'Mask', 'sun-protection': 'Sun Protection',
  'professional-spa-line': 'Professional Spa Line', 'beauty-tools': 'Beauty Tools', 'gift': 'Gift',
};

export default function Category() {
  const { categoryId } = useParams();
  const location = useLocation();
  const searchQuery = new URLSearchParams(location.search).get('q') || '';
  const { addToCart, setIsCartOpen } = useCart();
  const [categoryBanner, setCategoryBanner] = useState<any>(null);
  const [allProducts, setAllProducts] = useState<any[]>(DEFAULT_PRODUCTS);

  useEffect(() => {
    // Load admin products — replace defaults if any admin products exist
    const savedProducts = localStorage.getItem('app_products');
    if (savedProducts) {
      const parsed = JSON.parse(savedProducts);
      if (parsed.length > 0) {
        const mapped = parsed.map((p: any) => {
          const priceNum = typeof p.price === 'number' ? p.price : parsePrice(p.priceFormatted || '');
          return { id: p.id.toString(), name: p.name, subtitle: p.subtitle, size: p.size || '1 item', scent: p.category, priceNum, price: p.priceFormatted || formatPrice(priceNum), image: p.image };
        });
        // Use admin products + keep defaults for IDs not present in admin
        const adminIds = new Set(mapped.map((p: any) => p.id));
        const keptDefaults = DEFAULT_PRODUCTS.filter(p => !adminIds.has(p.id));
        setAllProducts([...mapped, ...keptDefaults]);
      }
    }
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('app_banners');
    if (saved && categoryId) {
      const banners = JSON.parse(saved);
      const bannerName = categoryMap[categoryId];
      const banner = banners.find((b: any) => b.page === bannerName && b.status === 'Đang hiển thị');
      if (banner) setCategoryBanner(banner);
    }
  }, [categoryId]);

  const handleAddToCart = (product: any) => {
    addToCart({ id: product.id, name: product.name, priceNum: product.priceNum, price: product.price, image: product.image, size: product.size, scent: product.scent });
    setIsCartOpen(true);
  };

  const handleAddToWishlist = (product: any) => {
    const savedUser = localStorage.getItem('app_user');
    if (!savedUser) { alert('Vui lòng đăng nhập để sử dụng tính năng này'); return; }
    const user = JSON.parse(savedUser);
    const savedWishlist = localStorage.getItem('app_wishlist');
    const wishlist = savedWishlist ? JSON.parse(savedWishlist) : [];
    if (wishlist.some((item: any) => item.id === product.id && item.userEmail === user.email)) { alert('Sản phẩm đã có trong danh sách yêu thích'); return; }
    localStorage.setItem('app_wishlist', JSON.stringify([...wishlist, { ...product, userEmail: user.email }]));
    alert('Đã thêm vào danh sách yêu thích!');
  };

  const title = categoryId === 'search' ? `TÌM KIẾM: ${searchQuery}` : categoryId ? categoryId.replace(/-/g, ' ').toUpperCase() : 'SẢN PHẨM';

  const filteredProducts = categoryId === 'search' && searchQuery
    ? allProducts.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.scent.toLowerCase().includes(searchQuery.toLowerCase()))
    : allProducts;

  return (
    <div className="w-full">
      <div className="max-w-[1120px] mx-auto px-6 py-6 flex justify-between items-end">
        <div>
          <div className="text-[11px] tracking-widest uppercase mb-1 text-gray-500">
            <Link to="/" className="hover:text-black">Trang chủ</Link> / <span className="text-black">{title}</span>
          </div>
          <h1 className="text-2xl font-bold tracking-[0.1em] uppercase">{title}</h1>
        </div>
      </div>

      <div className="w-full h-[300px] md:h-[400px] relative overflow-hidden bg-gray-100">
        <img src={categoryBanner?.image || `https://picsum.photos/seed/${categoryId||'products'}/1600/600`} alt={title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
        <div className="absolute inset-0 flex items-center justify-center bg-black/10">
          <h2 className="text-white text-3xl md:text-5xl font-bold tracking-[0.3em] uppercase drop-shadow-lg">{categoryBanner?.title || title}</h2>
        </div>
      </div>

      <div className="max-w-[1120px] mx-auto px-2 md:px-6 py-8">
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4">
          {filteredProducts.length > 0 ? filteredProducts.map((product) => (
            <div key={product.id} className="group flex flex-col border border-gray-100 bg-[#fafafa] hover:shadow-sm transition-shadow">
              <Link to={`/product/${product.id}`} className="block relative aspect-square bg-[#8e8e8e] overflow-hidden">
                <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" referrerPolicy="no-referrer" />
                <button onClick={(e) => { e.preventDefault(); handleAddToWishlist(product); }} className="absolute top-2 right-2 p-2 bg-white/80 backdrop-blur-sm rounded-full text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all z-10"><Heart size={14} /></button>
              </Link>
              <div className="flex flex-col flex-grow">
                <div className="p-2 md:p-4 border-b border-gray-100">
                  <Link to={`/product/${product.id}`} className="text-sm md:text-base font-bold tracking-widest uppercase hover:text-gray-600 block">{product.name}</Link>
                  {product.subtitle && <p className="text-[11px] text-gray-500 mt-1">{product.subtitle}</p>}
                </div>
                <div className="p-2 md:p-4 border-b border-gray-100 font-mono text-[11px] md:text-[13px] leading-relaxed"><p>{product.size}</p><p className="mt-1">{product.scent}</p></div>
                <div className="p-2 md:p-4 flex justify-between items-center text-xs md:text-sm">
                  <button onClick={() => handleAddToCart(product)} className="text-[11px] md:text-xs underline decoration-black/20 underline-offset-4 hover:text-gray-600">Thêm vào giỏ</button>
                  <span className="font-bold">{product.price}</span>
                </div>
              </div>
            </div>
          )) : (
            <div className="col-span-full py-20 flex flex-col items-center justify-center text-center">
              <p className="text-gray-500 mb-4">Không tìm thấy sản phẩm nào.</p>
              <Link to="/category/products" className="text-black underline underline-offset-4 hover:text-gray-600">Xem tất cả sản phẩm</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
