import React, { useState, useEffect } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { Plus, Search, Edit2, Trash2, Eye, FileText, Calendar, Tag, X } from 'lucide-react';
import { sanitizeHTML } from '../../utils/sanitize';

const INITIAL_ARTICLES = [
  { id: 1, title: 'Hướng dẫn chăm sóc da ban ngày chuẩn khoa học', category: 'Chăm sóc da', date: '15/03/2026', author: 'Admin', status: 'Đã xuất bản', content: '<h2>Quy trình chăm sóc da ban ngày</h2><p>Bắt đầu ngày mới với quy trình chăm sóc da đúng cách sẽ giúp da bạn luôn khỏe mạnh và rạng rỡ.</p>' },
  { id: 2, title: '5 thành phần dưỡng da không thể thiếu', category: 'Thành phần', date: '10/03/2026', author: 'Admin', status: 'Đã xuất bản', content: '<h2>Thành phần vàng cho da</h2><p>Niacinamide, Hyaluronic Acid, Vitamin C, Retinol và SPF là 5 thành phần mọi tín đồ skincare cần biết.</p>' },
  { id: 3, title: 'Cách chọn kem chống nắng phù hợp', category: 'Sun Protection', date: '05/03/2026', author: 'Admin', status: 'Bản nháp', content: '<p>Hướng dẫn chọn kem chống nắng phù hợp với loại da và sinh hoạt hàng ngày.</p>' },
];

const modules = { toolbar: [[{ header:[1,2,3,false] }],['bold','italic','underline','strike'],[{ list:'ordered'},{ list:'bullet'}],[{ align:[] }],['link'],['clean']] };

export default function AdminSEO() {
  const [articles, setArticles] = useState(INITIAL_ARTICLES);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [currentArticle, setCurrentArticle] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [editorContent, setEditorContent] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    if (currentArticle) setEditorContent(currentArticle.content || '');
    else setEditorContent('');
  }, [currentArticle, isModalOpen]);

  useEffect(() => { setCurrentPage(1); }, [searchTerm]);

  const filteredArticles = articles.filter(a => a.title.toLowerCase().includes(searchTerm.toLowerCase()) || a.category.toLowerCase().includes(searchTerm.toLowerCase()));
  const totalPages = Math.ceil(filteredArticles.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage-1)*ITEMS_PER_PAGE;
  const currentArticles = filteredArticles.slice(startIndex, startIndex+ITEMS_PER_PAGE);

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const articleData = { title: fd.get('title') as string, category: fd.get('category') as string, status: fd.get('status') as string, content: editorContent, date: currentArticle?.date || new Date().toLocaleDateString('vi-VN'), author: 'Admin' };
    if (currentArticle?.id) { setArticles(articles.map(a => a.id===currentArticle.id?{...a,...articleData}:a)); }
    else { setArticles([{id:Date.now(),...articleData},...articles]); }
    setIsModalOpen(false); setCurrentArticle(null); setEditorContent('');
  };

  return (
    <div className="space-y-6">
      <style>{`.quill{background:#f9fafb;border-radius:.75rem;overflow:hidden;border:1px solid #f3f4f6!important}.ql-toolbar{border:none!important;border-bottom:1px solid #f3f4f6!important;background:#fff}.ql-container{border:none!important;min-height:300px;font-family:inherit}.ql-editor{font-size:.875rem;line-height:1.6}`}</style>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div><h1 className="text-2xl font-bold tracking-tight uppercase">Quản lý bài viết</h1><p className="text-xs text-gray-500 uppercase tracking-widest mt-1">Quản lý nội dung blog và bài viết</p></div>
        <button onClick={() => { setCurrentArticle(null); setIsModalOpen(true); }} className="bg-black text-white px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center hover:bg-gray-800"><Plus size={15} className="mr-2" /> Viết bài mới</button>
      </div>
      <div className="relative"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} /><input type="text" placeholder="Tìm kiếm bài viết..." className="w-full bg-white border border-gray-100 rounded-2xl py-4 pl-12 pr-4 text-sm outline-none focus:ring-1 focus:ring-black shadow-sm" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>

      <div className="grid grid-cols-1 gap-4">
        {currentArticles.map(article => (
          <div key={article.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-gray-50 rounded-xl text-gray-400"><FileText size={22} /></div>
              <div className="space-y-1">
                <h3 className="text-base font-bold uppercase">{article.title}</h3>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center text-[10px] text-gray-400 uppercase tracking-widest"><Tag size={11} className="mr-1" />{article.category}</div>
                  <div className="flex items-center text-[10px] text-gray-400 uppercase tracking-widest"><Calendar size={11} className="mr-1" />{article.date}</div>
                  <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${article.status==='Đã xuất bản'?'bg-emerald-50 text-emerald-600':'bg-amber-50 text-amber-600'}`}>{article.status}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {[['Xem',Eye,() => { setCurrentArticle(article); setIsPreviewOpen(true); }],['Sửa',Edit2,() => { setCurrentArticle(article); setIsModalOpen(true); }],['Xóa',Trash2,() => window.confirm('Xóa bài viết này?') && setArticles(articles.filter(a=>a.id!==article.id))]].map(([label, Icon, fn]: any) => (
                <button key={label} onClick={fn} className={`p-2.5 hover:bg-${label==='Xóa'?'red':'gray'}-50 rounded-xl transition-colors text-gray-400 hover:text-${label==='Xóa'?'red-500':'black'} flex items-center text-[10px] font-bold uppercase tracking-widest`}><Icon size={15} className="mr-1.5" />{label}</button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
          <div className="text-[10px] text-gray-400 uppercase tracking-widest">Hiển thị {startIndex+1}–{Math.min(startIndex+ITEMS_PER_PAGE,filteredArticles.length)} / {filteredArticles.length}</div>
          <div className="flex items-center space-x-2">
            <button onClick={() => setCurrentPage(p=>Math.max(p-1,1))} disabled={currentPage===1} className="px-4 py-2 rounded-xl text-[10px] font-bold uppercase border border-gray-100 disabled:opacity-30 hover:bg-gray-50">Trước</button>
            {[...Array(totalPages)].map((_,i) => <button key={i} onClick={() => setCurrentPage(i+1)} className={`w-8 h-8 rounded-xl text-[10px] font-bold flex items-center justify-center ${currentPage===i+1?'bg-black text-white':'hover:bg-gray-50 text-gray-400'}`}>{i+1}</button>)}
            <button onClick={() => setCurrentPage(p=>Math.min(p+1,totalPages))} disabled={currentPage===totalPages} className="px-4 py-2 rounded-xl text-[10px] font-bold uppercase border border-gray-100 disabled:opacity-30 hover:bg-gray-50">Sau</button>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[95vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-black text-white">
              <h2 className="text-sm font-bold uppercase tracking-widest">{currentArticle?'Chỉnh sửa bài viết':'Viết bài mới'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/10 rounded-lg"><X size={20} /></button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4 overflow-y-auto">
              <div className="space-y-2"><label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Tiêu đề bài viết</label><input name="title" defaultValue={currentArticle?.title} required className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 text-sm focus:ring-1 focus:ring-black outline-none" placeholder="Nhập tiêu đề..." /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Danh mục</label>
                  <select name="category" defaultValue={currentArticle?.category||'Chăm sóc da'} className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 text-sm focus:ring-1 focus:ring-black outline-none appearance-none">
                    {['Chăm sóc da','Thành phần','Sun Protection','Tin tức','Hướng dẫn'].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="space-y-2"><label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Trạng thái</label>
                  <select name="status" defaultValue={currentArticle?.status||'Bản nháp'} className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 text-sm focus:ring-1 focus:ring-black outline-none appearance-none">
                    {['Bản nháp','Đã xuất bản'].map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div className="space-y-2"><label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Nội dung bài viết</label>
                <div key={currentArticle?.id||'new'}><ReactQuill theme="snow" value={editorContent} onChange={setEditorContent} modules={modules} placeholder="Bắt đầu viết..." /></div>
              </div>
              <div className="pt-4 flex items-center justify-end space-x-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 rounded-xl text-xs font-bold uppercase hover:bg-gray-100">Hủy</button>
                <button type="submit" className="bg-black text-white px-8 py-3 rounded-xl text-xs font-bold uppercase hover:bg-gray-800">Lưu bài viết</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isPreviewOpen && currentArticle && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-widest truncate max-w-md">{currentArticle.title}</h2>
              <button onClick={() => setIsPreviewOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X size={20} /></button>
            </div>
            <div className="p-8 overflow-y-auto space-y-6">
              <div className="border-b border-gray-100 pb-6">
                <h1 className="text-4xl font-bold leading-tight mb-3">{currentArticle.title}</h1>
                <div className="flex items-center gap-4 text-[10px] text-gray-400 uppercase tracking-widest">
                  <span className="flex items-center gap-1"><Calendar size={11} />{currentArticle.date}</span>
                  <span className="font-bold text-black flex items-center gap-1"><Tag size={11} />{currentArticle.category}</span>
                </div>
              </div>
              {/* Preview uses sanitized HTML - safe to render */}
              <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: sanitizeHTML(currentArticle.content||'') }} />
            </div>
            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end">
              <button onClick={() => setIsPreviewOpen(false)} className="bg-black text-white px-8 py-3 rounded-xl text-xs font-bold uppercase hover:bg-gray-800">Đóng</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
