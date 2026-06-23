import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, ArrowLeft, Users, MessageSquare, AlertCircle, Loader2 } from 'lucide-react';
import { useRoomStore, useAuthStore } from '../../store/useStore';
import socket from '../../services/socket';
import dayjs from 'dayjs';

const RoomChat = () => {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const { currentRoom, fetchRoomDetails, messages, fetchRoomMessages, syncMessage, loading } = useRoomStore();
    const { user: profile } = useAuthStore();
    const [msg, setMsg] = useState('');
    const scrollRef = useRef(null);

    useEffect(() => {
        fetchRoomDetails(roomId);
        fetchRoomMessages(roomId);

        socket.joinRoom(roomId);

        socket.onMessageReceived((message) => {
            if (message.room_id === roomId) {
                syncMessage(message);
            }
        });

        return () => {
            // socket.leaveRoom(roomId);
        };
    }, [roomId, fetchRoomDetails, fetchRoomMessages, syncMessage]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = (e) => {
        e.preventDefault();
        if (!msg.trim()) return;

        socket.sendMessage(roomId, msg.trim());
        setMsg('');
    };

    const room = currentRoom?.room;
    const members = currentRoom?.members || [];

    if (loading && !room) return <div className="p-20 flex justify-center"><Loader2 className="w-10 h-10 animate-spin text-primary-500" /></div>;
    if (!room) return null;

    return (
        <div className="flex flex-col h-[calc(100vh-8rem)] md:h-[calc(100vh-4rem)]">
            {/* Chat Header */}
            <header className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 rounded-t-2xl shadow-sm">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate(`/rooms/${roomId}`)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl">
                        <ArrowLeft size={18} />
                    </button>
                    <div>
                        <h2 className="text-sm font-display font-bold text-slate-900 dark:text-white uppercase tracking-wider">{room.name} Chat</h2>
                        <div className="flex items-center gap-1.5 text-xs text-emerald-500 font-semibold uppercase tracking-tighter">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Live Room
                        </div>
                    </div>
                </div>
                <div className="flex -space-x-2">
                    {members.slice(0, 3).map((m, i) => (
                        <div key={i} className="w-7 h-7 rounded-full bg-slate-200 border-2 border-white dark:border-slate-800 flex items-center justify-center text-[9px] font-bold uppercase">
                            {m.full_name?.charAt(0)}
                        </div>
                    ))}
                    {members.length > 3 && (
                        <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-700 border-2 border-white dark:border-slate-800 flex items-center justify-center text-[9px] font-bold text-slate-500">
                            +{members.length - 3}
                        </div>
                    )}
                </div>
            </header>

            {/* Chat Body */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
                {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center opacity-50 space-y-2">
                        <MessageSquare size={40} className="text-slate-300" />
                        <p className="text-sm text-slate-400">Start the conversation in {room.name}</p>
                    </div>
                ) : (
                    messages.map((m, i) => (
                        <MessageItem key={m.id} message={m} isMe={m.user_id === profile.id} />
                    ))
                )}
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSend} className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 rounded-b-2xl">
                <div className="relative">
                    <input
                        type="text"
                        value={msg}
                        onChange={(e) => setMsg(e.target.value)}
                        placeholder="Type a message or share an expense note..."
                        className="glass-input w-full pr-12 py-3.5 pl-4"
                    />
                    <button
                        type="submit"
                        disabled={!msg.trim()}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-primary-600 text-white disabled:bg-slate-300 disabled:opacity-50 transition-all hover:bg-primary-700 active:scale-95"
                    >
                        <Send size={18} />
                    </button>
                </div>
            </form>

            <div className="mt-4 p-3 bg-primary-50 dark:bg-primary-950/20 rounded-xl flex items-start gap-3 border border-primary-100 dark:border-primary-900/30">
                <AlertCircle size={16} className="text-primary-500 flex-shrink-0 mt-0.5" />
                <p className="text-[10px] text-primary-700 dark:text-primary-400 font-medium leading-relaxed">
                    Mentions and direct expense sharing coming soon. This chat is encrypted locally.
                </p>
            </div>
        </div>
    );
};

const MessageItem = ({ message, isMe }) => {
    return (
        <div className={`flex flex-col space-y-1 ${isMe ? 'items-end' : 'items-start'}`}>
            <div className={`flex items-center gap-2 ${isMe ? 'flex-row-reverse' : ''}`}>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    {isMe ? 'You' : message.full_name || 'Member'}
                </span>
                <span className="text-[9px] text-slate-300">{dayjs(message.created_at).format('hh:mm A')}</span>
            </div>
            <div className={`p-3 rounded-2xl max-w-[85%] ${isMe
                ? 'bg-primary-600 text-white rounded-tr-none shadow-glow-blue/10'
                : 'bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 rounded-tl-none'
                }`}>
                <p className="text-sm font-medium leading-relaxed">{message.text}</p>
            </div>
        </div>
    );
};

export default RoomChat;
