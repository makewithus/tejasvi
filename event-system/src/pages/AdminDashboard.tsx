import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDashboardStats, getAllRegistrations } from '../services/firestore';
import EventManager from '../components/EventManager';
import {
    Loader2, Download, Search, ScanLine, Users,
    Zap, Database, Settings2, ShieldCheck,
    Lock, ShieldAlert, Filter, ArrowUpRight, Clock
} from 'lucide-react';

const StatsCard = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: number }) => (
    <div className="premium-card relative overflow-hidden group hover:border-zinc-500">
        <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity text-premium-white">
            {icon}
        </div>
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-2">{label}</h3>
        <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-premium-white tracking-tighter">{value}</span>
        </div>
    </div>
);

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({ total: 0, used: 0, unused: 0, expired: 0, verified: 0, pending: 0, flagged: 0 });
    const [registrations, setRegistrations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'overview' | 'records' | 'engine'>('overview');

    // Table States
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const statsData = await getDashboardStats();
            // Map legacy stats to new labels if needed
            setStats({
                ...statsData,
                verified: statsData.used || 0,
                pending: statsData.unused || 0,
                flagged: statsData.expired || 0
            } as any);

            const regsData = await getAllRegistrations();
            setRegistrations(regsData);
        } catch (err) {
            console.error("Dashboard Load Error:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleExportCSV = () => {
        const headers = ["Name", "Email", "Phone", "Branch", "Status", "Registration ID"];
        const rows = filteredRegistrations.map(r => [
            r.fullName,
            r.email,
            r.phone,
            r.branch,
            r.qrStatus,
            r.registrationId
        ]);

        const csvContent = "data:text/csv;charset=utf-8,"
            + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "registrations.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const filteredRegistrations = registrations.filter(reg => {
        const matchesSearch =
            (reg.fullName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            (reg.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            (reg.registrationId || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            (reg.branch || "").toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'all' || reg.qrStatus === statusFilter;

        return matchesSearch && matchesStatus;
    });

    if (loading) return (
        <div className="min-h-screen bg-premium-black flex items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-premium-red" />
        </div>
    );

    return (
        <div className="min-h-screen bg-premium-black pb-12">
            {/* Header */}
            <header className="bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800 px-8 py-4 sticky top-0 z-20">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="h-10 w-10 bg-premium-red rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(255,49,49,0.3)]">
                            <Users className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-black uppercase tracking-tighter text-premium-white leading-none">Ticket Portal</h1>
                            <p className="text-[10px] text-premium-gray font-bold uppercase tracking-[0.3em] mt-1">Administrator Access</p>
                        </div>
                    </div>

                    <button
                        onClick={() => navigate('/admin/scanner')}
                        className="premium-button-primary !py-2 !px-4 hidden md:flex hover:scale-105 active:scale-95"
                    >
                        <ScanLine className="h-5 w-5" />
                        Access Scanner
                    </button>
                </div>
            </header>

            <main className="p-8 max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700">
                {/* Navigation Tabs */}
                <div className="flex flex-wrap gap-2 p-1 bg-zinc-900/50 rounded-xl border border-zinc-800 backdrop-blur-md w-fit">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all duration-300 ${activeTab === 'overview' ? 'bg-premium-white text-premium-black shadow-lg shadow-white/10' : 'text-zinc-500 hover:text-white hover:bg-zinc-800'}`}
                    >
                        <Zap className="h-3.5 w-3.5" />
                        Live Overview
                    </button>
                    <button
                        onClick={() => setActiveTab('records')}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all duration-300 ${activeTab === 'records' ? 'bg-premium-white text-premium-black shadow-lg shadow-white/10' : 'text-zinc-500 hover:text-white hover:bg-zinc-800'}`}
                    >
                        <Database className="h-3.5 w-3.5" />
                        Registrations
                    </button>
                    <button
                        onClick={() => setActiveTab('engine')}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all duration-300 ${activeTab === 'engine' ? 'bg-premium-white text-premium-black shadow-lg shadow-white/10' : 'text-zinc-500 hover:text-white hover:bg-zinc-800'}`}
                    >
                        <Settings2 className="h-3.5 w-3.5" />
                        Ticket Manager
                    </button>
                </div>

                {/* OVERVIEW CONTENT */}
                {activeTab === 'overview' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <section className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                            <StatsCard icon={<Users size={60} />} label="Total Registered" value={stats.total} />
                            <StatsCard icon={<ShieldCheck size={60} />} label="Verified Access" value={stats.verified} />
                            <StatsCard icon={<Lock size={60} />} label="Pending Review" value={stats.pending} />
                            <StatsCard icon={<ShieldAlert size={60} />} label="Restricted" value={stats.flagged} />
                        </section>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="premium-card bg-zinc-950/40 border-zinc-900">
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-premium-gray">Recent Registrations</h3>
                                    <button onClick={() => setActiveTab('records')} className="text-premium-red text-[10px] font-black uppercase tracking-widest flex items-center gap-1 hover:gap-2 transition-all">
                                        View All <ArrowUpRight className="h-3 w-3" />
                                    </button>
                                </div>
                                <div className="space-y-4">
                                    {registrations.slice(0, 4).map((reg) => (
                                        <div key={reg.id} className="flex justify-between items-center p-3 rounded-xl bg-black/40 border border-zinc-900/50">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-full bg-zinc-900 flex items-center justify-center text-[10px] font-black text-zinc-500">
                                                    {reg.fullName?.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black text-white uppercase tracking-tight">{reg.fullName}</p>
                                                    <p className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest">{reg.event || 'Admission'}</p>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end">
                                                <div className="text-[8px] font-black text-premium-red uppercase tracking-widest">{reg.qrStatus === 'used' ? 'Verified' : 'Pending'}</div>
                                                <div className="text-[8px] text-zinc-700 font-bold uppercase tracking-tighter flex items-center gap-1">
                                                    <Clock size={8} /> {reg.createdAt?.seconds ? new Date(reg.createdAt.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {registrations.length === 0 && (
                                        <div className="py-12 text-center text-zinc-800 italic text-[10px] uppercase tracking-widest font-bold">No recent activities available</div>
                                    )}
                                </div>
                            </div>

                            <div className="premium-card bg-zinc-950/40 border-zinc-900 flex flex-col justify-center items-center py-12">
                                <div className="h-32 w-32 rounded-full border-4 border-zinc-900 border-t-premium-red flex items-center justify-center relative mb-8">
                                    <div className="text-center">
                                        <p className="text-3xl font-black text-white">{stats.total > 0 ? Math.round((stats.verified / stats.total) * 100) : 0}%</p>
                                        <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Turnout</p>
                                    </div>
                                </div>
                                <div className="text-center space-y-2">
                                    <h4 className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Scanner Efficiency Status</h4>
                                    <p className="text-[8px] font-bold text-zinc-600 uppercase tracking-[0.2em] max-w-[200px]">Live data stream active. Node verification speeds currently optimal.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* REGISTRATIONS TABLE CONTENT */}
                {activeTab === 'records' && (
                    <div className="premium-card !p-0 overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="p-6 bg-zinc-950/80 border-b border-zinc-800 flex flex-col lg:flex-row gap-6 justify-between items-center">
                            <div className="flex-1 relative group w-full lg:max-w-md">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600 transition-colors group-focus-within:text-premium-red" />
                                <input
                                    type="text"
                                    placeholder="SEARCH BY NAME, ID OR BRANCH..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="premium-input w-full !pl-12 !py-4 uppercase tracking-widest text-xs font-bold bg-zinc-950/40"
                                />
                            </div>

                            <div className="flex gap-4 w-full lg:w-auto">
                                <div className="relative flex-1 lg:w-48">
                                    <Filter className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                                    <select
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                        className="premium-input !pl-10 !py-3 bg-black appearance-none cursor-pointer text-xs font-bold uppercase tracking-widest"
                                    >
                                        <option value="all">Status: All</option>
                                        <option value="unused">Unused</option>
                                        <option value="used">Used</option>
                                        <option value="expired">Expired</option>
                                    </select>
                                </div>
                                <button
                                    onClick={handleExportCSV}
                                    className="premium-button text-xs font-black uppercase tracking-widest tracking-[0.2em] flex items-center gap-2 !px-6 !py-3 bg-premium-white text-premium-black hover:bg-zinc-200 transition-all active:scale-95"
                                >
                                    <Download className="h-4 w-4" />
                                    Export CSV
                                </button>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-zinc-900/30">
                                    <tr>
                                        <th className="px-8 py-6 text-[10px] font-black text-zinc-500 uppercase tracking-widest border-b border-zinc-900">Member Info</th>
                                        <th className="px-8 py-6 text-[10px] font-black text-zinc-500 uppercase tracking-widest border-b border-zinc-900">Dept / Branch</th>
                                        <th className="px-8 py-6 text-[10px] font-black text-zinc-500 uppercase tracking-widest border-b border-zinc-900">Ticket ID</th>
                                        <th className="px-8 py-6 text-[10px] font-black text-zinc-500 uppercase tracking-widest border-b border-zinc-900">Access Status</th>
                                        <th className="px-8 py-6 text-[10px] font-black text-zinc-500 uppercase tracking-widest border-b border-zinc-900">Timestamp</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-900">
                                    {filteredRegistrations.map((reg) => (
                                        <tr key={reg.id} className="hover:bg-zinc-900/40 transition-colors group">
                                            <td className="px-8 py-6">
                                                <div className="font-black text-premium-white text-base tracking-tight uppercase">{reg.fullName}</div>
                                                <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-0.5">{reg.email}</div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className="text-zinc-400 text-xs font-black uppercase tracking-widest border border-zinc-800 px-3 py-1 rounded-md">{reg.branch || 'GENERAL'}</span>
                                            </td>
                                            <td className="px-8 py-6 font-mono text-xs text-zinc-500 group-hover:text-premium-red transition-colors tracking-tighter">
                                                {reg.registrationId}
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className={`inline-flex items-center px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border
                                                    ${reg.qrStatus === 'unused' ? 'bg-zinc-900 border-zinc-700 text-zinc-500' :
                                                        reg.qrStatus === 'used' ? 'bg-premium-red/10 border-premium-red/30 text-premium-red shadow-[0_0_15px_rgba(255,49,49,0.15)]' :
                                                            'bg-zinc-800 border-zinc-700 text-zinc-700'}`}>
                                                    {reg.qrStatus === 'used' ? 'VERIFIED' : reg.qrStatus.toUpperCase()}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-zinc-600 text-[10px] font-bold tracking-widest">
                                                {reg.createdAt?.seconds ? new Date(reg.createdAt.seconds * 1000).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredRegistrations.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="px-8 py-24 text-center">
                                                <Database className="h-10 w-10 text-zinc-900 mx-auto mb-4" />
                                                <p className="text-zinc-700 font-black uppercase tracking-[0.4em] text-[10px]">No Registration Records Found</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* TICKET MANAGER CONTENT */}
                {activeTab === 'engine' && (
                    <div className="max-w-3xl mx-auto px-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <EventManager />
                    </div>
                )}
            </main>
        </div>
    );
};

export default AdminDashboard;
