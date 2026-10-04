import React, { useState } from 'react';
import { 
  MessageSquare, 
  Send, 
  User, 
  CheckCheck, 
  ExternalLink, 
  Search,
  Sparkles,
  ShoppingBag,
  Clock
} from 'lucide-react';
import { BuyerChat } from '../../types';

interface LiveChatTabProps {
  chats: BuyerChat[];
  onSendMessage: (chatId: string, text: string) => void;
  onMarkChatAsRead: (chatId: string) => void;
}

export const LiveChatTab: React.FC<LiveChatTabProps> = ({
  chats,
  onSendMessage,
  onMarkChatAsRead,
}) => {
  const [selectedChatId, setSelectedChatId] = useState<string>(chats[0]?.id || 'chat-1');
  const [inputMessage, setInputMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const selectedChat = chats.find(c => c.id === selectedChatId) || chats[0];

  const quickReplies = [
    'Halo kak! Pesanan sedang kami proses secepatnya ya, mohon ditunggu sebentar yaa.',
    'Pesanan sudah berhasil kami kirimkan ya kak! Mohon dicek akunnya & klik Selesai di Itemku ⭐',
    'Mohon maaf kak, bisa tolong dikirimkan ulang User ID & Zone ID yang benar?',
    'Halo kak, voucher sudah kami kirimkan via Tokoku. Terima kasih banyak sudah order!',
  ];

  const handleSend = () => {
    if (!inputMessage.trim() || !selectedChat) return;
    onSendMessage(selectedChat.id, inputMessage.trim());
    setInputMessage('');
  };

  const handleSelectChat = (chat: BuyerChat) => {
    setSelectedChatId(chat.id);
    if (chat.unread) {
      onMarkChatAsRead(chat.id);
    }
  };

  const filteredChats = chats.filter(c => 
    c.buyer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.last_message.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      
      {/* Header */}
      <div className="p-4 rounded-2xl bg-[#0d1424] border border-slate-800 flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-teal-400" />
            Live Chat Pembeli Tokoku Itemku
          </h2>
          <p className="text-xs text-slate-400">
            Balas pesan pembeli secara instan tanpa delay untuk menjaga rating toko dan kecepatan pengiriman.
          </p>
        </div>
      </div>

      {/* Main Chat Splitter */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 h-[600px]">
        
        {/* Left: Chat List (4 cols) */}
        <div className="md:col-span-4 rounded-2xl bg-[#0d1424] border border-slate-800 flex flex-col overflow-hidden">
          
          {/* Search bar */}
          <div className="p-3 border-b border-slate-800">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari chat pembeli..."
                className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>

          {/* List items */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60">
            {filteredChats.map((c) => {
              const isSelected = c.id === selectedChatId;
              return (
                <button
                  key={c.id}
                  onClick={() => handleSelectChat(c)}
                  className={`w-full p-3.5 text-left transition flex items-start gap-3 ${
                    isSelected ? 'bg-slate-900 border-l-2 border-teal-400' : 'hover:bg-slate-900/40'
                  }`}
                >
                  <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 text-slate-300 font-bold text-xs">
                    {c.buyer_name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-white truncate">{c.buyer_name}</h4>
                      <span className="text-[10px] text-slate-500 font-mono">{c.timestamp}</span>
                    </div>
                    <p className="text-[11px] text-teal-300 truncate mt-0.5">{c.product_name}</p>
                    <p className="text-xs text-slate-400 truncate mt-1">{c.last_message}</p>
                  </div>
                  {c.unread && (
                    <span className="w-2 h-2 rounded-full bg-red-500 shrink-0 mt-1"></span>
                  )}
                </button>
              );
            })}
          </div>

        </div>

        {/* Right: Active Chat Conversation (8 cols) */}
        <div className="md:col-span-8 rounded-2xl bg-[#0d1424] border border-slate-800 flex flex-col overflow-hidden">
          
          {selectedChat ? (
            <>
              {/* Chat Header */}
              <div className="p-3.5 border-b border-slate-800 bg-[#090e1a] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-teal-500/20 text-teal-300 flex items-center justify-center font-bold text-xs">
                    {selectedChat.buyer_name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                      {selectedChat.buyer_name}
                      {selectedChat.order_number && (
                        <span className="text-[10px] font-mono text-slate-400 px-1.5 py-0.2 rounded bg-slate-800">
                          {selectedChat.order_number}
                        </span>
                      )}
                    </h3>
                    <p className="text-[11px] text-slate-400">{selectedChat.product_name}</p>
                  </div>
                </div>

                <a
                  href="https://tokoku.itemku.com"
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-teal-400 hover:text-teal-300 flex items-center gap-1 font-medium"
                >
                  <span>Buka di Tokoku</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {/* Messages Body */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#080d17]">
                {selectedChat.messages.map((m, idx) => {
                  const isSeller = m.sender === 'seller';
                  return (
                    <div 
                      key={idx} 
                      className={`flex flex-col ${isSeller ? 'items-end' : 'items-start'}`}
                    >
                      <div className={`max-w-[78%] p-3 rounded-2xl text-xs leading-relaxed ${
                        isSeller 
                          ? 'bg-teal-600 text-white rounded-tr-none' 
                          : 'bg-[#151f33] text-slate-200 border border-slate-800 rounded-tl-none'
                      }`}>
                        {m.text}
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono mt-1 px-1 flex items-center gap-1">
                        {m.time} {isSeller && <CheckCheck className="w-3 h-3 text-teal-400" />}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Quick Reply Pills */}
              <div className="px-3 py-2 border-t border-slate-800/80 bg-[#090e1a] overflow-x-auto flex gap-1.5 scrollbar-none">
                <span className="text-[10px] text-slate-500 flex items-center gap-1 shrink-0 font-medium">
                  <Sparkles className="w-3 h-3 text-teal-400" /> Balas Cepat:
                </span>
                {quickReplies.map((qr, i) => (
                  <button
                    key={i}
                    onClick={() => setInputMessage(qr)}
                    className="text-[11px] px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 whitespace-nowrap transition"
                  >
                    {qr.slice(0, 32)}...
                  </button>
                ))}
              </div>

              {/* Input Area */}
              <div className="p-3 border-t border-slate-800 bg-[#090e1a] flex items-center gap-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ketik balasan chat pembeli..."
                  className="flex-1 px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                />
                <button
                  onClick={handleSend}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Kirim</span>
                </button>
              </div>
            </>
          ) : (
            <div className="p-12 text-center text-slate-500 text-xs my-auto">
              Pilih salah satu chat pembeli di sebelah kiri.
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
