import React, { useState, useEffect } from 'react';
import { User, ConnectionRequest, Message } from '../types';
import { api } from '../services/api';
import Chat from './Chat';
import UserAvatar from './UserAvatar';

const Connections: React.FC<{ user: User | null; selectedConnectionId?: string | null }> = ({ user, selectedConnectionId }) => {
    const [connections, setConnections] = useState<ConnectionRequest[]>([]);
    const [lastMessages, setLastMessages] = useState<{ [key: string]: Message }>({});
    const [unreadCounts, setUnreadCounts] = useState<{ [key: string]: number }>({});
    const [isLoading, setIsLoading] = useState(true);
    const [activeChat, setActiveChat] = useState<ConnectionRequest | null>(null);

    const loadData = async () => {
        if (!user) return;
        try {
            const data = await api.requests.getRequestsForUser(user.id, user.role);
            const accepted = data.filter(r => r.status === 'accepted');
            setConnections(accepted);

            // Fetch last message and unread count for each accepted connection
            const msgData: { [key: string]: Message } = {};
            const unread: { [key: string]: number } = {};

            await Promise.all(accepted.map(async (conn) => {
                const msgs = await api.messages.getMessages(conn.id);
                if (msgs.length > 0) {
                    msgData[conn.id] = msgs[msgs.length - 1];
                    unread[conn.id] = msgs.filter(m => !m.read && m.recipientId === user.id).length;
                }
            }));

            setLastMessages(msgData);
            setUnreadCounts(unread);
        } catch (err) {
            console.error("Failed to load connections data", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadData();
        const interval = setInterval(loadData, 5000);
        return () => clearInterval(interval);
    }, [user]);

    // Handle selectedConnectionId from props
    useEffect(() => {
        if (selectedConnectionId && connections.length > 0) {
            const found = connections.find(c => c.id === selectedConnectionId);
            if (found) setActiveChat(found);
        }
    }, [selectedConnectionId, connections]);

    if (!user) return null;

    const isMentor = user.role === 'mentor';

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[calc(100vh-200px)] animate-in fade-in duration-500">
            {/* Sidebar - Connection List */}
            <div className={`lg:col-span-1 bg-white/40 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/40 shadow-xl shadow-indigo-500/5 flex flex-col relative overflow-hidden ${activeChat ? 'hidden lg:flex' : 'flex'}`}>
                {/* Decorative blob */}
                <div className="absolute top-0 left-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl -ml-16 -mt-16"></div>

                <div className="flex items-center justify-between mb-8 px-2 relative z-10">
                    <h3 className="text-3xl font-black text-slate-900 tracking-tight">Messages</h3>
                    <div className="w-11 h-11 bg-white/60 backdrop-blur-md rounded-2xl flex items-center justify-center text-slate-400 border border-white/50 shadow-sm cursor-pointer hover:bg-white transition-all">
                        🔍
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto space-y-3 scrollbar-hide pr-2">
                    {isLoading && connections.length === 0 ? (
                        <div className="flex justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                        </div>
                    ) : connections.length === 0 ? (
                        <div className="text-center py-12 px-6 border-2 border-dashed border-slate-100 rounded-[2rem] bg-slate-50/50">
                            <div className="text-4xl mb-4">🤝</div>
                            <p className="text-slate-500 text-sm font-bold leading-relaxed">No active connections. Start connecting with {isMentor ? 'mentees' : 'mentors'} to chat!</p>
                        </div>
                    ) : (
                        connections.map((conn) => {
                            const isActive = activeChat?.id === conn.id;
                            const displayName = isMentor ? conn.menteeName : conn.mentorName;
                            const lastMsg = lastMessages[conn.id];
                            const unread = unreadCounts[conn.id] || 0;

                            return (
                                <button
                                    key={conn.id}
                                    onClick={() => setActiveChat(conn)}
                                    className={`w-full flex items-center gap-4 p-5 rounded-[2rem] transition-all border group relative ${isActive
                                        ? 'bg-gradient-to-r from-indigo-600 to-violet-700 border-indigo-500 shadow-xl shadow-indigo-600/20 translate-x-1'
                                        : 'bg-white/50 border-white/50 hover:bg-white hover:border-indigo-100 hover:shadow-lg hover:shadow-indigo-500/5'
                                        }`}
                                >
                                    <UserAvatar name={displayName} role={isMentor ? 'mentee' : 'mentor'} size={56} className={`rounded-2xl shadow-sm border shrink-0 transition-all group-hover:scale-105 ${isActive ? 'bg-white/20 text-white border-white/30 backdrop-blur-sm' : 'bg-indigo-50 border-indigo-100'}`} />
                                    <div className="text-left flex-1 min-w-0 pr-4">
                                        <div className="flex justify-between items-center mb-1">
                                            <p className={`font-black truncate tracking-tight ${isActive ? 'text-white' : 'text-slate-900'}`}>
                                                {displayName}
                                            </p>
                                            {lastMsg && (
                                                <span className={`text-[10px] font-black shrink-0 uppercase tracking-wider ${isActive ? 'text-white/60' : 'text-slate-400'}`}>
                                                    {new Date(lastMsg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <p className={`text-xs truncate ${isActive ? 'text-indigo-100/80 font-medium' : unread > 0 ? 'font-black text-slate-900' : 'font-medium text-slate-500'}`}>
                                                {lastMsg ? lastMsg.content : 'Started a new conversation'}
                                            </p>
                                            {unread > 0 && (
                                                <span className={`w-6 h-6 text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110 ${isActive ? 'bg-white text-indigo-600' : 'bg-gradient-to-br from-indigo-500 to-violet-600'}`}>
                                                    {unread}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </button>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Main Chat Area */}
            <div className={`lg:col-span-2 ${activeChat ? 'block' : 'hidden lg:block'}`}>
                {activeChat ? (
                    <Chat
                        user={user}
                        connectionId={activeChat.id}
                        recipientId={isMentor ? activeChat.menteeId : activeChat.mentorId}
                        recipientName={isMentor ? activeChat.menteeName : activeChat.mentorName}
                        onClose={() => setActiveChat(null)}
                    />
                ) : (
                    <div className="h-full bg-white/30 backdrop-blur-md rounded-[3rem] border border-white flex flex-col items-center justify-center text-center p-12 overflow-hidden relative shadow-inner">
                        <div className="absolute top-0 left-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-[80px] -ml-32 -mt-32"></div>
                        <div className="absolute bottom-0 right-0 w-64 h-64 bg-violet-500/5 rounded-full blur-[80px] -mr-32 -mt-32"></div>

                        <div className="w-32 h-32 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-[2.5rem] flex items-center justify-center text-5xl shadow-2xl shadow-indigo-600/20 mb-8 border-4 border-white animate-pulse z-10">
                            ✨
                        </div>
                        <h4 className="text-3xl font-black text-slate-900 mb-4 tracking-tight z-10 uppercase">Your Knowledge Hub</h4>
                        <p className="text-slate-500 font-bold max-w-sm mx-auto leading-relaxed z-10 text-lg">
                            Select a connection to start an inspiring conversation.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Connections;
