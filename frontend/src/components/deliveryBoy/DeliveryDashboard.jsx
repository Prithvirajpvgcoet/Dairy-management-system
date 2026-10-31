import React, { useState, useEffect } from 'react';
import { 
    CheckCircle2, 
    Navigation, 
    Loader2, 
    Truck, 
    User, 
    LogOut, 
    MapPin, 
    Plus, 
    Minus, 
    Milk, 
    Map as MapIcon, 
    List, 
    Award,
    IndianRupee,
    ChevronDown,
    ChevronUp,
    Phone,
    RotateCcw,
    DollarSign
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/client';
import StatusBadge from '../common/StatusBadge';
import Modal from '../common/Modal';
import DeliveryRouteMap from './DeliveryRouteMap';
import DeliveryEarnings from './DeliveryEarnings';

const STATUS_OPTIONS = [
    { value: 'DELIVERED', label: 'Delivered', color: 'bg-emerald-600 hover:bg-emerald-700 text-white' },
    { value: 'NOT_DELIVERED', label: 'Not Delivered', color: 'bg-rose-600 hover:bg-rose-700 text-white' },
    { value: 'CUSTOMER_SKIPPED', label: 'Skipped', color: 'bg-slate-500 hover:bg-slate-600 text-white' },
    { value: 'DELIVERY_FAILED', label: 'Failed', color: 'bg-amber-600 hover:bg-amber-700 text-white' },
];

export default function DeliveryDashboard() {
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('ROUTE'); // 'ROUTE' | 'MAP' | 'EARNINGS'
    const [route, setRoute] = useState([]);
    const [summary, setSummary] = useState(null);
    const [performanceData, setPerformanceData] = useState(null);
    const [markingId, setMarkingId] = useState(null);
    const [expandedStopId, setExpandedStopId] = useState(null);
    const [actualQtyMap, setActualQtyMap] = useState({});

    // Payment collection modal state
    const [payModalStop, setPayModalStop] = useState(null);
    const [payAmount, setPayAmount] = useState('');
    const [payMethod, setPayMethod] = useState('CASH');
    const [paySubmitting, setPaySubmitting] = useState(false);

    const name = localStorage.getItem('name') || 'Partner';
    const today = new Date();
    const todayLabel = today.toLocaleDateString('en-GB', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    });
    const todayShort = today.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

    const fetchData = async () => {
        try {
            const [routeRes, summaryRes, perfRes] = await Promise.allSettled([
                api.get('/delivery/today-route'),
                api.get('/delivery/summary'),
                api.get('/delivery/my-performance'),
            ]);

            const routeData = routeRes.status === 'fulfilled' ? (routeRes.value.data || []) : [];
            setRoute(routeData);

            // Populate initial actual quantities from stop expected quantities
            setActualQtyMap(prev => {
                const next = { ...prev };
                routeData.forEach(d => {
                    if (!(d.id in next)) {
                        next[d.id] = parseFloat(d.actual_quantity || d.expected_quantity || 1);
                    }
                });
                return next;
            });

            if (summaryRes.status === 'fulfilled') {
                setSummary(summaryRes.value.data);
            }
            if (perfRes.status === 'fulfilled') {
                setPerformanceData(perfRes.value.data);
            }
        } catch (err) {
            console.error('Fetch delivery data error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();

        // Pause polling when tab is hidden to conserve bandwidth and battery
        let intervalId = null;
        const handleVisibilityChange = () => {
            if (document.hidden) {
                if (intervalId) clearInterval(intervalId);
            } else {
                fetchData();
                intervalId = setInterval(fetchData, 45000);
            }
        };

        intervalId = setInterval(fetchData, 45000);
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            if (intervalId) clearInterval(intervalId);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, []);

    // 1-Tap Delivery Handler with Background GPS & 10s Undo Toast
    const handleMarkStatus = async (stop, status = 'DELIVERED') => {
        setMarkingId(stop.id);
        const enteredQty = status === 'DELIVERED' 
            ? Math.max(0, parseFloat(actualQtyMap[stop.id] ?? stop.expected_quantity ?? 1))
            : 0;

        // Optimistic UI update
        const prevRoute = [...route];
        setRoute(prev => prev.map(s => s.id === stop.id ? { ...s, status, actual_quantity: enteredQty } : s));

        try {
            // Background GPS capture (never blocks mark tap)
            let gps_latitude = null, gps_longitude = null;
            try {
                const pos = await new Promise((res, rej) =>
                    navigator.geolocation.getCurrentPosition(res, rej, { timeout: 4000 })
                );
                gps_latitude = pos.coords.latitude;
                gps_longitude = pos.coords.longitude;
            } catch (_) {}

            const res = await api.post('/delivery/mark-delivered', {
                customerId: stop.id,
                status,
                actual_quantity: enteredQty,
                gps_latitude,
                gps_longitude,
            }, {
                headers: { 'x-bypass-cutoff': 'true' }
            });

            const deliveryRecordId = res.data?.deliveryId;

            // Trigger 10-second interactive Undo Toast
            if (status === 'DELIVERED' && deliveryRecordId) {
                toast((t) => (
                    <div className="flex items-center justify-between gap-3 w-full">
                        <span className="text-xs font-bold text-slate-800">Stop #{stop.stop_order} delivered!</span>
                        <button
                            onClick={async () => {
                                toast.dismiss(t.id);
                                await handleUndo(deliveryRecordId, stop.id);
                            }}
                            className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-black shadow-sm transition-all flex items-center gap-1"
                        >
                            <RotateCcw className="w-3 h-3" /> Undo
                        </button>
                    </div>
                ), { duration: 10000, position: 'bottom-center' });
            } else {
                toast.success(`Stop #${stop.stop_order} marked ${status.replace('_', ' ').toLowerCase()}`);
            }

            fetchData();
        } catch (err) {
            // Rollback optimistic update
            setRoute(prevRoute);
            toast.error(err.response?.data?.message || 'Failed to update status');
        } finally {
            setMarkingId(null);
            setExpandedStopId(null);
        }
    };

    // Undo Delivery action
    const handleUndo = async (deliveryId, stopId) => {
        try {
            await api.put(`/delivery/${deliveryId}/undo`, {}, {
                headers: { 'x-bypass-cutoff': 'true' }
            });
            toast.success('Delivery status reverted successfully');
            fetchData();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to undo delivery');
        }
    };

    // Stepper quantity update
    const updateActualQty = (id, delta) => {
        setActualQtyMap(prev => ({
            ...prev,
            [id]: Math.max(0, parseFloat(((prev[id] ?? 1) + delta).toFixed(1))),
        }));
    };

    // Multi-stop Google Maps Navigation builder for next 8 pending stops
    const handleMultiStopNavigation = () => {
        const pendingStops = route.filter(r => r.status !== 'DELIVERED' && r.status !== 'CUSTOMER_SKIPPED');
        if (pendingStops.length === 0) {
            return toast('All today stops are already delivered!', { icon: '🎉' });
        }

        const nextStops = pendingStops.slice(0, 8);
        const destination = nextStops[nextStops.length - 1];
        const destQuery = destination.gps_lat && destination.gps_lng 
            ? `${destination.gps_lat},${destination.gps_lng}` 
            : encodeURIComponent(destination.address);

        const waypoints = nextStops.slice(0, -1)
            .map(s => s.gps_lat && s.gps_lng ? `${s.gps_lat},${s.gps_lng}` : encodeURIComponent(s.address))
            .join('|');

        const mapsUrl = waypoints 
            ? `https://www.google.com/maps/dir/?api=1&destination=${destQuery}&waypoints=${waypoints}`
            : `https://www.google.com/maps/dir/?api=1&destination=${destQuery}`;

        window.open(mapsUrl, '_blank');
    };

    // Collect on-stop payment
    const handleRecordPayment = async (e) => {
        e.preventDefault();
        if (!payAmount || parseFloat(payAmount) <= 0) {
            return toast.error('Please enter a valid amount');
        }
        setPaySubmitting(true);
        try {
            await api.post('/delivery/collect-payment', {
                customerId: payModalStop.id,
                amount: parseFloat(payAmount),
                method: payMethod
            });
            toast.success(`Payment of ₹${payAmount} recorded!`);
            setPayModalStop(null);
            setPayAmount('');
            fetchData();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to record payment');
        } finally {
            setPaySubmitting(false);
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        window.location.href = '/login';
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-[#0D47A1]">
                <div className="text-center text-white space-y-3">
                    <Loader2 className="w-10 h-10 animate-spin mx-auto text-blue-200" />
                    <p className="text-sm font-semibold tracking-wide">Loading delivery route...</p>
                </div>
            </div>
        );
    }

    const pendingCount = route.filter(r => r.status !== 'DELIVERED' && r.status !== 'CUSTOMER_SKIPPED').length;
    const completedCount = route.filter(r => r.status === 'DELIVERED').length;

    return (
        <div className="bg-slate-50 min-h-screen pb-24 font-['Poppins']">
            {/* Header with Hero Gradient */}
            <header className="bg-gradient-to-r from-[#0D47A1] to-[#1565C0] text-white pt-6 pb-12 px-4 sm:px-6 shadow-md relative">
                <div className="max-w-3xl mx-auto">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/10 rounded-xl backdrop-blur-sm">
                                <Truck className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-base sm:text-lg font-black tracking-tight leading-none">Amarale Delivery</h1>
                                <p className="text-xs text-blue-100 font-medium mt-0.5">Welcome, {name}</p>
                            </div>
                        </div>

                        <button 
                            onClick={handleLogout}
                            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
                            title="Logout"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Date Pill & Quick Action */}
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="inline-flex items-center gap-2 bg-white/15 px-3 py-1.5 rounded-xl border border-white/20 backdrop-blur-sm text-xs font-bold text-white">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                            {todayLabel}
                        </div>

                        <button
                            onClick={handleMultiStopNavigation}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-black shadow-sm transition-all"
                        >
                            <Navigation className="w-3.5 h-3.5" />
                            Start Route Navigation ({pendingCount} stops)
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="max-w-3xl mx-auto px-4 -mt-6 space-y-4">
                {/* Summary Metrics Banner */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
                    <div className="grid grid-cols-4 gap-2 text-center divide-x divide-slate-100">
                        <div>
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Total</span>
                            <span className="text-xl sm:text-2xl font-black text-slate-800">{route.length}</span>
                        </div>
                        <div>
                            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider block">Done</span>
                            <span className="text-xl sm:text-2xl font-black text-emerald-600">{completedCount}</span>
                        </div>
                        <div>
                            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block">Pending</span>
                            <span className="text-xl sm:text-2xl font-black text-blue-600">{pendingCount}</span>
                        </div>
                        <div>
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Volume</span>
                            <span className="text-xl sm:text-2xl font-black text-slate-700">
                                {route.reduce((acc, s) => acc + (s.status === 'DELIVERED' ? (s.actual_quantity || 0) : 0), 0).toFixed(1)}L
                            </span>
                        </div>
                    </div>
                </div>

                {/* Sub-Navigation Tabs */}
                <div className="flex bg-slate-200/70 p-1 rounded-2xl gap-1">
                    <button
                        onClick={() => setActiveTab('ROUTE')}
                        className={`flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                            activeTab === 'ROUTE' 
                                ? 'bg-white text-blue-900 shadow-sm' 
                                : 'text-slate-600 hover:text-slate-900'
                        }`}
                    >
                        <List className="w-4 h-4" />
                        Today's Route ({route.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('MAP')}
                        className={`flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                            activeTab === 'MAP' 
                                ? 'bg-white text-blue-900 shadow-sm' 
                                : 'text-slate-600 hover:text-slate-900'
                        }`}
                    >
                        <MapIcon className="w-4 h-4" />
                        Route Map
                    </button>
                    <button
                        onClick={() => setActiveTab('EARNINGS')}
                        className={`flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                            activeTab === 'EARNINGS' 
                                ? 'bg-white text-blue-900 shadow-sm' 
                                : 'text-slate-600 hover:text-slate-900'
                        }`}
                    >
                        <Award className="w-4 h-4" />
                        Performance & Pay
                    </button>
                </div>

                {/* TAB 1: ROUTE LIST */}
                {activeTab === 'ROUTE' && (
                    <div className="space-y-3">
                        {route.length === 0 ? (
                            <div className="bg-white p-8 rounded-2xl text-center border border-slate-100 shadow-sm">
                                <Truck className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                                <h3 className="text-base font-bold text-slate-800">No deliveries assigned for today</h3>
                                <p className="text-xs text-slate-500 mt-1">Check back later or contact admin for route assignments.</p>
                            </div>
                        ) : (
                            route.map((stop, idx) => {
                                const isDelivered = stop.status === 'DELIVERED';
                                const isSkipped = stop.status === 'CUSTOMER_SKIPPED';
                                const isExpanded = expandedStopId === stop.id;
                                const qty = actualQtyMap[stop.id] ?? stop.expected_quantity ?? 1;

                                return (
                                    <div 
                                        key={stop.id}
                                        className={`bg-white rounded-2xl border transition-all overflow-hidden ${
                                            isDelivered 
                                                ? 'border-emerald-200 bg-emerald-50/20' 
                                                : isSkipped 
                                                    ? 'border-slate-200 opacity-60' 
                                                    : 'border-slate-200 shadow-sm'
                                        }`}
                                    >
                                        <div className="p-4 flex items-center justify-between gap-3">
                                            {/* Stop Sequence & Customer Info */}
                                            <div className="flex items-start gap-3 flex-1 min-w-0">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 ${
                                                    isDelivered 
                                                        ? 'bg-emerald-100 text-emerald-800' 
                                                        : 'bg-blue-100 text-blue-900'
                                                }`}>
                                                    #{stop.stop_order || (idx + 1)}
                                                </div>

                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="text-sm font-bold text-slate-900 truncate">{stop.customer_name}</h4>
                                                        <StatusBadge status={stop.status} />
                                                    </div>
                                                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5 truncate">
                                                        <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                                                        {stop.address}
                                                    </p>
                                                    <p className="text-xs font-semibold text-blue-800 mt-1">
                                                        Planned: {stop.expected_quantity} L
                                                        {stop.items && stop.items.length > 0 && ` (${stop.items.map(it => `${it.product_name || 'Milk'} ${it.subscription_qty || it.actual_qty}L`).join(', ')})`}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Quick Actions */}
                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                {/* Single Tap "Delivered" Button */}
                                                {!isDelivered && !isSkipped && (
                                                    <button
                                                        onClick={() => handleMarkStatus(stop, 'DELIVERED')}
                                                        disabled={markingId === stop.id}
                                                        className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl text-xs font-black shadow-sm flex items-center gap-1.5 transition-all"
                                                    >
                                                        {markingId === stop.id ? (
                                                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                        ) : (
                                                            <CheckCircle2 className="w-4 h-4" />
                                                        )}
                                                        Delivered
                                                    </button>
                                                )}

                                                {/* Expand / Details toggle */}
                                                <button
                                                    onClick={() => setExpandedStopId(isExpanded ? null : stop.id)}
                                                    className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                                                    aria-label="Toggle details"
                                                >
                                                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                                                </button>
                                            </div>
                                        </div>

                                        {/* Expanded Options Drawer */}
                                        {isExpanded && (
                                            <div className="px-4 pb-4 pt-2 border-t border-slate-100 bg-slate-50/50 space-y-3">
                                                {/* Actual Quantity Adjuster */}
                                                <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                                                    <div>
                                                        <span className="text-xs font-bold text-slate-700 block">Delivered Liters</span>
                                                        <span className="text-[11px] text-slate-400">Adjust if customer took extra or less</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <button 
                                                            onClick={() => updateActualQty(stop.id, -0.5)}
                                                            className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center transition-colors"
                                                        >
                                                            <Minus className="w-4 h-4" />
                                                        </button>
                                                        <span className="w-12 text-center text-base font-black text-slate-900">{qty} L</span>
                                                        <button 
                                                            onClick={() => updateActualQty(stop.id, 0.5)}
                                                            className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center transition-colors"
                                                        >
                                                            <Plus className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Status Selector Options */}
                                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                                    {STATUS_OPTIONS.map(opt => (
                                                        <button
                                                            key={opt.value}
                                                            onClick={() => handleMarkStatus(stop, opt.value)}
                                                            disabled={markingId === stop.id}
                                                            className={`py-2 px-3 rounded-xl text-xs font-bold shadow-sm transition-all ${opt.color}`}
                                                        >
                                                            {opt.label}
                                                        </button>
                                                    ))}
                                                </div>

                                                {/* Customer Phone & Google Nav Links */}
                                                <div className="flex items-center justify-between pt-1">
                                                    {stop.phone && (
                                                        <a 
                                                            href={`tel:${stop.phone}`}
                                                            className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 hover:underline"
                                                        >
                                                            <Phone className="w-3.5 h-3.5" /> Call Customer
                                                        </a>
                                                    )}

                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => setPayModalStop(stop)}
                                                            className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100 hover:bg-emerald-200 px-3 py-1.5 rounded-lg transition-colors"
                                                        >
                                                            <IndianRupee className="w-3.5 h-3.5" /> Collect Payment
                                                        </button>

                                                        <button
                                                            onClick={() => {
                                                                const dest = stop.gps_lat && stop.gps_lng ? `${stop.gps_lat},${stop.gps_lng}` : encodeURIComponent(stop.address);
                                                                window.open(`https://www.google.com/maps/dir/?api=1&destination=${dest}`, '_blank');
                                                            }}
                                                            className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 bg-slate-200 hover:bg-slate-300 px-3 py-1.5 rounded-lg transition-colors"
                                                        >
                                                            <Navigation className="w-3.5 h-3.5" /> Navigate
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                )}

                {/* TAB 2: LIVE ROUTE MAP */}
                {activeTab === 'MAP' && (
                    <DeliveryRouteMap 
                        route={route} 
                        onMarkDelivered={handleMarkStatus} 
                        markingId={markingId} 
                    />
                )}

                {/* TAB 3: EARNINGS & STATS */}
                {activeTab === 'EARNINGS' && (
                    <DeliveryEarnings performanceData={performanceData} />
                )}
            </main>

            {/* Payment Collection Modal */}
            <Modal
                isOpen={Boolean(payModalStop)}
                onClose={() => setPayModalStop(null)}
                title={`Collect Payment — ${payModalStop?.customer_name}`}
            >
                <form onSubmit={handleRecordPayment} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Payment Amount (₹)</label>
                        <input
                            type="number"
                            step="0.01"
                            min="1"
                            value={payAmount}
                            onChange={(e) => setPayAmount(e.target.value)}
                            placeholder="e.g. 500"
                            required
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-semibold text-slate-800"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Payment Mode</label>
                        <div className="grid grid-cols-3 gap-2">
                            {['CASH', 'UPI', 'CARD'].map(m => (
                                <button
                                    key={m}
                                    type="button"
                                    onClick={() => setPayMethod(m)}
                                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                                        payMethod === m 
                                            ? 'bg-blue-600 text-white border-blue-600 shadow-sm' 
                                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                                    }`}
                                >
                                    {m}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="pt-2 flex items-center justify-end gap-2">
                        <button
                            type="button"
                            onClick={() => setPayModalStop(null)}
                            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={paySubmitting}
                            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-200 flex items-center gap-1.5 transition-all"
                        >
                            {paySubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                            Confirm Payment
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
