import React, { useState, useEffect } from 'react';
import { User, ConnectionRequest } from '../types';
import { api } from '../services/api';
import UserAvatar from './UserAvatar';

const Requests: React.FC<{ user: User | null }> = ({ user }) => {
    const [requests, setRequests] = useState<ConnectionRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadRequests = async () => {
        if (!user) return;
        setIsLoading(true);
        try {
            const data = await api.requests.getRequestsForUser(user.id, user.role);
            // Only show pending connection requests in this tab
            setRequests(data.filter(r => r.status === 'pending'));
        } catch (err) {
            console.error("Failed to load requests", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadRequests();
    }, [user]);

    const handleUpdateStatus = async (requestId: string, status: 'accepted' | 'rejected') => {
        try {
            await api.requests.updateRequestStatus(requestId, status);
            // Remove from list immediately upon accept/reject
            setRequests(prev => prev.filter(r => r.id !== requestId));
        } catch (err) {
            console.error("Failed to update status", err);
        }
    };

    if (!user) return null;

    const isMentor = user.role === 'mentor';

    return (
        <div className="space-y-6">
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm min-h-[50vh]">
                <h3 className="text-2xl font-black text-slate-900 mb-6 tracking-tight">
                    {isMentor ? 'Connection Requests' : 'My Requests'}
                </h3>

                {isLoading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    </div>
                ) : requests.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed border-slate-100 rounded-3xl">
                        <p className="text-slate-400 font-medium">No connection requests yet.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {requests.map((request) => (
                            <div key={request.id} className="flex flex-col md:flex-row gap-6 p-6 rounded-3xl bg-slate-50 border border-slate-100 items-center transition-all hover:bg-white hover:shadow-md">
                                <div className="flex items-center gap-4 flex-1">
                                    <UserAvatar name={isMentor ? request.menteeName : request.mentorName} role={isMentor ? 'mentee' : 'mentor'} size={64} className="rounded-2xl shadow-sm border border-white" />
                                    <div>
                                        <h4 className="text-lg font-bold text-slate-900">
                                            {isMentor ? request.menteeName : request.mentorName}
                                        </h4>
                                        <div className="flex items-center gap-3 mt-1">
                                            <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md ${request.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                                request.status === 'accepted' ? 'bg-emerald-100 text-emerald-700' :
                                                    request.status === 'cancelled' ? 'bg-slate-100 text-slate-400' :
                                                        'bg-rose-100 text-rose-700'
                                                }`}>
                                                {request.status}
                                            </span>
                                            {request.selectedSlot && (
                                                <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-md border border-indigo-100">
                                                    🗓 {request.selectedSlot}
                                                </span>
                                            )}
                                            <p className="text-xs text-slate-400 font-medium">
                                                {new Date(request.timestamp).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {isMentor && request.status === 'pending' && (
                                    <div className="flex gap-3 w-full md:w-auto">
                                        <button
                                            onClick={() => handleUpdateStatus(request.id, 'accepted')}
                                            className="flex-1 md:flex-none px-6 py-3 bg-blue-600 text-white text-[10px] font-black rounded-xl hover:bg-blue-700 transition-all uppercase tracking-widest shadow-lg shadow-blue-500/20 active:scale-95"
                                        >
                                            Accept
                                        </button>
                                        <button
                                            onClick={() => handleUpdateStatus(request.id, 'rejected')}
                                            className="flex-1 md:flex-none px-6 py-3 bg-white text-slate-400 text-[10px] font-black rounded-xl hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-all border border-slate-200 uppercase tracking-widest active:scale-95"
                                        >
                                            Decline
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Requests;
