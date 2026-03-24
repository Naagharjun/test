import React, { useState, useEffect, useRef } from 'react';
import { User, Message } from '../types';
import { api } from '../services/api';

interface ChatProps {
    user: User;
    connectionId: string;
    recipientId: string;
    recipientName: string;
    onClose: () => void;
}

const Chat: React.FC<ChatProps> = ({ user, connectionId, recipientId, recipientName, onClose }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
        messagesEndRef.current?.scrollIntoView({ behavior });
    };

    const loadMessages = async (isInitial = false) => {
        try {
            const data = await api.messages.getMessages(connectionId);
            setMessages(data);

            // If any messages are unread AND were sent to ME, mark them as read
            const hasUnread = data.some(m => !m.read && m.recipientId === user.id);
            if (hasUnread) {
                await api.messages.markAsRead(connectionId, user.id);
            }

            if (isInitial) {
                setTimeout(() => scrollToBottom('auto'), 100);
            }
        } catch (err) {
            console.error("Failed to load messages", err);
        } finally {
            if (isInitial) setIsLoading(false);
        }
    };

    useEffect(() => {
        loadMessages(true);
        const interval = setInterval(() => loadMessages(false), 3000); // Poll every 3s for real-time updates
        return () => clearInterval(interval);
    }, [connectionId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages.length]);

    const handleSendMessage = async (e?: React.FormEvent, fileUrl?: string, fileType?: string) => {
        if (e) e.preventDefault();
        if (!newMessage.trim() && !fileUrl) return;

        const content = newMessage.trim() || (fileType === 'image' ? 'Sent an image' : 'Shared a document');
        setNewMessage('');

        try {
            const msg = await api.messages.sendMessage(connectionId, user.id, recipientId, content, fileUrl, fileType);
            setMessages(prev => [...prev, msg]);
            scrollToBottom();
        } catch (err) {
            console.error("Failed to send message", err);
            alert("Failed to send message. Please try again.");
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Size check (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            alert("File is too large. Max size is 10MB.");
            return;
        }

        setIsUploading(true);
        try {
            const { url, type } = await api.messages.uploadFile(file);
            await handleSendMessage(undefined, url, type);
        } catch (err) {
            console.error("Upload failed", err);
            alert("Failed to upload file. Please try again.");
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    // Helper to group messages by date
    const groupMessagesByDate = (msgs: Message[]) => {
        const groups: { [key: string]: Message[] } = {};
        msgs.forEach(msg => {
            const date = new Date(msg.createdAt).toLocaleDateString();
            if (!groups[date]) groups[date] = [];
            groups[date].push(msg);
        });
        return groups;
    };

    const formatDateHeader = (dateStr: string) => {
        const date = new Date(dateStr);
        const today = new Date();
        const yesterday = new Date();
        yesterday.setDate(today.getDate() - 1);

        if (date.toLocaleDateString() === today.toLocaleDateString()) return 'Today';
        if (date.toLocaleDateString() === yesterday.toLocaleDateString()) return 'Yesterday';
        return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    };

    return (
        <div className="flex flex-col h-[600px] bg-white/40 backdrop-blur-2xl rounded-[3rem] border border-white/50 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500 relative">
            {/* Modern Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 via-white/50 to-violet-50/50 -z-10"></div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-[100px] -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-violet-500/5 rounded-full blur-[100px] -ml-32 -mb-32"></div>

            {/* Header */}
            <div className="px-8 py-6 bg-white/60 backdrop-blur-xl flex items-center justify-between border-b border-white/50 z-10">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-black text-xl shadow-lg border border-white/20">
                        {recipientName.charAt(0)}
                    </div>
                    <div>
                        <h4 className="text-slate-900 font-black tracking-tight text-lg leading-tight">{recipientName}</h4>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Now</p>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button className="w-11 h-11 rounded-2xl bg-white/80 hover:bg-white flex items-center justify-center text-indigo-600 transition-all border border-white shadow-sm hover:shadow-md active:scale-95">
                        <span className="text-base">📞</span>
                    </button>
                    <button className="w-11 h-11 rounded-2xl bg-white/80 hover:bg-white flex items-center justify-center text-indigo-600 transition-all border border-white shadow-sm hover:shadow-md active:scale-95">
                        <span className="text-base">📹</span>
                    </button>
                    <button
                        onClick={onClose}
                        className="w-11 h-11 rounded-2xl bg-slate-900 text-white flex items-center justify-center transition-all hover:bg-slate-800 shadow-lg active:scale-95"
                    >
                        ✕
                    </button>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-hide z-10">
                {isLoading ? (
                    <div className="flex justify-center items-center h-full">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
                        <div className="bg-white/60 backdrop-blur-md p-8 rounded-[2.5rem] shadow-xl shadow-indigo-500/5 border border-white max-w-[280px]">
                            <p className="text-sm font-black text-slate-800 mb-3 tracking-tight">✨ Premium Mentorship</p>
                            <p className="text-xs font-bold text-slate-500 leading-relaxed">Your connections and conversations are prioritized for maximum growth.</p>
                        </div>
                    </div>
                ) : (
                    Object.entries(groupMessagesByDate(messages)).map(([date, msgs]) => (
                        <div key={date} className="space-y-4">
                            <div className="flex justify-center my-6">
                                <span className="px-4 py-1.5 bg-white/90 backdrop-blur rounded-xl text-[10px] font-black text-slate-500 uppercase tracking-widest shadow-sm border border-slate-100">
                                    {formatDateHeader(date)}
                                </span>
                            </div>
                            {msgs.map((msg, i) => {
                                const isMe = msg.senderId === user.id;
                                return (
                                    <div key={msg.id || i} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                                        <div className={`relative max-w-[85%] px-5 py-3.5 rounded-3xl shadow-lg border transition-all hover:scale-[1.01] ${isMe
                                            ? 'bg-gradient-to-br from-indigo-600 to-violet-700 text-white rounded-tr-none border-white/20'
                                            : 'bg-white/80 backdrop-blur-md text-slate-900 rounded-tl-none border-white shadow-indigo-500/5'
                                            }`}>
                                            {msg.fileUrl ? (
                                                <div className="mb-2">
                                                    {msg.fileType === 'image' ? (
                                                        <img 
                                                            src={`http://${window.location.hostname}:5000${msg.fileUrl}`} 
                                                            alt="Shared image" 
                                                            className="rounded-2xl max-w-full h-auto max-h-64 object-cover shadow-sm border border-white/10"
                                                        />
                                                    ) : (
                                                        <a 
                                                            href={`http://${window.location.hostname}:5000${msg.fileUrl}`} 
                                                            target="_blank" 
                                                            rel="noopener noreferrer"
                                                            className={`flex items-center gap-3 p-3 rounded-2xl border transition-all ${
                                                                isMe ? 'bg-white/10 border-white/20 hover:bg-white/20' : 'bg-slate-50 border-slate-100 hover:bg-slate-100'
                                                            }`}
                                                        >
                                                            <span className="text-2xl">📄</span>
                                                            <div className="text-left overflow-hidden">
                                                                <p className={`text-xs font-black truncate ${isMe ? 'text-white' : 'text-slate-900'}`}>
                                                                    {msg.fileUrl.split('-').slice(1).join('-') || 'Document'}
                                                                </p>
                                                                <p className={`text-[9px] font-bold uppercase tracking-widest ${isMe ? 'text-white/60' : 'text-slate-400'}`}>Click to View</p>
                                                            </div>
                                                        </a>
                                                    )}
                                                </div>
                                            ) : null}
                                            <p className={`text-[14px] font-bold leading-relaxed mb-1 pr-12 ${isMe ? 'text-white' : 'text-slate-700'}`}>{msg.content}</p>
                                            <div className="flex items-center gap-1.5 justify-end absolute bottom-2 right-4">
                                                <span className={`text-[9px] font-black uppercase tracking-wider ${isMe ? 'text-white/60' : 'text-slate-400'}`}>
                                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                                {isMe && (
                                                    <span className={`text-[10px] font-black ${msg.read ? 'text-emerald-300' : 'text-white/40'}`}>
                                                        {msg.read ? '✓✓' : '✓'}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Premium Input Area */}
            <form onSubmit={(e) => handleSendMessage(e)} className="p-6 bg-white/60 backdrop-blur-xl flex items-center gap-4 z-10 border-t border-white/50">
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileUpload} 
                    className="hidden" 
                    accept="image/*,.pdf,.doc,.docx,.txt"
                />
                <button 
                    type="button" 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-xl shadow-sm hover:shadow-md border border-white hover:scale-110 transition-all font-black disabled:opacity-50"
                >
                    {isUploading ? '⏳' : '➕'}
                </button>
                <div className="flex-1 relative">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type an inspiring message..."
                        className="w-full px-6 py-4 rounded-2xl bg-white border-white/50 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 text-sm font-black shadow-inner transition-all placeholder:text-slate-300 text-slate-900"
                    />
                </div>
                {newMessage.trim() && (
                    <button
                        type="submit"
                        className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-violet-600 text-white rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-600/20 hover:scale-105 transition-all transform active:scale-95 group overflow-hidden"
                    >
                        <span className="text-xl group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform italic font-black">➤</span>
                    </button>
                )}
            </form>
        </div>
    );
};

export default Chat;
