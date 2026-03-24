import React, { useState, useEffect } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { User } from '../types';

interface LoginProps {
  onLogin: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  onGoogleLogin: (credential: string, role: 'mentee' | 'mentor') => Promise<{ success: boolean; message?: string }>;
  onToggleRegister: () => void;
  registrationSuccess?: boolean;
  registeredEmail?: string;
  registeredRole?: 'mentee' | 'mentor';
}

const Login: React.FC<LoginProps> = ({ onLogin, onGoogleLogin, onToggleRegister, registrationSuccess, registeredEmail, registeredRole }) => {
  const [role, setRole] = useState<'mentee' | 'mentor' | null>(registeredRole || null);
  const [email, setEmail] = useState(registeredEmail || '');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (registeredEmail) {
      setEmail(registeredEmail);
    }
    if (registeredRole) {
      setRole(registeredRole);
    }
  }, [registeredEmail, registeredRole]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // We intentionally don't pass role to onLogin (API detects it), 
    // but we could use it to validate if strict role enforcement was needed client-side BEFORE call.
    // For now, let's just log them in.

    try {
      const result = await onLogin(email, password);
      // If success, App.tsx will change state and unmount us.
      // But if there's a logic error (e.g. wrong role detected vs selected), we could handle it here if API returned user role.
      // Since onLogin returns success/message, we assume if success=true, we are good.

      if (!result.success) {
        setError(result.message || 'Invalid credentials');
        setIsLoading(false);
      }
    } catch (err) {
      setError('An unexpected error occurred');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Left side - Visual/Marketing */}
      <div className="hidden lg:flex lg:w-1/2 text-white p-12 flex-col justify-between relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0f0c29 0%, #1a1a4e 30%, #24243e 60%, #0d1b4b 100%)' }}>

        {/* Glow Orbs */}
        <div className="absolute top-[-80px] left-[-80px] w-[400px] h-[400px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.35) 0%, transparent 70%)', filter: 'blur(40px)' }}></div>
        <div className="absolute bottom-[-60px] right-[-60px] w-[350px] h-[350px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.3) 0%, transparent 70%)', filter: 'blur(40px)' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 70%)', filter: 'blur(60px)' }}></div>

        {/* Subtle grid overlay */}
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

        {/* Top: Logo & Tagline */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-2xl shadow-lg"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>🧩</div>
            <div>
              <h1 className="text-2xl font-black tracking-tight leading-none">MentorLink</h1>
              <span className="text-xs font-bold tracking-[0.2em] uppercase" style={{ color: '#a5b4fc' }}>Pro Platform</span>
            </div>
          </div>

          <h2 className="text-4xl font-black leading-tight mb-4" style={{ lineHeight: '1.15' }}>
            Grow Faster With<br />
            <span style={{ background: 'linear-gradient(90deg, #818cf8, #c084fc, #60a5fa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              World-Class Mentors
            </span>
          </h2>
          <p className="text-sm leading-relaxed max-w-xs" style={{ color: '#94a3b8' }}>
            AI-powered matching connects you with the perfect mentor for your goals. Accelerate your career today.
          </p>
        </div>

        {/* Stats Bar */}
        <div className="relative z-10 grid grid-cols-3 gap-3 my-2">
          {[
            { value: '12K+', label: 'Mentors', icon: '👩‍🏫' },
            { value: '98%', label: 'Satisfaction', icon: '⭐' },
            { value: '150+', label: 'Countries', icon: '🌍' },
          ].map((stat) => (
            <div key={stat.label}
              className="rounded-2xl p-4 text-center border"
              style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(12px)' }}>
              <div className="text-xl mb-1">{stat.icon}</div>
              <div className="text-xl font-black">{stat.value}</div>
              <div className="text-xs font-medium" style={{ color: '#94a3b8' }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Feature List */}
        <div className="relative z-10 space-y-3 my-2">
          {[
            { icon: '🤖', title: 'AI-Powered Matching', desc: 'Smart pairing based on goals & expertise' },
            { icon: '📅', title: 'Flexible Scheduling', desc: 'Book sessions across any timezone' },
            { icon: '🚀', title: 'Proven Results', desc: '3x faster career growth on average' },
          ].map((f) => (
            <div key={f.title} className="flex items-center gap-4 rounded-2xl p-3"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.3), rgba(139,92,246,0.3))' }}>
                {f.icon}
              </div>
              <div>
                <p className="text-sm font-bold leading-tight">{f.title}</p>
                <p className="text-xs" style={{ color: '#64748b' }}>{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Testimonial */}
        <div className="relative z-10">
          <div className="rounded-2xl p-5 border"
            style={{ background: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(16px)' }}>
            <div className="flex gap-1 mb-3">
              {[...Array(5)].map((_, i) => <span key={i} className="text-yellow-400 text-sm">★</span>)}
            </div>
            <p className="text-sm leading-relaxed mb-4 font-medium" style={{ color: '#cbd5e1' }}>
              "MentorLink completely transformed my career path. The AI matching found me the perfect mentor within hours!"
            </p>
            <div className="flex items-center gap-3">
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0 rounded-full border-2" style={{ borderColor: 'rgba(99,102,241,0.6)' }}>
                <rect width="40" height="40" rx="20" fill="rgba(99,102,241,0.2)" />
                <circle cx="20" cy="15" r="7" fill="#a5b4fc" />
                <path d="M6 36c0-7.732 6.268-14 14-14s14 6.268 14 14" fill="#a5b4fc" />
              </svg>
              <div>
                <p className="text-sm font-bold">Sarah Jenkins</p>
                <p className="text-xs" style={{ color: '#64748b' }}>VP Engineering · Velocity Inc.</p>
              </div>
              <div className="ml-auto px-3 py-1 rounded-full text-xs font-bold"
                style={{ background: 'rgba(99,102,241,0.2)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.3)' }}>
                Verified ✓
              </div>
            </div>
          </div>
          <p className="mt-5 text-xs text-center font-medium" style={{ color: '#334155' }}>
            © 2025 MentorLink Pro · Trusted by 50,000+ professionals worldwide
          </p>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gradient-to-tr from-slate-50 to-white relative overflow-hidden">
        {/* Subtle Decorative elements for the light side */}
        <div className="absolute top-20 right-20 w-64 h-64 bg-blue-100/50 rounded-full blur-3xl -z-10"></div>
        <div className="absolute bottom-20 left-20 w-48 h-48 bg-indigo-50/50 rounded-full blur-3xl -z-10"></div>

        <div className="max-w-md w-full bg-white/40 backdrop-blur-sm p-4 rounded-3xl transition-all duration-500">
          <div className="mb-8 text-center lg:text-left px-4">
            {/* Role Toggle Header */}
            {!role ? (
              <>
                <h2 className="text-4xl font-black text-slate-900 mb-3 tracking-tight">Welcome</h2>
                <p className="text-slate-500 font-medium">Select your role to continue</p>
              </>
            ) : (
              <>
                <h2 className="text-4xl font-black text-slate-900 mb-3 tracking-tight">
                  {role === 'mentor' ? 'Mentor Login' : role === 'admin' ? 'Admin Login' : 'Mentee Login'}
                </h2>
                <p className="text-slate-500 font-medium">Sign in to your dashboard</p>
              </>
            )}
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100">

            {/* Role Selection Tabs (Integrated) */}
            <div className="flex p-1 bg-slate-100 rounded-2xl mb-8 relative">
              <button
                onClick={() => setRole('mentee')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all relative z-10 ${role === 'mentee' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <span>👨‍🎓</span> Mentee
              </button>
              <button
                onClick={() => setRole('mentor')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all relative z-10 ${role === 'mentor' ? 'bg-white text-purple-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <span>👩‍🏫</span> Mentor
              </button>
              <button
                onClick={() => setRole('admin')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all relative z-10 ${role === 'admin' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <span>🛡️</span> Admin
              </button>
            </div>

            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">

              {registrationSuccess && !error && (
                <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
                  <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-xl shadow-sm">✅</div>
                  <div>
                    <p className="text-sm font-bold">Account Ready!</p>
                    <p className="text-xs opacity-80">Login with your new credentials.</p>
                  </div>
                </div>
              )}

              {error && (
                <div className="mb-6 p-4 bg-rose-50 border border-rose-100 text-rose-700 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
                  <div className="w-10 h-10 bg-rose-100 rounded-full flex items-center justify-center text-xl shadow-sm">⚠️</div>
                  <div>
                    <p className="text-sm font-bold">Access Denied</p>
                    <p className="text-xs opacity-80">{error}</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium"
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-2 ml-1">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Password</label>
                    <a href="#" className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors">Forgot?</a>
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !role}
                  className={`w-full text-white font-bold py-4 px-4 rounded-2xl shadow-xl transition-all active:scale-[0.98] disabled:opacity-70 flex justify-center items-center gap-3 text-lg ${
                    role === 'mentor' ? 'bg-purple-600 hover:bg-purple-700 shadow-purple-500/30' : 
                    role === 'admin' ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-500/30' :
                    'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/30'
                  }`}
                >
                  {isLoading ? (
                    <>
                      <span className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></span>
                      Authenticating...
                    </>
                  ) : (
                    !role ? 'Select Role' : 'Sign In Now'
                  )}
                </button>

                <div className="relative my-10">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-100"></div>
                  </div>
                  <div className="relative flex justify-center text-[10px] uppercase font-black tracking-[0.2em]">
                    <span className="bg-white px-6 text-slate-400">Social Login</span>
                  </div>
                </div>

                <div className="flex justify-center">
                  <div className="flex items-center justify-center relative">
                    {/* Cover the button if no role is selected */}
                    {!role && (
                      <div
                        className="absolute inset-0 z-10 cursor-not-allowed"
                        title="Please select a role first"
                        onClick={() => setError("Please select Mentee or Mentor before signing in with Google.")}
                      ></div>
                    )}
                    <div className={!role ? "opacity-50 pointer-events-none" : ""}>
                      <GoogleLogin
                        onSuccess={async credentialResponse => {
                          console.log("Google Login SUCCESS (Raw Response):", credentialResponse);
                          if (credentialResponse.credential && role) {
                            setIsLoading(true);
                            setError('');
                            console.log("Attempting backend Google login with role:", role);
                            try {
                              const res = await onGoogleLogin(credentialResponse.credential, role);
                              if (res && !res.success) {
                                console.error("Backend Google Login Logic Failed:", res.message);
                                setError(res.message || 'Google Login Failed');
                                setIsLoading(false);
                              }
                            } catch (error) {
                              console.error("Backend Google Login Exception:", error);
                              setError('An error occurred during Google Sign-In');
                              setIsLoading(false);
                            }
                          } else {
                            console.warn("Google Login Success but missing credential or role", { hasCredential: !!credentialResponse.credential, role });
                          }
                        }}
                        onError={() => {
                          console.error("Google Login Component Error Callback Triggered - Check console for library errors");
                          setError('Google Login Failed');
                        }}
                      />
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>

          <p className="mt-8 text-center text-sm font-medium text-slate-500">
            Don't have an account? <button onClick={onToggleRegister} className="font-bold text-blue-600 hover:text-blue-800 transition-colors underline decoration-2 underline-offset-4">Create your profile</button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
