"use client";

// ... (semua import dan state bawaan Anda tetap sama)
import React, { useState, useEffect, useRef } from 'react';
import { BookOpen, Search, X, Bot, Send, Sparkles, ChevronLeft, ThumbsUp, ThumbsDown, MessageSquare } from 'lucide-react';
import { getKnowledgeList, askKnowledgeBot } from '@/server/admin/knowledge-actions';

interface Article {
  id: number;
  term: string;
  description: string;
}

export default function FloatingKnowledgeButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<'list' | 'article' | 'chat'>('list');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [search, setSearch] = useState("");
  const [dataList, setDataList] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [articleRating, setArticleRating] = useState<'up' | 'down' | null>(null);
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'bot', text: string }>>([
    { sender: 'bot', text: 'Halo! Saya TANYA (Asisten AI Pabrik). Ada yang bisa saya bantu terkait standar mutu atau operasional?' }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isBotLoading, setIsBotLoading] = useState(false);

  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<{ startX: number; startY: number; posX: number; posY: number; hasMoved: boolean }>({
    startX: 0, startY: 0, posX: 0, posY: 0, hasMoved: false
  });
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setPosition({ x: window.innerWidth - 80, y: window.innerHeight - 130 });
    }
  }, []);

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    dragRef.current = { startX: e.clientX, startY: e.clientY, posX: position.x, posY: position.y, hasMoved: false };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    if (Math.abs(dx) > 5 || Math.abs(dy) > 5) dragRef.current.hasMoved = true;
    const newX = dragRef.current.posX + dx;
    const newY = dragRef.current.posY + dy;
    const maxX = window.innerWidth - 70;
    const maxY = window.innerHeight - 70;
    setPosition({ x: Math.max(10, Math.min(newX, maxX)), y: Math.max(10, Math.min(newY, maxY)) });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    try { (e.target as HTMLElement).releasePointerCapture(e.pointerId); } catch (err) {}
  };

  const handleClick = () => { if (!dragRef.current.hasMoved) setIsOpen(true); };

  useEffect(() => {
    if (isOpen && dataList.length === 0) {
      setIsLoading(true);
      getKnowledgeList().then(res => { setDataList(res); setIsLoading(false); });
    }
  }, [isOpen]);

  const filteredData = dataList.filter(item => item.term.toLowerCase().includes(search.toLowerCase()) || item.description.toLowerCase().includes(search.toLowerCase()));
  const openArticle = (item: Article) => { setSelectedArticle(item); setArticleRating(null); setView('article'); };
  const openChat = () => { setView('chat'); };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isBotLoading) return;
    const userText = inputMessage;
    setMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setInputMessage("");
    setIsBotLoading(true);
    const result = await askKnowledgeBot(userText);
    setMessages(prev => [...prev, { sender: 'bot', text: result.answer }]);
    setIsBotLoading(false);
  };

  return (
    <>
      <button ref={buttonRef} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} onClick={handleClick}
        style={{ transform: `translate3d(${position.x}px, ${position.y}px, 0)`, touchAction: 'none' }}
        className="fixed top-0 left-0 z-50 bg-slate-900 hover:bg-black dark:bg-blue-600 dark:hover:bg-blue-500 text-white p-4 rounded-full shadow-2xl transition-colors flex items-center justify-center cursor-grab active:cursor-grabbing border border-slate-700 dark:border-blue-400/30"
      >
        <MessageSquare size={24} />
        <span className="absolute -top-2 -right-2 bg-rose-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full animate-bounce">AI</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm md:p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 w-full md:max-w-md rounded-t-3xl md:rounded-3xl shadow-2xl flex flex-col h-[85vh] md:h-[600px] overflow-hidden">
            
            <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900">
              <div className="flex items-center gap-3">
                {view !== 'list' && (
                  <button onClick={() => setView('list')} className="p-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700">
                    <ChevronLeft size={18} />
                  </button>
                )}
                <h2 className="font-black text-slate-900 dark:text-white uppercase tracking-tight text-sm flex items-center gap-2">
                  {view === 'chat' ? <><Bot size={16} className="text-blue-600 dark:text-blue-400"/> Chat TANYA</> : <><Sparkles size={16} className="text-blue-600 dark:text-blue-400"/> Pusat Bantuan</>}
                </h2>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-rose-500 dark:text-slate-400 p-2 bg-slate-200 dark:bg-slate-800 rounded-xl">
                <X size={18} />
              </button>
            </div>

            {view === 'list' && (
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="p-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="relative">
                    <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="text" placeholder="Cari masalah, panduan, istilah..." className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-bold" value={search} onChange={(e) => setSearch(e.target.value)} />
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-slate-50 dark:bg-slate-950">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Topik Terpopuler</p>
                  {isLoading ? (
                    <div className="text-center py-10 text-xs font-bold text-slate-400 animate-pulse">Memuat panduan...</div>
                  ) : filteredData.length > 0 ? (
                    filteredData.map((item) => (
                      <button key={item.id} onClick={() => openArticle(item)} className="w-full text-left bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl hover:border-slate-300 dark:hover:border-slate-600 transition-all group">
                        <h3 className="text-blue-600 dark:text-blue-400 font-black text-xs tracking-tight mb-1 group-hover:underline">{item.term}</h3>
                        <p className="text-slate-600 dark:text-slate-400 text-[11px] line-clamp-2 leading-relaxed">{item.description}</p>
                      </button>
                    ))
                  ) : (
                    <div className="text-center py-10 text-xs font-bold text-slate-400 uppercase tracking-widest">Tidak ada hasil ditemukan.</div>
                  )}
                </div>
                <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
                  <button onClick={openChat} className="w-full bg-slate-900 dark:bg-blue-600 hover:bg-black dark:hover:bg-blue-700 text-white p-3 rounded-xl flex items-center justify-between transition-all">
                    <div className="flex items-center gap-3">
                      <div className="bg-white/20 p-1.5 rounded-full"><Bot size={18} /></div>
                      <div className="text-left">
                        <p className="text-[10px] font-black uppercase tracking-wider text-slate-300 dark:text-blue-100">Punya kendala lain?</p>
                        <p className="text-xs font-black">Mulai Chat dengan TANYA</p>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {view === 'article' && selectedArticle && (
              <div className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-slate-950">
                <div className="flex-1 overflow-y-auto">
                  <div className="p-5 md:p-6 space-y-4">
                    <h1 className="text-lg font-black text-slate-900 dark:text-white leading-tight">{selectedArticle.term}</h1>
                    <div className="text-sm text-slate-700 dark:text-slate-300 leading-loose whitespace-pre-wrap font-medium">{selectedArticle.description}</div>
                  </div>
                  <div className="mx-5 md:mx-6 mb-6 mt-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl flex items-center justify-between">
                    <div>
                      <p className="text-xs font-black text-slate-900 dark:text-slate-200">Nilai artikel ini, yuk!</p>
                      <p className="text-[10px] text-slate-500">Bantu kami tingkatkan panduan pabrik.</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => setArticleRating('up')} className={`p-2.5 rounded-xl border transition-all ${articleRating === 'up' ? 'bg-slate-900 border-slate-900 text-white dark:bg-slate-700 dark:border-slate-600' : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-500'}`}><ThumbsUp size={16} /></button>
                      <button onClick={() => setArticleRating('down')} className={`p-2.5 rounded-xl border transition-all ${articleRating === 'down' ? 'bg-rose-600 border-rose-600 text-white' : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-500'}`}><ThumbsDown size={16} /></button>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-slate-900 dark:bg-slate-800 flex items-center justify-between border-t dark:border-slate-700">
                   <div className="flex items-center gap-3">
                     <div className="bg-white/20 p-2 rounded-full text-white"><Bot size={20} /></div>
                     <div>
                       <p className="text-xs font-black text-white leading-tight">Masih bingung?</p>
                       <p className="text-[10px] text-slate-300 font-medium">Mulai chat dengan TANYA</p>
                     </div>
                   </div>
                   <button onClick={openChat} className="bg-white text-slate-900 px-4 py-2 rounded-xl text-xs font-black hover:bg-slate-200 transition-all shadow-md">
                     Mulai Chat
                   </button>
                </div>
              </div>
            )}

            {view === 'chat' && (
              <div className="flex-1 flex flex-col overflow-hidden bg-slate-50 dark:bg-slate-950">
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((msg, index) => (
                    <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] p-3.5 rounded-2xl text-[13px] font-black leading-relaxed ${msg.sender === 'user' ? 'bg-slate-900 dark:bg-blue-600 text-white rounded-br-none shadow-md' : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-bl-none shadow-sm'}`}>
                        {msg.text}
                      </div>
                    </div>
                  ))}
                  {isBotLoading && (
                    <div className="flex justify-start">
                      <div className="bg-white dark:bg-slate-900 text-slate-500 p-3 rounded-2xl text-xs animate-pulse border border-slate-200 dark:border-slate-800">TANYA sedang mengetik...</div>
                    </div>
                  )}
                </div>
                <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex gap-2">
                  <input type="text" placeholder="Ketik pertanyaanmu di sini..." className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-slate-400 dark:focus:border-slate-500" value={inputMessage} onChange={(e) => setInputMessage(e.target.value)} />
                  <button type="submit" disabled={isBotLoading} className="bg-slate-900 dark:bg-blue-600 hover:bg-black dark:hover:bg-blue-700 text-white p-3 rounded-xl transition-all shadow-md"><Send size={18} /></button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}