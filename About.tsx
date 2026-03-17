import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChevronDown, Package, Heart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { sanitizeHTML } from '../utils/sanitize';
import { parsePrice, formatPrice, STORE } from '../utils/auth';

const recommendations = [
  { id: 'r1', name: 'SHOWER SET', size: '3 x 250 ml', scent: 'hinoki', priceNum: 2150000, price: '2.150.000đ', image: 'https://picsum.photos/seed/showerset1/600/800' },
  { id: 'r2', name: 'SHOWER GEL', size: '500 ml', scent: 'basil', priceNum: 950000, price: '950.000đ', image: 'https://picsum.photos/seed/showergel1/600/800' },
];

export default function Product() {
  const { productId } = useParams();
  const { addToCart, setIsCartOpen } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [productData, setProductData] = useState<any>({
    id: productId || 'main-product',
    name: 'BỘ SẢN PHẨM CHĂM SÓC DA',
    subtitle: '',
    size: '150 ml',
    scent: 'dưỡng ẩm',
    priceNum: 2150000,
    price: '2.150.000đ',
    image: 'https://picsum.photos/seed/showersetmain/1000/1000',
    description: 'Sản phẩm chăm sóc da cao cấp, phù hợp mọi loại da.'
  });

  useEffect(() => {
    if (productId) {
      const savedProducts = localStorage.getItem('app_products');
      if (savedProducts) {
        const parsed = JSON.parse(savedProducts);
        const found = parsed.find((p: any) => p.id.toString() === productId);
        if (found) {
          const priceNum = typeof found.price === 'number' ? found.price : parsePrice(found.priceFormatted || '');
          setProductData({
            id: found.id.toString(),
            name: found.name,
            subtitle: found.subtitle || '',
            size: found.size || '1 item',
            scent: found.category || '',
            priceNum,
            price: found.priceFormatted || formatPrice(priceNum),
            image: found.image,
            description: found.description || ''
          });
        }
      }
    }
  }, [productId]);

  const handleAddToCart = () => {
    addToCart({ ...productData, quantity });
    setIsCartOpen(true);
  };

  const handleAddToWishlist = () => {
    const savedUser = localStorage.getItem('app_user');
    if (!savedUser) { alert('Vui lòng đăng nhập để sử dụng tính năng này'); return; }
    const user = JSON.parse(savedUser);
    const savedWishlist = localStorage.getItem('app_wishlist');
    const wishlist = savedWishlist ? JSON.parse(savedWishlist) : [];
    if (wishlist.some((item: any) => item.id === productData.id && item.userEmail === user.email)) { alert('Sản phẩm đã có trong danh sách yêu thích'); return; }
    localStorage.setItem('app_wishlist', JSON.stringify([...wishlist, { ...productData, userEmail: user.email }]));
    alert('Đã thêm vào danh sách yêu thích!');
  };

  return (
    <div className="w-full bg-[#f4f4f4]">
      <div className="max-w-[1400px] mx-auto flex flex-col lg:flex-row items-stretch">
        <div className="w-full lg:w-[60%] px-6 py-8 md:pl-12 md:pr-12 flex flex-col">
          <div className="text-[14px] mb-8 text-black">Trang chủ / {productData.scent || 'Sản phẩm'}</div>
          <div className="flex flex-col-reverse md:flex-row gap-4 md:gap-6">
            <div className="w-full md:w-24 flex flex-row md:flex-col gap-4">
              <div className="w-16 md:w-full aspect-square bg-[#8e8e8e] border border-transparent hover:border-black cursor-pointer overflow-hidden">
                <img src={productData.image} alt="Thumbnail" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
            </div>
            <div className="flex-1 bg-[#8e8e8e] aspect-square relative overflow-hidden">
              <img src={productData.image} alt={productData.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>
          </div>
        </div>

        <div className="w-full lg:w-[40%] bg-[#f4f4f4] border-l border-gray-200 flex flex-col">
          <div className="px-6 pt-8 pb-6 md:px-8">
            <h1 className="text-[24px] md:text-[28px] font-bold tracking-widest uppercase mb-1">{productData.name}</h1>
            {productData.subtitle && <p className="text-[13px] text-gray-500 mb-3">{productData.subtitle}</p>}
            <div className="text-[16px] md:text-[18px] text-black font-bold mb-3">{productData.price}</div>
            <p className="font-mono text-[12px] text-gray-700">{productData.scent}</p>
          </div>

          <div className="bg-white border-t border-gray-200 px-6 md:px-8 flex items-center py-5 cursor-pointer">
            <span className="text-[12px] text-gray-600 w-28">Kích thước:</span>
            <span className="font-mono text-[12px] flex-1">{productData.size}</span>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </div>
          <div className="bg-white border-t border-b border-gray-200 px-6 md:px-8 flex items-center py-5 mb-8 relative">
            <span className="text-[12px] text-gray-600 w-28">Số lượng:</span>
            <select value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} className="font-mono text-[12px] flex-1 appearance-none bg-transparent outline-none cursor-pointer">
              {[1,2,3,4,5,6,7,8,9,10].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
            <ChevronDown className="w-4 h-4 text-gray-400 pointer-events-none absolute right-6 md:right-8" />
          </div>

          <div className="px-6 md:px-8">
            <div className="flex gap-4 mb-5">
              <button onClick={handleAddToCart} className="flex-grow bg-[#5a5a5a] text-white font-bold tracking-widest uppercase py-3 text-[11px] hover:bg-black transition-colors">THÊM VÀO GIỎ HÀNG</button>
              <button onClick={handleAddToWishlist} className="px-4 border border-gray-300 hover:border-black transition-colors" title="Thêm vào yêu thích"><Heart className="w-4 h-4" /></button>
            </div>
            <div className="mb-10">
              <div className="flex items-center gap-2 mb-3"><Package className="w-5 h-5" /><span className="text-[12px] font-bold tracking-widest uppercase">GIAO HÀNG TẬN NHÀ</span></div>
              <p className="text-[12px] text-gray-600 ml-7">• Miễn phí vận chuyển cho đơn hàng 2.500.000đ+ (3–4 ngày làm việc)</p>
            </div>
          </div>

          <div className="border-t border-gray-200 px-6 md:px-8 py-8">
            <div
              className="font-mono text-[12px] leading-relaxed mb-5 text-black prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: sanitizeHTML(productData.description || 'Sản phẩm chăm sóc da chất lượng cao.') }}
            />
          </div>

          <div className="border-t border-gray-200 px-6 md:px-8 py-8 flex justify-between items-center">
            <span className="text-[12px] text-black">Thành phần</span>
            <button className="font-mono text-[11px] underline tracking-widest text-gray-500 hover:text-black">xem danh sách</button>
          </div>

          <div className="border-t border-gray-200 px-6 md:px-8 py-8">
            <p className="text-[12px] text-gray-800">Cần hỗ trợ? <a href={`mailto:${STORE.email}`} className="underline hover:text-black text-gray-500">{STORE.email}</a> / <a href={`tel:${STORE.phone}`} className="underline hover:text-black text-gray-500">{STORE.phone}</a></p>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 py-16 md:px-12 border-t border-gray-200 mt-8">
        <h2 className="text-[13px] text-gray-500 mb-6">Gợi ý dành cho bạn:</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {recommendations.map((product) => (
            <div key={product.id} className="group flex flex-col border border-gray-200 bg-[#fafafa]">
              <Link to={`/product/${product.id}`} className="block relative aspect-square bg-[#8e8e8e] overflow-hidden">
                <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" referrerPolicy="no-referrer" />
              </Link>
              <div className="flex flex-col flex-grow">
                <div className="px-3 py-3 border-b border-gray-200"><Link to={`/product/${product.id}`} className="text-[16px] font-bold tracking-widest uppercase hover:text-gray-600 block">{product.name}</Link></div>
                <div className="px-3 py-3 border-b border-gray-200 font-mono text-[13px] leading-relaxed"><p>{product.size}</p><p className="mt-1">{product.scent}</p></div>
                <div className="px-3 py-3 flex justify-between items-center text-[14px]">
                  <button onClick={() => { addToCart(product); setIsCartOpen(true); }} className="text-[12px] underline decoration-black/20 underline-offset-4 hover:text-gray-600">Thêm vào giỏ</button>
                  <span>{product.price}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
