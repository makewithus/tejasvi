import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase/config';
import { Loader2, LogIn, AlertCircle, Mail, Lock, ArrowRight } from 'lucide-react';

const Login = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || "/dashboard";

    const [formData, setFormData] = useState({
        email: '',
        phone: '' // Acts as password
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            await signInWithEmailAndPassword(auth, formData.email, formData.phone);

            if (formData.email === 'admin@gmail.com') {
                navigate('/admin');
            } else {
                navigate(from, { replace: true });
            }
        } catch (err: any) {
            console.error("Login Error:", err);
            setError("Authentication failed. Invalid signal.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-premium-black flex items-center justify-center px-4 relative overflow-hidden">
            {/* Background Flair */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-premium-red/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-premium-red/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2"></div>

            <div className="max-w-md w-full premium-card relative z-10 border-zinc-900 bg-zinc-950/50 backdrop-blur-xl">
                <div className="text-center mb-10">
                    <div className="flex justify-center mb-6">
                        <div className="h-16 w-16 bg-premium-red/10 rounded-2xl flex items-center justify-center border border-premium-red/20 shadow-[0_0_30px_rgba(255,49,49,0.1)]">
                            <LogIn className="h-8 w-8 text-premium-red" />
                        </div>
                    </div>
                    <h2 className="text-3xl font-black text-premium-white uppercase tracking-tighter">Authorized Access</h2>
                    <p className="text-zinc-500 font-bold uppercase tracking-[0.2em] text-[10px] mt-2">Personal Security Portal</p>
                </div>

                {error && (
                    <div className="bg-premium-red/10 border border-premium-red/30 text-premium-red px-6 py-4 rounded-xl flex items-center gap-4 mb-8">
                        <AlertCircle className="h-5 w-5 shrink-0" />
                        <span className="font-bold text-sm tracking-tight">{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-1.5">
                        <label className="premium-label">Registered Signal (Email)</label>
                        <div className="relative">
                            <input
                                type="email"
                                required
                                value={formData.email}
                                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                className="premium-input !pl-11"
                                placeholder="name@domain.com"
                            />
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-600" />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="premium-label">Cipher (Phone Number)</label>
                        <div className="relative">
                            <input
                                type="password"
                                required
                                value={formData.phone}
                                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                                className="premium-input !pl-11"
                                placeholder="••••••••••"
                            />
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-600" />
                        </div>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="premium-button-primary w-full py-4 text-sm uppercase tracking-[0.3em] font-black group shadow-[0_0_20px_rgba(255,255,255,0.05)]"
                        >
                            <span className={`flex items-center justify-center gap-3 transition-all duration-300 ${loading ? 'opacity-0' : 'opacity-100 group-hover:gap-4'}`}>
                                INITIALIZE LOGIN
                                <ArrowRight className="h-4 w-4" />
                            </span>
                            {loading && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Loader2 className="animate-spin h-6 w-6" />
                                </div>
                            )}
                        </button>
                    </div>

                    <div className="text-center mt-8">
                        <p className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.3em]">
                            New User? <span onClick={() => navigate('/')} className="text-premium-gray hover:text-premium-white cursor-pointer transition-colors decoration-premium-red underline underline-offset-8">Request Access</span>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
