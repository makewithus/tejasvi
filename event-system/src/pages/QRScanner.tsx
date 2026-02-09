import { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { validateAndScanQR } from '../services/firestore';
import { XCircle, ArrowLeft, Loader2, Camera, ShieldCheck, User, Briefcase } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';

const QRScanner = () => {
    const navigate = useNavigate();
    const [scanResult, setScanResult] = useState<{ success: boolean; message: string; data?: any } | null>(null);
    const [paused, setPaused] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const scanner = new Html5QrcodeScanner(
            "reader",
            { fps: 10, qrbox: { width: 250, height: 250 } },
            /* verbose= */ false
        );

        scanner.render(onScanSuccess, onScanFailure);

        function onScanSuccess(decodedText: string) {
            if (paused) return;
            handleScan(decodedText);
        }

        function onScanFailure() { }

        return () => {
            scanner.clear().catch(error => {
                console.error("Scanner clear fail: ", error);
            });
        };
    }, [paused]);

    const handleScan = async (dataString: string) => {
        setPaused(true);
        setLoading(true);
        try {
            let regId = dataString;
            try {
                const parsed = JSON.parse(dataString);
                if (parsed.regId) regId = parsed.regId;
            } catch (e) { }

            const result = await validateAndScanQR(regId);
            setScanResult(result);

        } catch (error) {
            console.error("Scan Error", error);
            setScanResult({ success: false, message: "Decryption Failed: Invalid Signature" });
        } finally {
            setLoading(false);
        }
    };

    const resetScan = () => {
        setScanResult(null);
        setPaused(false);
    };

    return (
        <div className="min-h-screen bg-premium-black text-premium-white p-6 flex flex-col items-center">
            <div className="w-full max-w-lg">
                <header className="flex justify-between items-center mb-12">
                    <button
                        onClick={() => navigate('/admin')}
                        className="flex items-center gap-2 text-zinc-600 hover:text-white transition-all uppercase text-[10px] font-black tracking-[0.2em]"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Abort Scanner
                    </button>
                    <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-premium-red animate-pulse"></div>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Live Grid</span>
                    </div>
                </header>

                <div className="text-center mb-10">
                    <h2 className="text-4xl font-black uppercase tracking-tighter mb-2">Optical Verification</h2>
                    <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Align QR signal within the frame</p>
                </div>

                {!scanResult && !loading && (
                    <div className="premium-card !p-2 bg-white rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(255,49,49,0.1)] transition-transform duration-700 hover:scale-[1.02]">
                        <div id="reader" className="w-full overflow-hidden rounded-2xl"></div>
                    </div>
                )}

                {loading && (
                    <div className="premium-card flex flex-col items-center justify-center py-24 bg-zinc-950/20 border-zinc-800">
                        <div className="relative">
                            <Loader2 className="h-16 w-16 animate-spin text-premium-red opacity-20" />
                            <Camera className="absolute left-1/2 top-1/2 -translate-y-1/2 -translate-x-1/2 h-6 w-6 text-premium-red" />
                        </div>
                        <p className="text-premium-gray font-black uppercase tracking-[0.4em] text-[10px] mt-8">Analyzing Node Data</p>
                    </div>
                )}

                {scanResult && !loading && (
                    <div className="mt-6 animate-in zoom-in-95 duration-500">
                        <div className={`relative overflow-hidden rounded-[2.5rem] border-2 transition-all duration-700 shadow-2xl ${scanResult.success ? 'bg-[#0a0a0a] border-green-500/30' : 'bg-[#0a0a0a] border-premium-red/30'}`}>

                            <div className={`${scanResult.success ? 'bg-white' : 'bg-premium-red'} p-8 text-center`}>
                                <div className="flex flex-col items-center">
                                    <h3 className="text-3xl font-black uppercase tracking-tight text-black leading-none mb-1">OFFICIAL PASS</h3>
                                    <p className="text-[9px] font-black uppercase tracking-[0.4em] text-zinc-500">Verified & Authorized 2026</p>
                                </div>
                            </div>

                            <div className="p-8 pb-10 flex flex-col items-center">
                                <div className={`px-6 py-2 rounded-2xl mb-10 border flex items-center gap-3 animate-pulse ${scanResult.success ? 'bg-green-500/10 border-green-500/20 text-green-500' : 'bg-premium-red/10 border-premium-red/20 text-premium-red'}`}>
                                    {scanResult.success ? <ShieldCheck className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                                    <span className="text-[10px] font-black uppercase tracking-[0.3em]">{scanResult.success ? 'ENTRY APPROVED' : 'ENTRY REJECTED'}</span>
                                </div>

                                {scanResult.data && (
                                    <div className="w-full space-y-10">
                                        <div className="flex flex-col items-center text-center">
                                            <div className="bg-white p-4 rounded-3xl mb-6 shadow-sm">
                                                <QRCodeSVG
                                                    value={scanResult.data.registrationId}
                                                    size={120}
                                                    level="H"
                                                />
                                            </div>
                                            <div className="bg-zinc-900/50 px-6 py-1.5 rounded-full border border-zinc-800">
                                                <p className="font-mono text-[9px] text-zinc-500 tracking-widest">{scanResult.data.registrationId}</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="bg-zinc-950/50 border border-zinc-900 rounded-3xl p-5">
                                                <label className="text-zinc-600 font-black uppercase tracking-[0.2em] text-[7px] block mb-3">Attendee</label>
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 bg-zinc-900 rounded-xl flex items-center justify-center border border-zinc-800">
                                                        <User className="h-3 w-3 text-zinc-500" />
                                                    </div>
                                                    <span className="text-lg font-black text-white uppercase tracking-tight leading-none">{scanResult.data.fullName}</span>
                                                </div>
                                            </div>

                                            <div className="bg-zinc-950/50 border border-zinc-900 rounded-3xl p-5">
                                                <label className="text-zinc-600 font-black uppercase tracking-[0.2em] text-[7px] block mb-3">Node / Branch</label>
                                                <div className="flex items-center gap-4">
                                                    <div className="h-8 w-8 bg-zinc-900 rounded-xl flex items-center justify-center border border-zinc-800">
                                                        <Briefcase className="h-4 w-4 text-zinc-500" />
                                                    </div>
                                                    <span className="text-lg font-black text-white uppercase tracking-tight leading-none uppercase">{scanResult.data.branch || 'GENERAL'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <button
                                    onClick={resetScan}
                                    className={`w-full py-6 mt-10 font-black uppercase tracking-[0.4em] text-xs transition-colors rounded-2xl ${scanResult.success ? 'bg-zinc-900 hover:bg-zinc-800 text-white' : 'bg-premium-red hover:bg-opacity-80 text-white'}`}
                                >
                                    {scanResult.success ? 'READY FOR NEXT SCAN' : 'TRY AGAIN'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <footer className="mt-12 flex flex-col items-center gap-4 opacity-30">
                    <ShieldCheck className="h-6 w-6" />
                    <p className="text-[9px] font-bold uppercase tracking-[0.5em]">Global Security Infrastructure v1.0.4</p>
                </footer>
            </div>
        </div>
    );
};

export default QRScanner;
