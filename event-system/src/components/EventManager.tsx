import React, { useState, useEffect } from 'react';
import { getAllEvents, addEvent, toggleEventStatus, deleteEvent } from '../services/firestore';
import type { EventItem } from '../services/firestore';
import { Loader2, Trash2, Plus, PowerOff, Power, Calendar } from 'lucide-react';

const EventManager = () => {
    const [events, setEvents] = useState<EventItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [name, setName] = useState('');
    const [adding, setAdding] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadEvents();
    }, []);

    const loadEvents = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getAllEvents();
            // Sort alphabetically on frontend to avoid index requirement
            const sortedData = [...data].sort((a, b) => a.name.localeCompare(b.name));
            setEvents(sortedData);
        } catch (err: any) {
            console.error("Error loading events", err);
            setError(err.message || "Failed to sync ticket database.");
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        if (!name.trim()) return;

        setAdding(true);
        try {
            await addEvent({
                name: name.trim(),
                active: true
            });
            setName('');
            await loadEvents();
        } catch (err: any) {
            console.error("Error adding event", err);
            setError(`Failed to create ticket: ${err.message || "Permission denied."}`);
        } finally {
            setAdding(false);
        }
    };

    const handleToggle = async (id: string, currentStatus: boolean) => {
        try {
            await toggleEventStatus(id, currentStatus);
            await loadEvents();
        } catch (error) {
            console.error("Error toggling event", error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("CONFIRM: Permanent deletion of ticket category. Proceed?")) return;
        try {
            await deleteEvent(id);
            await loadEvents();
        } catch (error) {
            console.error("Error deleting event", error);
        }
    };

    return (
        <div className="premium-card bg-zinc-950/20 border-zinc-800 shadow-2xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-8 border-b border-zinc-900 pb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-zinc-900 rounded-lg text-premium-red">
                        <Calendar className="h-5 w-5" />
                    </div>
                    <h3 className="text-xl font-black uppercase tracking-tight text-premium-white">
                        Ticket Management
                    </h3>
                </div>
                <button
                    onClick={loadEvents}
                    className="p-2 hover:bg-zinc-900 rounded-lg transition-colors text-zinc-500 hover:text-premium-white"
                    title="Refresh List"
                >
                    <Loader2 className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-premium-red/10 border border-premium-red/30 text-premium-red rounded-xl text-sm font-bold flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                        <PowerOff className="h-4 w-4" />
                        <span>CONFIGURATION ERROR</span>
                    </div>
                    <p className="text-xs font-mono opacity-80 pl-7">{error}</p>
                </div>
            )}

            <form onSubmit={handleAdd} className="space-y-4 mb-10">
                <div className="relative">
                    <label className="premium-label !text-[10px] uppercase tracking-widest opacity-50">Ticket / Event Name</label>
                    <div className="flex gap-4">
                        <input
                            type="text"
                            placeholder="e.g. GENERAL ADMISSION"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="premium-input !py-4 uppercase font-bold tracking-widest text-xs flex-1"
                            required
                        />
                        <button
                            type="submit"
                            disabled={adding || !name.trim()}
                            className="premium-button-primary !py-4 px-8 uppercase tracking-widest text-xs font-black shadow-[0_0_20px_rgba(255,255,255,0.1)] active:scale-95 transition-all whitespace-nowrap"
                        >
                            {adding ? <Loader2 className="h-4 w-4 animate-spin text-premium-black" /> : <Plus className="h-4 w-4 text-premium-black" />}
                            Create Ticket
                        </button>
                    </div>
                </div>
            </form>

            <div className="space-y-4">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 mb-4 px-1">Active Ticket Types</p>
                {loading && events.length === 0 ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="h-10 w-10 animate-spin text-zinc-800" />
                    </div>
                ) : events.length === 0 ? (
                    <div className="p-12 text-center rounded-2xl border border-dashed border-zinc-900">
                        <Calendar className="h-10 w-10 text-zinc-900 mx-auto mb-4" />
                        <p className="text-zinc-700 font-black uppercase tracking-widest text-[10px]">No ticket categories detected</p>
                    </div>
                ) : (
                    events.map((event) => (
                        <div key={event.id} className="group flex items-center justify-between p-6 bg-black border border-zinc-900 rounded-2xl hover:border-zinc-700 transition-all duration-300 gap-4">
                            <div className="flex items-center gap-6">
                                <div className={`h-3 w-3 rounded-full transition-all duration-500 shadow-[0_0_15px] shrink-0 ${event.active ? 'bg-premium-red shadow-premium-red/50' : 'bg-zinc-800 shadow-transparent'}`}></div>
                                <div>
                                    <h4 className="font-black text-premium-white uppercase tracking-tighter text-lg">{event.name}</h4>
                                    <p className={`text-[10px] font-black uppercase tracking-widest mt-1 ${event.active ? 'text-zinc-400' : 'text-zinc-700'}`}>
                                        {event.active ? 'STATUS: ACTIVE' : 'STATUS: DISABLED'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => handleToggle(event.id, event.active)}
                                    className={`p-3 rounded-xl transition-all duration-300 border ${event.active ? 'text-premium-red border-premium-red/20 bg-premium-red/5 hover:bg-premium-red/10' : 'text-zinc-600 border-zinc-900 bg-zinc-900/50 hover:bg-zinc-900'}`}
                                    title={event.active ? "DISABLE" : "ENABLE"}
                                >
                                    {event.active ? <Power className="h-5 w-5" /> : <PowerOff className="h-5 w-5" />}
                                </button>
                                <button
                                    onClick={() => handleDelete(event.id)}
                                    className="p-3 text-zinc-700 hover:text-white hover:bg-premium-red border border-transparent hover:border-premium-red rounded-xl transition-all duration-300"
                                    title="DELETE"
                                >
                                    <Trash2 className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div className="mt-12 text-center border-t border-zinc-900 pt-8">
                <p className="text-[9px] text-zinc-700 font-medium uppercase tracking-[0.4em]">Ticket Portal v2.6</p>
            </div>
        </div>
    );
};

export default EventManager;
