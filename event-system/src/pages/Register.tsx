import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase/config';
import { getActiveEvents, saveRegistration } from '../services/firestore';
import type { EventItem, RegistrationData } from '../services/firestore';
import { sendConfirmationEmail } from '../services/email';
import { Loader2, CheckCircle, AlertCircle, ArrowRight, User, Phone, Mail, GraduationCap, Info } from 'lucide-react';

const Register = () => {
    const navigate = useNavigate();
    const [events, setEvents] = useState<EventItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [fetchingOptions, setFetchingOptions] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [emailStatus, setEmailStatus] = useState<'sent' | 'failed' | null>(null);

    const [formData, setFormData] = useState<RegistrationData>({
        fullName: '',
        email: '',
        phone: '',
        whatsapp: '',
        branch: '',
        event: '',
        workingPlace: '',
        foodPreference: 'Veg',
        accompanyingPersons: 0,
        interestedInTalk: false,
        internshipOpportunity: false,
        suggestions: ''
    });

    useEffect(() => {
        const loadOptions = async () => {
            try {
                const eventData = await getActiveEvents();
                // Sort frontend to match EventManager
                const sortedData = [...eventData].sort((a, b) => a.name.localeCompare(b.name));
                setEvents(sortedData);
            } catch (err: any) {
                console.error("Failed to load options", err);
                setError(`Failed to load registration options: ${err.message || "Please check your connection."}`);
            } finally {
                setFetchingOptions(false);
            }
        };
        loadOptions();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            if (formData.phone.length < 6) {
                throw new Error("Phone number must be at least 6 digits (used for password).");
            }

            const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.phone);
            const user = userCredential.user;

            const { registrationId } = await saveRegistration(user.uid, formData);

            try {
                const accessLink = `${window.location.origin}/login`; // Or direct link if already logged in
                const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${registrationId}`;

                await sendConfirmationEmail({
                    to_name: formData.fullName,
                    to_email: formData.email,
                    event_name: formData.event || "Event Admission",
                    registration_id: registrationId,
                    login_email: formData.email,
                    login_password: formData.phone,
                    qr_code_url: qrImageUrl,
                    access_link: accessLink,
                });
                setEmailStatus('sent');
            } catch (emailErr) {
                console.error("Email confirmation failed but registration was successful:", emailErr);
                setEmailStatus('failed');
            }

            setSuccess(true);
        } catch (err: any) {
            console.error("Registration Error:", err);
            if (err.code === 'auth/email-already-in-use') {
                setError("This email is already registered. Please login.");
            } else {
                setError(err.message || "Registration failed. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-premium-black flex items-center justify-center p-4">
                <div className="max-w-md w-full premium-card text-center border-premium-red/30">
                    <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-premium-red/10 mb-8 border border-premium-red/20 shadow-[0_0_30px_rgba(255,49,49,0.15)]">
                        <CheckCircle className="h-10 w-10 text-premium-red" />
                    </div>
                    <h2 className="text-3xl font-bold text-premium-white mb-4">You're In!</h2>
                    <p className="text-premium-gray mb-8">
                        Welcome, <span className="text-premium-white font-medium">{formData.fullName}</span>. Registration complete.
                    </p>
                    <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 mb-8 text-left space-y-3">
                        <div className="flex justify-between items-center py-2 border-b border-zinc-800">
                            <span className="text-zinc-500 text-sm">UID/Email</span>
                            <span className="text-premium-white font-mono text-sm">{formData.email}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-zinc-800">
                            <span className="text-zinc-500 text-sm">Access Key</span>
                            <span className="text-premium-white font-mono text-sm">{formData.phone}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 text-[10px] font-bold uppercase tracking-widest">
                            <span className="text-zinc-500">Email Status</span>
                            {emailStatus === 'sent' ? (
                                <span className="text-green-500">Dispatch Successful</span>
                            ) : emailStatus === 'failed' ? (
                                <span className="text-premium-red">Dispatch Pending (Check Junk)</span>
                            ) : (
                                <span className="text-zinc-600">Processing...</span>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={() => navigate('/login')}
                        className="premium-button-primary w-full group"
                    >
                        Go to Dashboard
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-premium-black">
            {/* Header Navbar */}
            <nav className="bg-zinc-950/80 backdrop-blur-md border-b border-zinc-900 px-8 py-4 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 bg-premium-red rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(255,49,49,0.2)]">
                            <span className="text-white font-black text-xs">T</span>
                        </div>
                        <h1 className="text-lg font-black uppercase tracking-tighter text-premium-white">Ticket Lelo</h1>
                    </div>

                    <button
                        onClick={() => navigate('/login')}
                        className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 hover:text-premium-white transition-colors border border-zinc-800 px-6 py-2.5 rounded-xl hover:bg-zinc-900"
                    >
                        Access Portal
                    </button>
                </div>
            </nav>

            <div className="py-16 px-4">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-12">
                        <span className="inline-block px-3 py-1 rounded-full bg-premium-red/10 border border-premium-red/20 text-premium-red text-xs font-bold uppercase tracking-widest mb-4">
                            Registration Open
                        </span>
                        <h1 className="text-5xl md:text-6xl font-black text-premium-white mb-4">
                            JOIN THE <span className="text-premium-red">ELITE.</span>
                        </h1>
                        <p className="text-premium-gray text-lg max-w-xl mx-auto uppercase tracking-tighter">
                            Secure your digital pass for the upcoming event session.
                        </p>
                    </div>

                    <div className="premium-card bg-zinc-950/50 backdrop-blur-sm border-zinc-800/50">
                        <form onSubmit={handleSubmit} className="space-y-10">
                            {error && (
                                <div className="bg-premium-red/10 border border-premium-red/30 text-premium-red px-6 py-4 rounded-xl flex items-center gap-4 animate-in fade-in slide-in-from-top-4">
                                    <AlertCircle className="h-5 w-5 shrink-0" />
                                    <span className="font-semibold">{error}</span>
                                </div>
                            )}

                            {/* SECTION 1: PERSONAL */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="h-8 w-1 bg-premium-red rounded-full"></div>
                                    <h3 className="text-xl font-bold uppercase tracking-tight text-premium-white flex items-center gap-2">
                                        <User className="h-5 w-5 text-premium-gray" />
                                        Identity
                                    </h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-1.5">
                                        <label className="premium-label">Full Name</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                name="fullName"
                                                required
                                                value={formData.fullName}
                                                onChange={handleChange}
                                                className="premium-input pl-11"
                                                placeholder="Enter your name"
                                            />
                                            <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-600" />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="premium-label">Email Address</label>
                                        <div className="relative">
                                            <input
                                                type="email"
                                                name="email"
                                                required
                                                value={formData.email}
                                                onChange={handleChange}
                                                className="premium-input pl-11"
                                                placeholder="name@company.com"
                                            />
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-600" />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="premium-label">Mobile Number</label>
                                        <div className="relative">
                                            <input
                                                type="tel"
                                                name="phone"
                                                required
                                                value={formData.phone}
                                                onChange={handleChange}
                                                className="premium-input pl-11"
                                                placeholder="+91"
                                            />
                                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-600" />
                                        </div>
                                        <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold mt-1 ml-1">Will be used for secured access</p>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="premium-label">WhatsApp (Stay Updated)</label>
                                        <div className="relative">
                                            <input
                                                type="tel"
                                                name="whatsapp"
                                                required
                                                value={formData.whatsapp}
                                                onChange={handleChange}
                                                className="premium-input pl-11"
                                                placeholder="+91"
                                            />
                                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-600" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* SECTION 2: EVENT DETAILS */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="h-8 w-1 bg-premium-red rounded-full"></div>
                                    <h3 className="text-xl font-bold uppercase tracking-tight text-premium-white flex items-center gap-2">
                                        <GraduationCap className="h-5 w-5 text-premium-gray" />
                                        Admission Details
                                    </h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-1.5">
                                        <label className="premium-label">Select Ticket Type</label>
                                        {fetchingOptions ? (
                                            <div className="premium-input animate-pulse bg-zinc-900 h-12"></div>
                                        ) : (
                                            <select
                                                name="event"
                                                required
                                                value={formData.event}
                                                onChange={handleChange}
                                                className="premium-input appearance-none bg-zinc-900"
                                            >
                                                <option value="">Choose your ticket</option>
                                                {events.map(event => (
                                                    <option key={event.id} value={event.name} className="bg-premium-black">
                                                        {event.name}
                                                    </option>
                                                ))}
                                            </select>
                                        )}
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="premium-label">Branch / Department</label>
                                        <input
                                            type="text"
                                            name="branch"
                                            value={formData.branch}
                                            onChange={handleChange}
                                            className="premium-input"
                                            placeholder="e.g. Engineering"
                                        />
                                    </div>

                                    <div className="col-span-1 md:col-span-2 space-y-1.5">
                                        <label className="premium-label">Current Institute / Workplace</label>
                                        <input
                                            type="text"
                                            name="workingPlace"
                                            value={formData.workingPlace}
                                            onChange={handleChange}
                                            className="premium-input"
                                            placeholder="Where are you currently at?"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* SECTION 3: OPTIONS */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="h-8 w-1 bg-premium-red rounded-full"></div>
                                    <h3 className="text-xl font-bold uppercase tracking-tight text-premium-white flex items-center gap-2">
                                        <Info className="h-5 w-5 text-premium-gray" />
                                        Additional Preferences
                                    </h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <label className="premium-label">Dining Preference</label>
                                        <div className="flex gap-4">
                                            {['Veg', 'Non-Veg'].map((pref) => (
                                                <label key={pref} className={`flex-1 flex items-center justify-center py-3 rounded-xl border cursor-pointer transition-all duration-300 ${formData.foodPreference === pref ? 'bg-premium-red border-premium-red text-white font-bold shadow-[0_0_20px_rgba(255,49,49,0.3)]' : 'bg-zinc-900/50 border-zinc-800 text-premium-gray hover:border-premium-gray'}`}>
                                                    <input
                                                        type="radio"
                                                        name="foodPreference"
                                                        value={pref}
                                                        checked={formData.foodPreference === pref}
                                                        onChange={handleChange}
                                                        className="sr-only"
                                                    />
                                                    {pref}
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="premium-label">Accompanying Persons</label>
                                        <input
                                            type="number"
                                            name="accompanyingPersons"
                                            min="0"
                                            value={formData.accompanyingPersons}
                                            onChange={handleChange}
                                            className="premium-input"
                                        />
                                    </div>

                                    <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <label className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all duration-300 ${formData.interestedInTalk ? 'bg-premium-white/5 border-premium-white/20' : 'bg-zinc-950/30 border-zinc-900 hover:border-zinc-800'}`}>
                                            <div className={`h-6 w-6 rounded-md border-2 flex items-center justify-center transition-all ${formData.interestedInTalk ? 'bg-premium-red border-premium-red' : 'border-zinc-700'}`}>
                                                {formData.interestedInTalk && <ArrowRight className="h-4 w-4 text-white" />}
                                            </div>
                                            <input
                                                type="checkbox"
                                                className="sr-only"
                                                checked={formData.interestedInTalk}
                                                onChange={(e) => setFormData(p => ({ ...p, interestedInTalk: e.target.checked }))}
                                            />
                                            <span className="text-sm font-medium text-premium-gray group">Are you delivering a Talk?</span>
                                        </label>

                                        <label className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all duration-300 ${formData.internshipOpportunity ? 'bg-premium-white/5 border-premium-white/20' : 'bg-zinc-950/30 border-zinc-900 hover:border-zinc-800'}`}>
                                            <div className={`h-6 w-6 rounded-md border-2 flex items-center justify-center transition-all ${formData.internshipOpportunity ? 'bg-premium-red border-premium-red' : 'border-zinc-700'}`}>
                                                {formData.internshipOpportunity && <ArrowRight className="h-4 w-4 text-white" />}
                                            </div>
                                            <input
                                                type="checkbox"
                                                className="sr-only"
                                                checked={formData.internshipOpportunity}
                                                onChange={(e) => setFormData(p => ({ ...p, internshipOpportunity: e.target.checked }))}
                                            />
                                            <span className="text-sm font-medium text-premium-gray">Providing Internships?</span>
                                        </label>
                                    </div>

                                    <div className="col-span-1 md:col-span-2 space-y-1.5">
                                        <label className="premium-label">Notes / Intelligence</label>
                                        <textarea
                                            name="suggestions"
                                            value={formData.suggestions}
                                            onChange={handleChange}
                                            rows={4}
                                            className="premium-input py-4 resize-none"
                                            placeholder="Any special requirements..."
                                        ></textarea>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="premium-button-primary w-full py-5 text-xl relative overflow-hidden group disabled:opacity-50"
                                >
                                    <span className={`flex items-center justify-center gap-3 transition-all duration-300 ${loading ? 'opacity-0' : 'opacity-100 group-hover:gap-5'}`}>
                                        SECURE REGISTRATION
                                        <ArrowRight className="h-6 w-6" />
                                    </span>
                                    {loading && (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <Loader2 className="animate-spin h-8 w-8 text-premium-black" />
                                        </div>
                                    )}
                                </button>
                                <p className="text-center text-[10px] text-zinc-600 uppercase tracking-[0.2em] font-black mt-6">
                                    Powered by MWU
                                </p>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
