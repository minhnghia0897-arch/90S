import { sanitizeHTML } from '../utils/sanitize';
import React, { useState } from 'react';
import { ArrowRight, ArrowLeft, Share2, Bookmark, MessageSquare } from 'lucide-react';

const SEO_ARTICLES = [
  {
    id: 1,
    title: "Tối ưu hóa On-page cho Website năm 2026",
    excerpt: "Khám phá những xu hướng mới nhất trong việc tối ưu hóa nội dung và cấu trúc trang web để đạt thứ hạng cao trên Google.",
    date: "15 Tháng 3, 2026",
    category: "On-page SEO",
    image: "https://picsum.photos/seed/seo1/1200/800",
    content: `
      <p>Tối ưu hóa On-page vẫn là nền tảng cốt lõi của bất kỳ chiến dịch SEO thành công nào. Trong năm 2026, Google đã chuyển dịch mạnh mẽ sang việc đánh giá trải nghiệm người dùng thực tế và sự thấu hiểu ý định tìm kiếm sâu sắc.</p>
      
      <h3>1. Ý định tìm kiếm (Search Intent) là ưu tiên số 1</h3>
      <p>Không còn đơn thuần là chèn từ khóa, bạn cần trả lời chính xác câu hỏi mà người dùng đang thắc mắc. Nội dung phải được cấu trúc theo cách dễ quét (scannable) với các thẻ H1, H2, H3 rõ ràng.</p>
      
      <h3>2. Tối ưu hóa cho Tìm kiếm bằng Giọng nói và AI</h3>
      <p>Với sự phổ biến của các trợ lý ảo, cách mọi người tìm kiếm đã thay đổi. Hãy sử dụng ngôn ngữ tự nhiên và cấu trúc câu hỏi - trả lời (FAQ) để tăng khả năng xuất hiện trong các đoạn trích nổi bật (Featured Snippets).</p>
      
      <h3>3. Trải nghiệm trang (Page Experience)</h3>
      <p>Core Web Vitals vẫn cực kỳ quan trọng. Tốc độ tải trang dưới 1 giây và tính ổn định của bố cục là những yếu tố bắt buộc nếu bạn muốn giữ chân người dùng và làm hài lòng các Bot tìm kiếm.</p>
      
      <blockquote>
        "SEO không phải là đánh lừa công cụ tìm kiếm, mà là học cách giao tiếp tốt nhất với người dùng thông qua công cụ tìm kiếm."
      </blockquote>
      
      <p>Hãy bắt đầu tối ưu hóa ngay hôm nay để không bị bỏ lại phía sau trong cuộc đua thứ hạng đầy khốc liệt này.</p>
    `
  },
  {
    id: 2,
    title: "Chiến lược Xây dựng Backlink Chất lượng",
    excerpt: "Làm thế nào để xây dựng hệ thống liên kết bền vững và an toàn, tránh các thuật toán phạt của công cụ tìm kiếm.",
    date: "10 Tháng 3, 2026",
    category: "Off-page SEO",
    image: "https://picsum.photos/seed/seo2/1200/800",
    content: `
      <p>Backlink vẫn là một trong những tín hiệu xếp hạng mạnh mẽ nhất. Tuy nhiên, chất lượng hiện nay quan trọng hơn số lượng gấp nhiều lần.</p>
      
      <h3>1. Nguyên tắc E-E-A-T trong xây dựng liên kết</h3>
      <p>Google ưu tiên các liên kết từ các trang web có độ tin cậy cao, chuyên môn sâu và uy tín trong ngành. Một liên kết từ một tờ báo lớn có giá trị hơn hàng ngàn liên kết từ các trang web rác.</p>
      
      <h3>2. Sức mạnh của Guest Posting tự nhiên</h3>
      <p>Đóng góp nội dung giá trị cho các cộng đồng liên quan là cách bền vững nhất để nhận được backlink. Hãy tập trung vào việc xây dựng mối quan hệ thay vì chỉ mua bán liên kết.</p>
      
      <h3>3. Tránh các kỹ thuật Black Hat</h3>
      <p>Việc sử dụng PBN (Private Blog Network) kém chất lượng hoặc spam bình luận sẽ dẫn đến những án phạt nặng nề từ Google Penguin. Hãy kiên trì với các phương pháp White Hat để bảo vệ tài sản số của bạn.</p>
    `
  },
  {
    id: 3,
    title: "Technical SEO: Những yếu tố kỹ thuật cần lưu ý",
    excerpt: "Tốc độ tải trang, Core Web Vitals và cấu trúc dữ liệu Schema - những yếu tố nền tảng cho sự thành công của SEO.",
    date: "05 Tháng 3, 2026",
    category: "Technical SEO",
    image: "https://picsum.photos/seed/seo3/1200/800",
    content: `
      <p>Nếu nội dung là vua, thì kỹ thuật là vương quốc. Một trang web có nội dung hay nhưng lỗi kỹ thuật sẽ không bao giờ đạt được tiềm năng tối đa.</p>
      
      <h3>1. Cấu trúc dữ liệu Schema Markup</h3>
      <p>Giúp công cụ tìm kiếm hiểu rõ hơn về loại nội dung bạn đang cung cấp (Sản phẩm, Bài viết, Sự kiện, FAQ). Điều này giúp tăng tỷ lệ nhấp (CTR) thông qua các kết quả tìm kiếm phong phú.</p>
      
      <h3>2. Tối ưu hóa Mobile-First Indexing</h3>
      <p>Đảm bảo trang web của bạn hoạt động hoàn hảo trên mọi thiết bị di động. Google hiện nay sử dụng phiên bản di động của trang web để lập chỉ mục và xếp hạng.</p>
      
      <h3>3. Quản lý ngân sách thu thập dữ liệu (Crawl Budget)</h3>
      <p>Sử dụng file robots.txt và sitemap.xml một cách thông minh để hướng dẫn Bot tập trung vào những trang quan trọng nhất của bạn.</p>
    `
  },
  {
    id: 4,
    title: "Nghiên cứu Từ khóa chuyên sâu với AI",
    excerpt: "Sử dụng trí tuệ nhân tạo để tìm kiếm những từ khóa ngách tiềm năng và thấu hiểu ý định tìm kiếm của người dùng.",
    date: "01 Tháng 3, 2026",
    category: "Keyword Research",
    image: "https://picsum.photos/seed/seo4/1200/800",
    content: "<p>Nội dung đang được cập nhật...</p>"
  },
  {
    id: 5,
    title: "SEO Content: Viết cho người dùng hay cho Bot?",
    excerpt: "Sự cân bằng hoàn hảo giữa việc cung cấp giá trị cho người đọc và tối ưu hóa cho các thuật toán tìm kiếm hiện đại.",
    date: "25 Phân 2, 2026",
    category: "Content Marketing",
    image: "https://picsum.photos/seed/seo5/1200/800",
    content: "<p>Nội dung đang được cập nhật...</p>"
  },
  {
    id: 6,
    title: "Tầm quan trọng của Local SEO cho doanh nghiệp",
    excerpt: "Cách tối ưu hóa Google Business Profile và các yếu tố địa phương để thu hút khách hàng tại khu vực kinh doanh.",
    date: "20 Tháng 2, 2026",
    category: "Local SEO",
    image: "https://picsum.photos/seed/seo6/1200/800",
    content: "<p>Nội dung đang được cập nhật...</p>"
  }
];

export default function News() {
  const [selectedArticle, setSelectedArticle] = useState<typeof SEO_ARTICLES[0] | null>(null);

  if (selectedArticle) {
    return (
      <div className="max-w-[1000px] mx-auto px-6 py-20">
        <button 
          onClick={() => setSelectedArticle(null)}
          className="flex items-center text-[10px] font-bold uppercase tracking-widest mb-12 hover:text-gray-500 transition-colors"
        >
          <ArrowLeft className="mr-2 w-3 h-3" /> Quay lại danh sách
        </button>

        <article className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          <header className="mb-12">
            <div className="flex items-center space-x-4 mb-6">
              <span className="bg-black text-white text-[9px] uppercase tracking-widest px-3 py-1">
                {selectedArticle.category}
              </span>
              <span className="text-[10px] text-gray-400 uppercase tracking-widest">
                {selectedArticle.date}
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold uppercase tracking-wider leading-tight mb-8">
              {selectedArticle.title}
            </h1>
            <div className="flex items-center justify-between py-6 border-y border-gray-100">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded-full bg-gray-200" />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest">Đội ngũ Biên tập</p>
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest">Chuyên gia SEO</p>
                </div>
              </div>
              <div className="flex items-center space-x-6">
                <button className="hover:text-gray-500 transition-colors"><Share2 className="w-4 h-4 stroke-1" /></button>
                <button className="hover:text-gray-500 transition-colors"><Bookmark className="w-4 h-4 stroke-1" /></button>
                <button className="hover:text-gray-500 transition-colors"><MessageSquare className="w-4 h-4 stroke-1" /></button>
              </div>
            </div>
          </header>

          <div className="aspect-[16/9] mb-12 bg-gray-100 overflow-hidden">
            <img 
              src={selectedArticle.image} 
              alt={selectedArticle.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="prose prose-sm max-w-none">
            <div 
              className="text-gray-600 leading-relaxed space-y-6 text-base"
              dangerouslySetInnerHTML={{ __html: sanitizeHTML(selectedArticle.content || "") }}
            />
          </div>

          <footer className="mt-20 pt-12 border-t border-gray-100">
            <div className="flex flex-wrap gap-2 mb-20">
              {["SEO", "Marketing", "Google", "Optimization"].map(tag => (
                <span key={tag} className="text-[9px] uppercase tracking-widest border border-gray-200 px-3 py-1 hover:bg-black hover:text-white transition-colors cursor-pointer">
                  #{tag}
                </span>
              ))}
            </div>

            <div className="space-y-12">
              <h3 className="text-xl font-bold uppercase tracking-[0.2em] text-center mb-12">Bài viết liên quan</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {SEO_ARTICLES
                  .filter(a => a.id !== selectedArticle.id)
                  .slice(0, 3)
                  .map(article => (
                    <div 
                      key={article.id} 
                      className="group cursor-pointer"
                      onClick={() => {
                        setSelectedArticle(article);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                    >
                      <div className="aspect-[4/3] mb-4 overflow-hidden bg-gray-100">
                        <img 
                          src={article.image} 
                          alt={article.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                        />
                      </div>
                      <span className="text-[9px] text-gray-400 uppercase tracking-widest">{article.date}</span>
                      <h4 className="text-xs font-bold uppercase tracking-wider mt-2 leading-tight group-hover:text-gray-600 transition-colors">
                        {article.title}
                      </h4>
                    </div>
                  ))}
              </div>
            </div>
          </footer>
        </article>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-20">
      <div className="mb-16 text-center">
        <h1 className="text-4xl font-bold mb-4 uppercase tracking-[0.2em]">Kiến Thức SEO</h1>
        <p className="text-gray-500 text-sm tracking-widest uppercase">Cập nhật những xu hướng và kỹ thuật tối ưu hóa website mới nhất</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
        {SEO_ARTICLES.map((article) => (
          <article 
            key={article.id} 
            className="group cursor-pointer"
            onClick={() => setSelectedArticle(article)}
          >
            <div className="relative overflow-hidden aspect-[4/3] mb-6 bg-gray-100">
              <img 
                src={article.image} 
                alt={article.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
              />
              <div className="absolute top-4 left-4">
                <span className="bg-black text-white text-[9px] uppercase tracking-widest px-3 py-1">
                  {article.category}
                </span>
              </div>
            </div>
            
            <div className="space-y-3">
              <span className="text-[10px] text-gray-400 uppercase tracking-widest">{article.date}</span>
              <h2 className="text-lg font-bold uppercase tracking-wider leading-tight group-hover:text-gray-600 transition-colors">
                {article.title}
              </h2>
              <p className="text-sm text-gray-500 leading-relaxed line-clamp-3">
                {article.excerpt}
              </p>
              <div className="pt-4 flex items-center text-[10px] font-bold uppercase tracking-widest group-hover:translate-x-2 transition-transform">
                Xem thêm <ArrowRight className="ml-2 w-3 h-3" />
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Pagination Placeholder */}
      <div className="mt-20 flex justify-center border-t border-gray-100 pt-12">
        <div className="flex space-x-4 text-[11px] font-bold uppercase tracking-widest">
          <span className="text-black border-b border-black pb-1 cursor-default">01</span>
          <span className="text-gray-400 hover:text-black cursor-pointer transition-colors">02</span>
          <span className="text-gray-400 hover:text-black cursor-pointer transition-colors">03</span>
          <span className="text-gray-400 hover:text-black cursor-pointer transition-colors">...</span>
          <span className="text-gray-400 hover:text-black cursor-pointer transition-colors">Tiếp theo</span>
        </div>
      </div>
    </div>
  );
}
