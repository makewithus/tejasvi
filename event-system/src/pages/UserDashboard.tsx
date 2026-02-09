import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getRegistrationByUserId } from '../services/firestore';
import { QRCodeSVG } from 'qrcode.react';
import { LogOut, User as UserIcon, Briefcase, GraduationCap, ShieldCheck, Signal } from 'lucide-react';
import { auth } from '../firebase/config';
import { useNavigate } from 'react-router-dom';

const Loader2 = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
);

const UserDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [registration, setRegistration] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRegistration = async () => {
            if (user) {
                try {
                    const reg = await getRegistrationByUserId(user.uid);
                    setRegistration(reg);
                } catch (error) {
                    console.error("Error fetching registration:", error);
                } finally {
                    setLoading(false);
                }
            }
        };
        fetchRegistration();
    }, [user]);

    const handleLogout = async () => {
        await auth.signOut();
        navigate('/login');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-premium-black flex flex-col items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-premium-red mb-4" />
                <p className="text-zinc-600 font-black uppercase tracking-[0.4em] text-[10px]">Syncing Identity</p>
            </div>
        );
    }

    if (!registration) {
        return (
            <div className="min-h-screen bg-premium-black flex flex-col items-center justify-center p-8 text-center text-white">
                <ShieldCheck className="h-20 w-20 text-premium-red mb-8 opacity-20" />
                <h2 className="text-4xl font-black uppercase tracking-tighter mb-4">Registration Denied</h2>
                <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs max-w-sm leading-relaxed mb-10">
                    No active registration node found for this account signal. Please verify your credentials.
                </p>
                <div className="flex gap-4">
                    <button onClick={() => navigate('/')} className="premium-button-primary">Register Now</button>
                    <button onClick={handleLogout} className="premium-button-secondary">Logout</button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-premium-black text-premium-white">
            <header className="px-8 py-6 border-b border-zinc-900 bg-zinc-950/50 backdrop-blur-md sticky top-0 z-20">
                <div className="max-w-6xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 bg-premium-red rounded-lg flex items-center justify-center shadow-[0_0_20px_rgba(255,49,49,0.2)]">
                            <Signal className="h-4 w-4 text-white" />
                        </div>
                        <h1 className="text-lg font-black uppercase tracking-tighter">Event Portal</h1>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="premium-button-secondary !py-2 !px-4 text-xs group"
                    >
                        <LogOut className="h-4 w-4 group-hover:text-premium-red transition-colors" />
                        Logout
                    </button>
                </div>
            </header>

            <main className="p-8 max-w-7xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                    {/* LEFT: PASS CARD */}
                    <div className="lg:col-span-12 xl:col-span-5 flex justify-center">
                        <div className="premium-card !p-0 bg-[#0a0a0a] text-white w-full max-w-sm relative overflow-hidden group border-zinc-900/50 shadow-[0_40px_80px_-20px_rgba(0,0,0,1)]">

                            {/* Card Top Branding */}
                            <div className="bg-[#f0f0f0] text-black px-8 py-10 flex flex-col items-center text-center">
                                <h1 className="text-4xl font-black uppercase tracking-tight leading-none mb-1">OFFICIAL PASS</h1>
                                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500">Verified Attendee 2026</p>
                            </div>

                            {/* QR Section */}
                            <div className="px-10 py-12 flex flex-col items-center">
                                <div className="bg-white p-6 rounded-[2.5rem] shadow-[0_0_50px_rgba(255,255,255,0.02)] mb-8 transition-all duration-500 hover:scale-[1.02] border border-white/10">
                                    <QRCodeSVG
                                        value={registration.qrCodeData}
                                        size={220}
                                        level="H"
                                        includeMargin={false}
                                    />
                                </div>
                                <div className="text-center space-y-5 w-full">
                                    <div className="bg-zinc-900/50 px-6 py-2.5 rounded-2xl border border-zinc-800">
                                        <p className="text-[10px] font-mono text-zinc-500 tracking-widest uppercase">{registration.registrationId}</p>
                                    </div>
                                    <div className={`w-full py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] border
                                        ${registration.qrStatus === 'unused' ? 'bg-zinc-900/50 border-zinc-800 text-zinc-500' :
                                            registration.qrStatus === 'used' ? 'bg-green-500/10 border-green-500/20 text-green-500' :
                                                'bg-zinc-800 border-zinc-700 text-zinc-600'}`}>
                                        {registration.qrStatus === 'unused' ? 'ACCESS PENDING' : registration.qrStatus === 'used' ? 'AUTHORIZED' : 'INVALID'}
                                    </div>
                                </div>
                            </div>

                            {/* Card Bottom Decor */}
                            <div className="bg-zinc-900/20 p-6 flex justify-between items-center border-t border-zinc-900/50">
                                <div className="flex gap-1.5">
                                    {[1, 2, 3].map(i => <div key={i} className="h-1 w-5 bg-zinc-800 rounded-full"></div>)}
                                </div>
                                <div className="h-2 w-2 rounded-full bg-zinc-800"></div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT: DETAILS */}
                    <div className="lg:col-span-12 xl:col-span-7 space-y-10">
                        <section className="space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="h-2 w-2 bg-premium-red rotate-45"></div>
                                <h2 className="text-4xl font-black uppercase tracking-tighter italic text-white underline decoration-zinc-800 underline-offset-[12px] decoration-4">
                                    {registration.event || 'PREMIUM EVENT'}
                                </h2>
                            </div>
                        </section>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                            <div className="premium-card bg-zinc-950/20 border-zinc-900/50 group hover:border-zinc-800 transition-colors">
                                <label className="text-zinc-600 font-black uppercase tracking-[0.2em] text-[8px] block mb-4">Attendee Name</label>
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 bg-zinc-900 rounded-2xl flex items-center justify-center border border-zinc-800 group-hover:border-zinc-700">
                                        <UserIcon className="h-4 w-4 text-zinc-500" />
                                    </div>
                                    <span className="text-xl font-black tracking-tight text-white uppercase">{registration.fullName}</span>
                                </div>
                            </div>

                            <div className="premium-card bg-zinc-950/20 border-zinc-900/50 group hover:border-zinc-800 transition-colors">
                                <label className="text-zinc-600 font-black uppercase tracking-[0.2em] text-[8px] block mb-4">Academic Node</label>
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 bg-zinc-900 rounded-2xl flex items-center justify-center border border-zinc-800 group-hover:border-zinc-700">
                                        <GraduationCap className="h-4 w-4 text-zinc-500" />
                                    </div>
                                    <span className="text-xl font-black tracking-tight text-white uppercase">{registration.branch || 'GENERAL'}</span>
                                </div>
                            </div>

                            <div className="premium-card bg-zinc-950/20 border-zinc-900/50 group hover:border-zinc-800 transition-colors md:col-span-2">
                                <label className="text-zinc-600 font-black uppercase tracking-[0.2em] text-[8px] block mb-4">Professional Signature</label>
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 bg-zinc-900 rounded-2xl flex items-center justify-center border border-zinc-800 group-hover:border-zinc-700">
                                        <Briefcase className="h-4 w-4 text-zinc-500" />
                                    </div>
                                    <span className="text-xl font-black tracking-tight text-white uppercase">{registration.workingPlace || 'INDEPENDENT'}</span>
                                </div>
                            </div>
                        </div>

                        <div className="p-8 border-l-2 border-premium-red rounded-r-3xl bg-zinc-950/40 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-2 opacity-10">
                                <ShieldCheck className="h-20 w-20" />
                            </div>
                            <h4 className="text-[9px] font-black uppercase tracking-[0.4em] text-premium-red mb-6">Security Protocol</h4>
                            <p className="text-zinc-500 text-sm leading-relaxed tracking-wide">
                                This pass is biologically indexed to your account signal. Any unauthorized attempt to clone this QR signature will result in immediate voiding of registration. Show this screen at the security checkpoint.
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default UserDashboard;
