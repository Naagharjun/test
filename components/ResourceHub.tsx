import React, { useState, useEffect } from 'react';
import { User, Resource, Mentor } from '../types';
import { api } from '../services/api';

const ResourceHub: React.FC<{ user: User | null }> = ({ user }) => {
    const [resources, setResources] = useState<Resource[]>([]);
    const [mentors, setMentors] = useState<Mentor[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);

    // Form state
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [url, setUrl] = useState('');
    const [type, setType] = useState<'link' | 'document' | 'video' | 'article' | 'github' | 'course' | 'other'>('link');
    
    // Filter & Search states
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilter, setActiveFilter] = useState<'all' | 'link' | 'document' | 'video' | 'article' | 'github' | 'course' | 'other'>('all');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [resData, mentorsData] = await Promise.all([
                    api.resources.getResources(),
                    api.users.getMentors()
                ]);
                setResources(resData);
                setMentors(mentorsData as Mentor[]);
            } catch (err) {
                console.error("Failed to load resources", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleAddResource = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || user.role !== 'mentor') return;

        try {
            const newRes = await api.resources.addResource({
                mentorId: user.id,
                title,
                description,
                url,
                type
            });
            setResources([newRes, ...resources]);
            setIsAdding(false);
            setTitle('');
            setDescription('');
            setUrl('');
            setType('link');
        } catch (err) {
            console.error("Failed to add resource", err);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Delete this resource?')) return;
        try {
            await api.resources.deleteResource(id);
            setResources(resources.filter(r => r.id !== id));
        } catch (err) {
            console.error("Failed to delete", err);
        }
    };

    const getMentorName = (id: string) => {
        return mentors.find(m => m.id === id)?.name || 'Mentor';
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'video': return '📽️';
            case 'document': return '📄';
            case 'link': return '🔗';
            case 'article': return '📝';
            case 'github': return '💻';
            case 'course': return '🎓';
            default: return '📦';
        }
    };

    const filteredResources = resources.filter(res => {
        const matchesSearch = res.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             (res.description || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = activeFilter === 'all' || res.type === activeFilter;
        return matchesSearch && matchesFilter;
    });

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h3 className="text-3xl font-black text-slate-900 tracking-tight">Resource Hub</h3>
                        <p className="text-slate-500 mt-2 text-lg font-medium">Curated learning materials shared by industry experts.</p>
                    </div>

                    <div className="flex gap-4 items-center">
                        <div className="relative group">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors">🔍</span>
                            <input 
                                type="text"
                                placeholder="Search resources..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-11 pr-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 font-medium transition-all w-full md:w-64"
                            />
                        </div>
                        {user?.role === 'mentor' && (
                            <button
                                onClick={() => setIsAdding(!isAdding)}
                                className="px-6 py-3.5 bg-slate-900 text-white font-black rounded-2xl shadow-xl shadow-slate-900/10 hover:bg-slate-800 transition-all uppercase tracking-widest text-xs active:scale-95 flex items-center gap-2 flex-shrink-0"
                            >
                                {isAdding ? '✕ Close' : '➕ Share Resource'}
                            </button>
                        )}
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="mt-8 flex flex-wrap gap-2">
                    {['all', 'link', 'article', 'github', 'course', 'video', 'document', 'other'].map(f => (
                        <button
                            key={f}
                            onClick={() => setActiveFilter(f as any)}
                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border ${
                                activeFilter === f 
                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-600/20 scale-105' 
                                : 'bg-white text-slate-500 border-slate-100 hover:border-slate-300 hover:text-slate-900'
                            }`}
                        >
                            {f === 'all' ? 'All Resources' : f}
                        </button>
                    ))}
                </div>
            </div>

            {/* Add Form */}
            {isAdding && (
                <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl animate-in slide-in-from-top-4 duration-300">
                    <h4 className="text-xl font-black text-slate-900 mb-6">Create New Resource</h4>
                    <form onSubmit={handleAddResource} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Title</label>
                            <input
                                required
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                placeholder="e.g., React Design Patterns 2024"
                                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Resource URL</label>
                            <input
                                required
                                value={url}
                                onChange={e => setUrl(e.target.value)}
                                placeholder="https://..."
                                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Type</label>
                            <select
                                value={type}
                                onChange={e => setType(e.target.value as any)}
                                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium transition-all appearance-none"
                            >
                                <option value="link">Link</option>
                                <option value="document">Document</option>
                                <option value="video">Video</option>
                                <option value="article">Article</option>
                                <option value="github">GitHub</option>
                                <option value="course">Course</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Description (Optional)</label>
                            <input
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                placeholder="Brief summary of why this is useful"
                                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium transition-all"
                            />
                        </div>
                        <div className="md:col-span-2 pt-2">
                            <button type="submit" className="w-full py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 transition-all uppercase tracking-widest text-sm">
                                Publish Resource
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Resources Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading ? (
                    [1, 2, 3].map(i => <div key={i} className="h-64 bg-slate-100 rounded-3xl animate-pulse"></div>)
                ) : filteredResources.length === 0 ? (
                    <div className="lg:col-span-3 text-center py-24 bg-white rounded-3xl border border-dashed border-slate-200">
                        <span className="text-6xl mb-6 block">🔎</span>
                        <h4 className="text-xl font-black text-slate-900">No matching resources found</h4>
                        <p className="text-slate-500 mt-2">Try adjusting your search or filters.</p>
                    </div>
                ) : (
                    filteredResources.map((res) => (
                        <div key={res.id} className="group bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden flex flex-col justify-between">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none translate-x-5 -translate-y-5"></div>

                            <div>
                                <div className="flex justify-between items-start mb-4">
                                    <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-2xl shadow-inner group-hover:scale-110 transition-transform">
                                        {getTypeIcon(res.type)}
                                    </div>
                                    <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black rounded-full uppercase tracking-wider">
                                        {res.type}
                                    </span>
                                </div>

                                <h4 className="text-lg font-black text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2">{res.title}</h4>
                                <p className="text-sm text-slate-500 mt-2 font-medium line-clamp-3">{res.description || 'No description provided.'}</p>
                            </div>

                            <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Shared by</span>
                                    <span className="text-xs font-bold text-slate-700">{getMentorName(res.mentorId)}</span>
                                </div>

                                <div className="flex gap-2">
                                    {user?.id === res.mentorId && (
                                        <button
                                            onClick={() => handleDelete(res.id)}
                                            className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                                        >
                                            🗑️
                                        </button>
                                    )}
                                    <a
                                        href={res.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-5 py-2.5 bg-slate-900 text-white text-[10px] font-black rounded-xl hover:bg-indigo-600 transition-all uppercase tracking-widest shadow-lg shadow-slate-900/5 active:scale-95"
                                    >
                                        View Content
                                    </a>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ResourceHub;
