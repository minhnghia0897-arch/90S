import React from 'react';

export default function Policies() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-20">
      <h1 className="text-3xl font-bold mb-8 uppercase tracking-widest">Chính sách</h1>
      <div className="space-y-8 text-sm text-gray-600 leading-relaxed">
        <section>
          <h2 className="text-lg font-bold text-black mb-4 uppercase tracking-wider">Vận chuyển & Giao hàng</h2>
          <p>Chúng tôi cung cấp các lựa chọn vận chuyển tiêu chuẩn và hỏa tốc. Đơn hàng trên 2.500.000đ đủ điều kiện được miễn phí vận chuyển tiêu chuẩn.</p>
        </section>
        <section>
          <h2 className="text-lg font-bold text-black mb-4 uppercase tracking-wider">Đổi trả & Hoàn tiền</h2>
          <p>Do tính chất cá nhân hóa của các sản phẩm, chúng tôi thường không chấp nhận đổi trả. Tuy nhiên, nếu đơn hàng của bạn bị hư hỏng hoặc không chính xác, vui lòng liên hệ với chúng tôi trong vòng 14 ngày.</p>
        </section>
        <section>
          <h2 className="text-lg font-bold text-black mb-4 uppercase tracking-wider">Chính sách Bảo mật</h2>
          <p>Quyền riêng tư của bạn rất quan trọng đối với chúng tôi. Chúng tôi chỉ sử dụng dữ liệu của bạn để cải thiện trải nghiệm và thực hiện đơn hàng của bạn.</p>
        </section>
      </div>
    </div>
  );
}
