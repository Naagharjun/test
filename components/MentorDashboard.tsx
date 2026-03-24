import React, { useState, useEffect } from 'react';
import { User, ConnectionRequest } from '../types';
import { api } from '../services/api';
import { calculateBadges } from '../utils/badges';
import BadgeList from './BadgeList';

const MentorDashboard: React.FC<{
    user: User | null;
    onTabChange: (tab: string) => void;
    onSelectConnection: (id: string) => void;
}> = ({ user, onTabChange, onSelectConnection }) => {
    const [requests, setRequests] = useState<ConnectionRequest[]>([]);
    const [reviews, setReviews] = useState<any[]>([]);
    const [resources, setResources] = useState<any[]>([]);
    const [isLoadingReviews, setIsLoadingReviews] = useState(true);

    useEffect(() => {
        const fetchRequests = async () => {
            if (!user) return;
            try {
                const data = await api.requests.getRequestsForUser(user.id, user.role);
                setRequests(data);
            } catch (err) {
                console.error("Failed to load requests", err);
            }
        }
        const fetchReviews = async () => {
            if (!user) return;
            try {
                const data = await api.reviews.getReviews(user.id);
                setReviews(data);
            } catch (err) {
                console.error("Failed to load reviews", err);
            } finally {
                setIsLoadingReviews(false);
            }
        }
        const fetchResources = async () => {
            if (!user) return;
            try {
                const data = await api.resources.getResources(user.id);
                setResources(data);
            } catch (err) {
                console.error("Failed to load resources", err);
            }
        }
        fetchRequests();
        fetchReviews();
        fetchResources();
    }, [user]);

    const [cancellingId, setCancellingId] = useState<string | null>(null);

    const handleCancel = async (requestId: string) => {
        setCancellingId(requestId);
        try {
            await api.requests.cancelRequest(requestId);
            setRequests(prev => prev.filter(r => r.id !== requestId));
        } catch (err) {
            console.error('Failed to cancel session', err);
        } finally {
            setCancellingId(null);
        }
    };

    const acceptedRequests = requests.filter(r => r.status === 'accepted');
    const badges = user ? calculateBadges(user, acceptedRequests.length, reviews, resources) : [];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Badges Header */}
            {badges.length > 0 && (
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-6 shadow-xl shadow-blue-500/20 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
                    <div>
                        <h4 className="text-white font-black text-xl mb-1 tracking-tight">Your Achievements</h4>
                        <p className="text-blue-100 text-xs font-bold uppercase tracking-widest opacity-80">Keep up the great work, {user?.name.split(' ')[0]}!</p>
                    </div>
                    <BadgeList badges={badges} />
                </div>
            )}
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-blue-500/5 transition-all group">
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Total Sessions</p>
                        <div className="w-10 h-10 bg-blue-50 rounded-2xl flex items-center justify-center text-xl group-hover:scale-110 transition-transform">📅</div>
                    </div>
                    <div className="flex items-end justify-between">
                        <h3 className="text-4xl font-black text-slate-900 tracking-tight">{acceptedRequests.length}</h3>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-purple-500/5 transition-all group">
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Active Mentees</p>
                        <div className="w-10 h-10 bg-purple-50 rounded-2xl flex items-center justify-center text-xl group-hover:scale-110 transition-transform">👥</div>
                    </div>
                    <div className="flex items-end justify-between">
                        <h3 className="text-4xl font-black text-slate-900 tracking-tight">{new Set(acceptedRequests.map(r => r.menteeId)).size}</h3>
                        <span className="text-[10px] font-black px-3 py-1.5 bg-purple-100 text-purple-700 rounded-full uppercase tracking-wider">Growing Fast</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Upcoming Sessions List */}
                <div className="bg-white/70 backdrop-blur-md p-8 rounded-[2.5rem] border border-slate-200/60 shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl -mr-16 -mt-16"></div>

                    <div className="flex justify-between items-center mb-8">
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight">Mentoring Schedule</h3>
                    </div>

                    <div className="space-y-5">
                        {acceptedRequests.length === 0 ? (
                            <p className="text-sm text-slate-400 font-medium py-8 text-center border-2 border-dashed border-slate-100 rounded-3xl">No upcoming sessions. Accept requests to see them here.</p>
                        ) : (
                            acceptedRequests.slice(0, 3).map((r) => {
                                const d = new Date(r.timestamp);
                                return (
                                    <div key={r.id} className="group flex gap-5 p-5 rounded-3xl hover:bg-white transition-all border border-transparent hover:border-slate-100 hover:shadow-lg hover:shadow-slate-200/30">
                                        <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex flex-col items-center justify-center text-white shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
                                            <span className="text-[10px] font-black leading-none uppercase mb-1 opacity-70">
                                                {d.toLocaleDateString('en-US', { month: 'short' })}
                                            </span>
                                            <span className="text-2xl font-black leading-none">
                                                {d.getDate()}
                                            </span>
                                        </div>
                                        <div className="flex-1 py-1">
                                            <h4 className="text-base font-black text-slate-900 tracking-tight group-hover:text-blue-600 transition-colors">Career Consultation</h4>
                                            <p className="text-xs font-bold text-slate-400 mt-1 mb-3 uppercase tracking-wider">with {r.menteeName} • {d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
                                            <div className="flex gap-3">
                                                <button
                                                    onClick={() => {
                                                        onSelectConnection(r.id);
                                                        onTabChange('chat');
                                                    }}
                                                    className="px-5 py-2 bg-emerald-100 text-emerald-700 text-[10px] font-black rounded-xl hover:bg-emerald-200 transition-all uppercase tracking-[0.1em] active:scale-95"
                                                >
                                                    Message
                                                </button>
                                                <button
                                                    onClick={() => handleCancel(r.id)}
                                                    disabled={cancellingId === r.id}
                                                    className="px-5 py-2 bg-slate-100 text-slate-500 text-[10px] font-black rounded-xl hover:bg-rose-50 hover:text-rose-600 transition-all uppercase tracking-[0.1em] active:scale-95 disabled:opacity-50"
                                                >
                                                    {cancellingId === r.id ? 'Cancelling...' : 'Cancel'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Insight Panel */}
                <div className="bg-gradient-to-br from-slate-900 to-indigo-950 p-8 rounded-[2.5rem] shadow-2xl flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] -mr-32 -mt-32"></div>

                    <div className="relative">
                        <h3 className="text-2xl font-black text-white mb-8 tracking-tight">Mentor Milestones</h3>
                        <div className="space-y-6">
                            <div className="flex items-center gap-5 group cursor-default">
                                <div className="w-14 h-14 bg-amber-500/20 rounded-2xl flex items-center justify-center text-2xl border border-amber-500/30 group-hover:scale-110 transition-transform">🏆</div>
                                <div>
                                    <p className="text-base font-black text-white tracking-tight">Top Rated</p>
                                    <p className="text-sm text-indigo-200/60 font-medium">Maintained 4.9 average this month.</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-5 group cursor-default">
                                <div className="w-14 h-14 bg-purple-500/20 rounded-2xl flex items-center justify-center text-2xl border border-purple-500/30 group-hover:scale-110 transition-transform">🌟</div>
                                <div>
                                    <p className="text-base font-black text-white tracking-tight">Impact Maker</p>
                                    <p className="text-sm text-indigo-200/60 font-medium">Helped 5 mentees land jobs.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Feedback Section */}
                <div className="bg-white/70 backdrop-blur-md p-8 rounded-[2.5rem] border border-slate-200/60 shadow-lg relative overflow-hidden h-full">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl -mr-16 -mt-16"></div>

                    <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-8">Mentee Feedback</h3>

                    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                        {isLoadingReviews ? (
                            <p className="text-sm text-slate-400 font-medium py-8 text-center animate-pulse">Loading feedback...</p>
                        ) : reviews.length === 0 ? (
                            <div className="text-center py-12 border-2 border-dashed border-slate-100 rounded-3xl">
                                <span className="text-4xl mb-4 block">💬</span>
                                <p className="text-sm text-slate-400 font-medium">No reviews yet. Keep mentoring to build your reputation!</p>
                            </div>
                        ) : (
                            reviews.map((rev) => (
                                <div key={rev._id} className="p-5 bg-slate-50 rounded-2xl border border-slate-100 hover:border-amber-200 hover:bg-amber-50/30 transition-all">
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-bold text-slate-900 text-sm">{rev.menteeName}</h4>
                                        <div className="flex text-amber-400 text-xs">
                                            {[1, 2, 3, 4, 5].map(s => (
                                                <span key={s} className={s <= rev.rating ? 'opacity-100' : 'opacity-20'}>★</span>
                                            ))}
                                        </div>
                                    </div>
                                    <p className="text-sm text-slate-600 leading-relaxed italic">"{rev.comment}"</p>
                                    <p className="text-[10px] font-bold text-slate-400 mt-3 uppercase tracking-wider">
                                        {new Date(rev.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MentorDashboard;
