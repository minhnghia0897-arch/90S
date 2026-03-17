import React from 'react';
import { STORE } from '../utils/auth';

export default function About() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-20">
      <h1 className="text-3xl font-bold mb-8 uppercase tracking-widest">Về {STORE.name}</h1>
      <div className="prose prose-sm max-w-none text-gray-600 leading-relaxed space-y-6">
        <p>
          {STORE.name} ra đời từ tình yêu với làn da Việt và khát vọng mang đến những sản phẩm chăm sóc da thuần Việt, được nghiên cứu và sản xuất theo tiêu chuẩn quốc tế.
        </p>
        <p>
          Chúng tôi tin rằng làn da khỏe mạnh bắt đầu từ việc hiểu rõ nhu cầu của từng loại da — đặc biệt là làn da nhiệt đới của người Việt, vốn phải đối mặt với thời tiết nắng nóng, ẩm cao và ô nhiễm không khí.
        </p>
        <p>
          Mỗi sản phẩm của {STORE.name} được phát triển qua quy trình nghiên cứu kỹ lưỡng, kết hợp giữa thành phần thiên nhiên bản địa và công nghệ dưỡng da hiện đại, để mang lại hiệu quả tối ưu mà vẫn dịu nhẹ với mọi loại da.
        </p>
        <p>
          Chúng tôi cam kết: <strong>không paraben, không sulfate, không hương liệu nhân tạo</strong> — chỉ có những gì tốt nhất cho làn da của bạn.
        </p>
      </div>
    </div>
  );
}
