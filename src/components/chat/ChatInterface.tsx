'use client';

import { useState, useEffect, useRef } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Send, X, Loader2 } from 'lucide-react';

interface ChatInterfaceProps {
  enquiryId: string;
  currentUserId: string;
  currentUserType: 'USER' | 'VENDOR';
  otherPartyName: string;
  onClose: () => void;
}

export default function ChatInterface({ enquiryId, currentUserId, currentUserType, otherPartyName, onClose }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!enquiryId) return;
    
    const messagesRef = collection(db, 'chats', enquiryId, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMessages(msgs);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [enquiryId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const msgText = newMessage.trim();
    setNewMessage('');

    try {
      const messagesRef = collection(db, 'chats', enquiryId, 'messages');
      await addDoc(messagesRef, {
        senderId: currentUserId,
        senderType: currentUserType,
        text: msgText,
        timestamp: serverTimestamp()
      });
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-md h-[600px] max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden relative">
        
        {/* Header */}
        <div className="bg-emerald-600 p-4 flex items-center justify-between text-white shrink-0 shadow-sm z-10">
          <div>
            <h3 className="font-bold">Chat with {otherPartyName}</h3>
            <p className="text-xs text-emerald-100 font-medium tracking-wide">Enquiry #{enquiryId.slice(-6).toUpperCase()}</p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-emerald-700 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-50 relative">
          {isLoading ? (
             <div className="flex justify-center items-center h-full">
               <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
             </div>
          ) : messages.length === 0 ? (
            <div className="h-full flex items-center justify-center text-zinc-400 text-sm font-medium">
              No messages yet. Start the conversation!
            </div>
          ) : (
            messages.map((msg, index) => {
              const isMe = msg.senderId === currentUserId;
              return (
                <div key={msg.id || index} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${isMe ? 'bg-emerald-600 text-white rounded-tr-sm shadow-sm' : 'bg-white border border-zinc-200 text-zinc-800 rounded-tl-sm shadow-sm'}`}>
                    <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                    <span className={`text-[10px] block mt-1 font-medium tracking-wide ${isMe ? 'text-emerald-200 text-right' : 'text-zinc-400'}`}>
                      {msg.timestamp ? new Date(msg.timestamp.toDate()).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Sending...'}
                    </span>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-zinc-200 shrink-0 flex gap-3 shadow-[0_-4px_10px_rgba(0,0,0,0.02)]">
          <input 
            type="text" 
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 bg-zinc-100 border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all font-medium"
          />
          <button 
            type="submit" 
            disabled={!newMessage.trim()}
            className="bg-emerald-600 hover:bg-emerald-700 text-white p-3 rounded-xl transition-all disabled:opacity-50 disabled:hover:bg-emerald-600 shadow-sm"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
