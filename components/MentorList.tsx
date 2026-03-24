import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { User, Mentor } from '../types';
import { calculateBadges } from '../utils/badges';
import BadgeList from './BadgeList';
import UserAvatar from './UserAvatar';

const isSlotExpired = (date: string, time: string): boolean => {
  return new Date(`${date}T${time}`) < new Date();
};

const MentorList: React.FC<{ user: User | null }> = ({ user }) => {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSpecialization, setFilterSpecialization] = useState('All');
  const [sortBy, setSortBy] = useState('rating');
  const [isLoading, setIsLoading] = useState(true);
  const [mentorStatuses, setMentorStatuses] = useState<Record<string, string>>({});
  const [mentorReviews, setMentorReviews] = useState<Record<string, any[]>>({});

  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [isBooking, setIsBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState('');

  const getRatingStats = (mentorId: string) => {
    const reviews = mentorReviews[mentorId] || [];
    if (!reviews || reviews.length === 0) return { avg: "0", count: 0 };
    const validRatings = reviews.filter(r => r && typeof r.rating === 'number');
    if (validRatings.length === 0) return { avg: "0", count: 0 };
    const sum = validRatings.reduce((acc, r) => acc + (r.rating || 0), 0);
    return { avg: (sum / validRatings.length).toFixed(1), count: reviews.length };
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const mentorsData = await api.users.getMentors();
        setMentors(mentorsData as Mentor[]);

        if (user) {
          const myRequests = await api.requests.getRequestsForUser(user.id, user.role);
          const statusMap: Record<string, string> = {};
          myRequests.forEach(req => {
            // Keep the most "active" status for the mentor
            // If they have an accepted connection, that's what we care about most
            if (req.status === 'accepted') {
              statusMap[req.mentorId] = 'accepted';
            } else if (req.status === 'pending' && statusMap[req.mentorId] !== 'accepted') {
              statusMap[req.mentorId] = 'pending';
            }
          });
          setMentorStatuses(statusMap);
        }

        // Fetch reviews for each mentor
        const reviewsMap: Record<string, any[]> = {};
        await Promise.all(mentorsData.map(async (m: any) => {
          try {
            const reviews = await api.reviews.getReviews(m.id);
            reviewsMap[m.id] = reviews;
          } catch (e) {
            console.error(`Failed to fetch reviews for ${m.id}`, e);
          }
        }));
        setMentorReviews(reviewsMap);
      } catch (err) {
        console.error("Failed fetching mentors", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const handleOpenModal = (mentor: Mentor) => {
    setSelectedMentor(mentor);
    setSelectedSlot('');
    setBookingSuccess('');
    setIsBooking(false);
  };

  const handleBook = async (mentor: Mentor) => {
    if (!user || !selectedSlot) return;
    setIsBooking(true);
    try {
      const response = await api.requests.sendRequest(user.id, mentor.id, user.name, mentor.name, selectedSlot);
      const isAutoAccepted = response.status === 'accepted';

      if (isAutoAccepted) {
        setMentorStatuses(prev => ({ ...prev, [mentor.id]: 'accepted' }));
        setBookingSuccess(`Session confirmed with ${mentor.name} for ${selectedSlot}!`);
      } else {
        setMentorStatuses(prev => ({ ...prev, [mentor.id]: 'pending' }));
        setBookingSuccess(`Request sent to ${mentor.name} for ${selectedSlot}!`);
      }

      setTimeout(() => {
        setSelectedMentor(null);
        setBookingSuccess('');
      }, 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsBooking(false);
    }
  };

  const filteredMentors = mentors
    .filter(mentor => {
      if (!mentor) return false;
      const search = searchTerm.toLowerCase();
      const matchesSearch =
        (mentor.name?.toLowerCase() || '').includes(search) ||
        (mentor.specialization?.toLowerCase() || '').includes(search) ||
        (mentor.skills || []).some(s => (typeof s === 'string' ? s : s.name).toLowerCase().includes(search));

      const matchesFilter = filterSpecialization === 'All' || mentor.specialization === filterSpecialization;

      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      if (sortBy === 'name') return (a.name || '').toLocaleLowerCase().localeCompare((b.name || '').toLocaleLowerCase());
      if (sortBy === 'rating') {
        const ratingB = Number(getRatingStats(b?.id || '').avg) || 0;
        const ratingA = Number(getRatingStats(a?.id || '').avg) || 0;
        return ratingB - ratingA;
      }
      if (sortBy === 'sessions') return (b.totalSessions || 0) - (a.totalSessions || 0);
      return 0;
    });

  const specializations = ['All', ...Array.from(new Set(mentors.map(m => m?.specialization).filter(Boolean)))];

  return (
    <div className="space-y-8 animate-fade-in relative">
      {/* Header & Search */}
      <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

        <div className="relative z-10 space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="max-w-xl">
              <h3 className="text-3xl font-black text-slate-900 tracking-tight">Find Your Perfect Mentor</h3>
              <p className="text-slate-500 mt-2 text-lg font-medium">Connect with industry experts who can accelerate your career growth.</p>
            </div>

            <div className="relative w-full md:w-96 group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search name, role, or skill..."
                className="block w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm font-medium"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Filter by:</span>
              <select
                value={filterSpecialization}
                onChange={(e) => setFilterSpecialization(e.target.value)}
                className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition-all cursor-pointer"
              >
                {specializations.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition-all cursor-pointer"
              >
                <option value="rating">Top Rated</option>
                <option value="name">Alphabetical</option>
                <option value="sessions">Most Experienced</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {filteredMentors.map((mentor, index) => (
          <div
            key={mentor.id}
            className="group bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none translate-x-10 -translate-y-10"></div>

            <div className="relative flex gap-6">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-600 rounded-2xl rotate-3 opacity-0 group-hover:opacity-5 transition-all duration-300"></div>
                <UserAvatar src={mentor.avatar} name={mentor.name} role="mentor" size={96} className="rounded-2xl ring-4 ring-white shadow-md relative z-10" />
              </div>

              <div className="flex-1 min-w-0 pt-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-slate-900 text-lg truncate group-hover:text-blue-600 transition-colors">{mentor.name}</h4>
                    <p className="text-sm font-medium text-slate-500">{mentor.specialization}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <div className="flex text-amber-400">
                        {[1, 2, 3, 4, 5].map((star) => {
                          const stats = getRatingStats(mentor.id);
                          return (
                            <span key={star} className={star <= Number(stats.avg) ? 'opacity-100' : 'opacity-30'}>★</span>
                          );
                        })}
                      </div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                        ({getRatingStats(mentor.id).count})
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {(Array.isArray(mentor.skills) ? mentor.skills : []).slice(0, 3).map((skill, i) => (
                    <span key={i} className="px-2.5 py-1 bg-slate-50 text-slate-600 text-[11px] font-semibold rounded-lg border border-slate-100 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-100 transition-colors cursor-default">
                      {typeof skill === 'string' ? skill : skill.name}
                    </span>
                  ))}
                  {Array.isArray(mentor.skills) && mentor.skills.length > 3 && (
                    <span className="px-2 py-1 bg-slate-50 text-slate-400 text-[10px] font-bold rounded-lg border border-slate-100">
                      +{mentor.skills.length - 3}
                    </span>
                  )}
                </div>

                <div className="mt-4">
                  <BadgeList
                    badges={calculateBadges(mentor, mentor.totalSessions || 0, mentorReviews[mentor.id] || [])}
                    size="sm"
                  />
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-end">
              <button
                onClick={() => handleOpenModal(mentor)}
                disabled={mentorStatuses[mentor.id] === 'pending'}
                className={`px-5 py-2.5 rounded-xl text-sm font-semibold shadow-lg transition-all active:scale-95 ${mentorStatuses[mentor.id] === 'pending'
                  ? 'bg-emerald-100 text-emerald-700 shadow-none cursor-default'
                  : mentorStatuses[mentor.id] === 'accepted'
                    ? 'bg-indigo-600 text-white shadow-indigo-600/20 hover:bg-indigo-500'
                    : 'bg-slate-900 text-white shadow-slate-900/10 hover:bg-slate-800 hover:shadow-xl hover:shadow-slate-900/20'
                  }`}
              >
                {mentorStatuses[mentor.id] === 'pending'
                  ? '✓ Requested'
                  : mentorStatuses[mentor.id] === 'accepted'
                    ? 'Request to Mentor'
                    : `Connect (${(mentor.sessionSlots || []).reduce((acc, s) => acc + (s.available || 0), 0)} slots)`}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {!isLoading && filteredMentors.length === 0 && (
        <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-slate-200 animate-fade-in">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl shadow-sm">
            🤔
          </div>
          <h4 className="text-xl font-bold text-slate-900">No mentors found</h4>
          <p className="text-slate-500 max-w-sm mx-auto mt-2 mb-8">
            We couldn't find any mentors matching "{searchTerm}". Try adjusting your search keywords.
          </p>
          <button
            onClick={() => setSearchTerm('')}
            className="px-6 py-2.5 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* Sessions Info Footer */}
      {!isLoading && filteredMentors.length > 0 && (
        <div className="text-center space-y-2 py-4">
          <p className="text-sm text-slate-400 font-medium">Showing {filteredMentors.length} expert mentors ready to help you.</p>
        </div>
      )}

      {/* Booking Modal */}
      {selectedMentor && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-4">
                <UserAvatar src={selectedMentor.avatar} name={selectedMentor.name || 'Mentor'} role="mentor" size={48} className="rounded-xl shadow-sm" />
                <div>
                  <h3 className="font-bold text-slate-900 leading-tight">Book {(selectedMentor.name || 'Mentor').split(' ')[0]}</h3>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mt-0.5">{selectedMentor.specialization || 'Session'}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedMentor(null)}
                className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-black/5 rounded-full transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Slots Selection */}
            <div className="p-6 overflow-y-auto">
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Select a Time</h4>
              <div className="grid grid-cols-2 gap-3">
                {selectedMentor.sessionSlots && selectedMentor.sessionSlots.length > 0 ? (
                  selectedMentor.sessionSlots.map((slot, idx) => {
                    const expired = isSlotExpired(slot.date, slot.time);
                    const remaining = slot.available;
                    const disabled = expired || remaining <= 0;
                    const slotString = `${slot.date} at ${slot.time}`;
                    const isSelected = selectedSlot === slotString;

                    return (
                      <button
                        key={idx}
                        disabled={disabled}
                        onClick={() => setSelectedSlot(slotString)}
                        className={`p-3 rounded-xl border-2 text-left transition-all ${disabled
                          ? 'border-slate-100 bg-slate-50 opacity-50 cursor-not-allowed'
                          : isSelected
                            ? 'border-indigo-600 bg-indigo-50 shadow-md shadow-indigo-600/10'
                            : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
                          }`}
                      >
                        <div className={`font-bold ${isSelected ? 'text-indigo-900' : 'text-slate-900'}`}>{slot.time}</div>
                        <div className={`text-xs mt-0.5 ${isSelected ? 'text-indigo-600 font-medium' : 'text-slate-500'}`}>{slot.date}</div>
                        {remaining > 0 && <div className="text-[10px] font-bold text-emerald-600 mt-1">{remaining} left</div>}
                      </button>
                    )
                  })
                ) : (
                  <div className="col-span-2 text-center py-6">
                    <p className="text-slate-500 font-medium bg-slate-50 p-4 rounded-xl text-sm border border-slate-100">Mentor is not available at the moment.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-slate-100 bg-white space-y-3">
              {/* Success message */}
              {bookingSuccess && (
                <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                  <span className="text-2xl">🎉</span>
                  <p className="text-emerald-700 text-sm font-bold">{bookingSuccess}</p>
                </div>
              )}

              {/* Book Button */}
              <button
                onClick={() => handleBook(selectedMentor)}
                disabled={mentorStatuses[selectedMentor.id] === 'pending' || isBooking || !selectedSlot}
                className={`w-full py-4 rounded-2xl text-sm font-black uppercase tracking-widest shadow-xl transition-all active:scale-[0.98] ${mentorStatuses[selectedMentor.id] === 'pending'
                  ? 'bg-emerald-100 text-emerald-700 shadow-none cursor-default'
                  : (!selectedSlot)
                    ? 'bg-slate-200 text-slate-400 shadow-none cursor-not-allowed'
                    : 'bg-slate-900 hover:bg-slate-800 text-white shadow-slate-900/20'
                  }`}
              >
                {isBooking
                  ? 'Processing...'
                  : mentorStatuses[selectedMentor.id] === 'accepted' && selectedSlot
                    ? '🗓 Confirm Booking'
                    : mentorStatuses[selectedMentor.id] === 'pending'
                      ? '✓ Request Sent!'
                      : '🗓 Book a Session'}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default MentorList;
