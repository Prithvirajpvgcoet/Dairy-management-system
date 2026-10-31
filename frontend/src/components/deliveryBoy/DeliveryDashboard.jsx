import React, { useState, useEffect } from 'react';
import { CheckCircle2, Navigation, Loader2, Truck, User, LogOut, MapPin, Plus, Minus, Milk, Map as MapIcon, List } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../../api/client';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const STATUS_OPTIONS = [
  { value: 'DELIVERED',        label: '✅ Delivered',         color: 'bg-green-500 text-white' },
  { value: 'NOT_DELIVERED',    label: '❌ Not Delivered',     color: 'bg-red-500 text-white' },
  { value: 'CUSTOMER_SKIPPED', label: '⏭ Customer Skipped',  color: 'bg-amber-500 text-white' },
  { value: 'DELIVERY_FAILED',  label: '🚫 Delivery Failed',   color: 'bg-gray-500 text-white' },
];

const DeliveryDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('LIST');
  const [myPerf, setMyPerf] = useState(null);
 // LIST or MAP
  
  // Custom marker styles based on status
  const getMarkerColor = (status) => {
    if (status === 'DELIVERED') return '#10B981'; // green
    if (status === 'PENDING') return '#3B82F6'; // blue
    if (status === 'CUSTOMER_SKIPPED') return '#9CA3AF'; // grey
    return '#EF4444'; // red
  };

  const [route, setRoute] = useState([]);
  const [summary, setSummary] = useState(null);
  const [marking, setMarking] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  // actualQtyMap: { [customerId]: number } — the ACTUAL quantity the partner entered per delivery
  const [actualQtyMap, setActualQtyMap] = useState({});

  const name = localStorage.getItem('name') || 'Partner';

  // Today's date — determined by system, shown prominently, never editable by partner
  const today = new Date();
  const todayLabel = today.toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
  const todayShort = today.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 45000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [routeRes, summaryRes, perfRes] = await Promise.allSettled([
        api.get('/delivery/today-route'),
        api.get('/delivery/summary'),
          api.get('/delivery/my-performance'),
      ]);

      const routeData = routeRes.status === 'fulfilled' ? (routeRes.value.data || []) : [];
      setRoute(routeData);

      // Pre-fill actualQtyMap with each delivery's expected quantity as a starting suggestion.
      // The partner can then adjust this to the actual amount they delivered.
      setActualQtyMap(prev => {
        const next = { ...prev };
        routeData.forEach(d => {
          if (!(d.id in next)) {
            const subQty = parseFloat(d.subscription_qty || d.expected_quantity || 0);
            const addonQty = parseFloat(d.addon_quantity || 0);
            next[d.id] = subQty + addonQty;
          }
        });
        return next;
      });

      const perfData = perfRes.status === 'fulfilled' ? perfRes.value.data : null;
        if (perfData) setMyPerf(perfData);
        
        const summaryData = summaryRes.status === 'fulfilled' ? summaryRes.value.data : null;
      setSummary(summaryData || {
        totalToday: routeData.length,
        completed: routeData.filter(r => r.status === 'DELIVERED').length,
        pending: routeData.filter(r => r.status === 'PENDING').length,
        estimatedEarnings: 0,
        weeklyEarnings: [
          { day: 'Mon', earnings: 800 }, { day: 'Tue', earnings: 1200 },
          { day: 'Wed', earnings: 950 }, { day: 'Thu', earnings: 1450 },
          { day: 'Fri', earnings: 1100 }, { day: 'Sat', earnings: 900 },
          { day: 'Sun', earnings: 1500 },
        ],
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkStatus = async (delivery, status) => {
    setMarking(delivery.id);
    try {
      // GPS capture (system-determined, not partner input)
      let gps_latitude = null, gps_longitude = null;
      try {
        const pos = await new Promise((res, rej) =>
          navigator.geolocation.getCurrentPosition(res, rej, { timeout: 4000 })
        );
        gps_latitude = pos.coords.latitude;
        gps_longitude = pos.coords.longitude;
      } catch (_) {}

      // CRITICAL: Use the partner-entered ACTUAL quantity for DELIVERED.
      // For all other statuses, actual quantity = 0.
      const actualQty = status === 'DELIVERED'
        ? Math.max(0, parseFloat(actualQtyMap[delivery.id] ?? 0))
        : 0;

      await api.post('/delivery/mark-delivered', {
        customerId: delivery.id,
        delivered: status === 'DELIVERED',
        status,
        actual_quantity: actualQty,   // <-- what the partner actually handed to customer
        gps_latitude,
        gps_longitude,
      });
      setExpandedId(null);
      fetchData();
    } catch (err) {
      alert('Failed to update: ' + (err.response?.data?.message || err.message));
    } finally {
      setMarking(null);
    }
  };

  const updateActualQty = (id, delta) => {
    setActualQtyMap(prev => ({
      ...prev,
      [id]: Math.max(0, parseFloat((prev[id] ?? 0) + delta).toFixed(1) * 1),
    }));
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0D47A1]">
        <Loader2 className="w-8 h-8 animate-spin text-white" />
      </div>
    );
  }

  const statusStyle = (status) => {
    if (status === 'DELIVERED') return 'bg-green-100 text-green-700';
    if (status === 'CUSTOMER_SKIPPED') return 'bg-amber-100 text-amber-700';
    if (status === 'NOT_DELIVERED' || status === 'DELIVERY_FAILED') return 'bg-red-100 text-red-700';
    return 'bg-orange-100 text-orange-700';
  };

  return (
    <div className="bg-slate-50 min-h-screen">

      {/* ─── HEADER with Today's Date ─── */}
      <div className="bg-gradient-to-b from-[#0D47A1] to-[#1565C0] pt-6 pb-16 px-5 text-white rounded-b-3xl shadow-lg relative">
        <div className="flex items-center justify-between mb-5">
          <Truck className="w-6 h-6 text-blue-100" />
          <div className="w-9 h-9 rounded-full bg-white text-[#0D47A1] flex items-center justify-center font-bold shadow-md border-2 border-blue-200">
            <User className="w-5 h-5" />
          </div>
        </div>
        <p className="text-blue-100 text-sm font-medium mb-1">Good Morning, {name} 👋</p>
        <h1 className="text-xl font-extrabold mb-3">Delivery Partner</h1>

        {/* Today's date — clearly shown, system-determined */}
        <div className="bg-white/15 rounded-xl px-4 py-2.5 inline-flex items-center gap-2.5 backdrop-blur-sm border border-white/20">
          <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
            <span className="text-[10px] font-extrabold text-white">{today.getDate()}</span>
          </div>
          <div>
            <p className="text-[10px] text-blue-100 font-semibold uppercase tracking-wider">Delivery Date</p>
            <p className="text-sm font-extrabold text-white leading-tight">{todayLabel}</p>
          </div>
        </div>
      </div>

      <div className="px-4 -mt-10 relative z-10 space-y-4 pb-8">

        {/* ─── HOME TAB ─── */}
        {location.pathname === '/delivery' && (
          <>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
              <p className="text-xs font-extrabold text-gray-500 uppercase tracking-wider mb-3">Today's Summary — {todayShort}</p>
              <div className="grid grid-cols-4 gap-2 text-center divide-x divide-gray-100">
                <div className="px-1">
                  <p className="text-xl font-extrabold text-[#0D47A1]">{summary?.totalToday || 0}</p>
                  <p className="text-[9px] text-gray-500 font-bold uppercase mt-1">Total</p>
                </div>
                <div className="px-1">
                  <p className="text-xl font-extrabold text-green-600">{summary?.completed || 0}</p>
                  <p className="text-[9px] text-gray-500 font-bold uppercase mt-1">Done</p>
                </div>
                <div className="px-1">
                  <p className="text-xl font-extrabold text-orange-500">{summary?.pending || 0}</p>
                  <p className="text-[9px] text-gray-500 font-bold uppercase mt-1">Pending</p>
                </div>
                <div className="px-1">
                  <p className="text-xl font-extrabold text-gray-800">₹{summary?.estimatedEarnings || 0}</p>
                  <p className="text-[9px] text-gray-500 font-bold uppercase mt-1">Earnings</p>
                </div>
              </div>
            </div>
            <a
              href="https://maps.google.com"
              target="_blank"
              rel="noreferrer"
              className="w-full bg-[#0D47A1] text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20 active:scale-95 transition-transform"
            >
              Open Navigation <Navigation className="w-5 h-5 fill-current" />
            </a>
          </>
        )}

        {/* ─── DELIVERIES TAB ─── */}
        {location.pathname === '/delivery/route' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-4 py-3.5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-extrabold text-gray-800">Today's Delivery Route</h2>
                <p className="text-[10px] text-blue-600 font-bold mt-0.5">📅 {todayShort}</p>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold bg-blue-50 text-[#0D47A1] px-2 py-1 rounded-md">
                  {route.filter(r => r.status === 'DELIVERED').length}/{route.length} done
                </span>
                <div className="flex bg-gray-100 rounded-lg p-0.5 border border-gray-200">
                  <button onClick={() => setViewMode('LIST')} className={`p-1.5 rounded-md transition-colors ${viewMode === 'LIST' ? 'bg-white shadow-sm text-[#0D47A1]' : 'text-gray-400'}`}>
                    <List className="w-4 h-4" />
                  </button>
                  <button onClick={() => setViewMode('MAP')} className={`p-1.5 rounded-md transition-colors ${viewMode === 'MAP' ? 'bg-white shadow-sm text-[#0D47A1]' : 'text-gray-400'}`}>
                    <MapIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {viewMode === 'MAP' ? (
              <div className="h-[500px] w-full z-0 relative">
                <MapContainer center={[18.5204, 73.8567]} zoom={13} style={{ height: '100%', width: '100%', zIndex: 0 }}>
                  <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" attribution="&copy; OpenStreetMap & CartoDB" />
                  {route.map((d, index) => {
                    const lat = parseFloat(d.gps_lat);
                    const lng = parseFloat(d.gps_lng);
                    if (isNaN(lat) || isNaN(lng)) return null;
                    return (
                      <CircleMarker key={d.id} center={[lat, lng]} radius={8} pathOptions={{ color: '#fff', weight: 2, fillColor: getMarkerColor(d.status), fillOpacity: 0.9 }}>
                        <Popup>
                          <div className="font-['Poppins']">
                            <p className="font-bold text-gray-800 m-0">{index + 1}. {d.customer_name}</p>
                            <p className="text-xs text-gray-500 m-0 mb-2">{d.address}</p>
                            <a href={`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`} target="_blank" rel="noreferrer" className="bg-[#0D47A1] text-white text-xs px-3 py-1.5 rounded-md font-bold text-center block no-underline">Navigate</a>
                          </div>
                        </Popup>
                      </CircleMarker>
                    );
                  })}
                </MapContainer>
              </div>
            ) : (
              <div className="p-2 space-y-2">
                {route.length === 0 ? (
                  <div className="p-10 text-center text-gray-400 text-sm font-medium">
                    No deliveries assigned for today!
                  </div>
                ) : (
                route.map((d, index) => {
                  const subQty = parseFloat(d.subscription_qty || d.expected_quantity || 0);
                  const addonQty = parseFloat(d.addon_quantity || 0);
                  const expectedTotal = subQty + addonQty;
                  const currentActual = actualQtyMap[d.id] ?? expectedTotal;
                  const isExpanded = expandedId === d.id;

                  return (
                    <div key={d.id} className={`rounded-xl border overflow-hidden transition-all ${
                      d.status === 'DELIVERED' ? 'border-green-200 bg-green-50/30' :
                      d.status === 'CUSTOMER_SKIPPED' ? 'border-amber-200 bg-amber-50/30' :
                      d.status !== 'PENDING' ? 'border-red-200 bg-red-50/20' :
                      'border-gray-100'
                    }`}>
                      {/* Card row */}
                      <div
                        className="p-3 flex items-center gap-3 cursor-pointer hover:bg-slate-50/80 transition-colors"
                        onClick={() => setExpandedId(isExpanded ? null : d.id)}
                      >
                        {/* Step number */}
                        <div className="w-7 h-7 shrink-0 rounded-full bg-blue-100 text-[#0D47A1] flex items-center justify-center font-bold text-xs">
                          {index + 1}
                        </div>

                        {/* Name + address */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-bold text-gray-800 truncate">{d.customer_name}</h3>
                          <p className="text-[10px] text-gray-500 font-medium flex items-center mt-0.5">
                            <MapPin className="w-2.5 h-2.5 mr-0.5 shrink-0" />
                            {(d.address || '').slice(0, 28)}{(d.address || '').length > 28 ? '…' : ''}
                          </p>
                        </div>

                        {/* Quantities column */}
                        <div className="text-right shrink-0">
                          {/* Subscription qty */}
                          <p className="text-xs font-bold text-gray-700">
                            Sub: <span className="text-[#0D47A1]">{subQty}L</span>
                          </p>
                          {/* Add-on qty */}
                          {addonQty > 0 && (
                            <p className="text-[10px] font-bold text-green-600 flex items-center justify-end gap-0.5">
                              <Plus className="w-2.5 h-2.5" />{addonQty}L add-on
                            </p>
                          )}
                          {/* Expected total */}
                          <p className="text-[10px] font-bold text-gray-500 mt-0.5">
                            Exp: <span className="text-gray-800 font-extrabold">{expectedTotal}L</span>
                          </p>
                        </div>

                        {/* Status dot */}
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                          d.status === 'DELIVERED' ? 'bg-green-500 text-white' :
                          d.status === 'CUSTOMER_SKIPPED' ? 'bg-amber-400 text-white' :
                          d.status !== 'PENDING' ? 'bg-red-400 text-white' :
                          'bg-gray-100 text-gray-400 border border-gray-200'
                        }`}>
                          {marking === d.id
                            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            : <CheckCircle2 className="w-4 h-4" />
                          }
                        </div>
                      </div>

                      {/* ─── EXPANDED PANEL ─── */}
                      {isExpanded && (
                        <div className="border-t border-gray-100 bg-slate-50 p-4 space-y-4">

                          {/* Actual Quantity Input — THE KEY FIELD */}
                          <div className="bg-white rounded-xl border border-blue-200 p-4">
                            <div className="flex items-center gap-2 mb-3">
                              <Milk className="w-4 h-4 text-[#0D47A1]" />
                              <p className="text-xs font-extrabold text-gray-800 uppercase tracking-wide">
                                Actual Milk Provided
                              </p>
                            </div>
                            <p className="text-[10px] text-gray-500 font-medium mb-3">
                              Enter the <span className="font-bold text-gray-700">exact quantity</span> you gave to this customer today.
                              This is recorded for billing. (Expected: <span className="font-bold text-[#0D47A1]">{expectedTotal}L</span>)
                            </p>

                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => updateActualQty(d.id, -0.5)}
                                className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-gray-700 font-bold hover:bg-gray-200 active:scale-95 transition-all"
                              >
                                <Minus className="w-4 h-4" />
                              </button>

                              <div className="flex-1 relative">
                                <input
                                  type="number"
                                  value={currentActual}
                                  min="0"
                                  step="0.5"
                                  onChange={e => setActualQtyMap(prev => ({
                                    ...prev,
                                    [d.id]: Math.max(0, parseFloat(e.target.value) || 0),
                                  }))}
                                  className="w-full text-center text-2xl font-extrabold text-[#0D47A1] bg-blue-50 rounded-xl py-2.5 border-2 border-blue-200 outline-none focus:border-blue-400"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400">L</span>
                              </div>

                              <button
                                onClick={() => updateActualQty(d.id, 0.5)}
                                className="w-10 h-10 rounded-xl bg-[#0D47A1] flex items-center justify-center text-white font-bold hover:bg-blue-800 active:scale-95 transition-all"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>

                            {/* Show difference if partner provides less than expected */}
                            {currentActual !== expectedTotal && (
                              <p className={`text-[10px] font-bold mt-2 text-center ${
                                currentActual < expectedTotal ? 'text-amber-600' : 'text-green-600'
                              }`}>
                                {currentActual < expectedTotal
                                  ? `⚠ ${(expectedTotal - currentActual).toFixed(1)}L less than expected`
                                  : `+${(currentActual - expectedTotal).toFixed(1)}L more than expected`
                                }
                              </p>
                            )}
                          </div>

                          {/* Status Buttons */}
                          <div>
                            <p className="text-[10px] font-extrabold text-gray-500 uppercase tracking-wider mb-2">Mark Delivery Status:</p>
                            <div className="grid grid-cols-2 gap-2">
                              {STATUS_OPTIONS.map(opt => (
                                <button
                                  key={opt.value}
                                  onClick={() => handleMarkStatus(d, opt.value)}
                                  disabled={marking === d.id}
                                  className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all active:scale-95 disabled:opacity-60 ${
                                    d.status === opt.value
                                      ? opt.color + ' ring-2 ring-offset-1 ring-current shadow-sm'
                                      : 'bg-white border border-gray-200 text-gray-700 hover:border-gray-400'
                                  }`}
                                >
                                  {marking === d.id ? <Loader2 className="w-3 h-3 animate-spin inline mr-1" /> : null}
                                  {opt.label}
                                </button>
                              ))}
                            </div>
                            <p className="text-[9px] text-gray-400 font-medium mt-2 text-center">
                              GPS + timestamp captured automatically on submit
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
            )}
          </div>
        )}

        {/* ─── EARNINGS TAB ─── */}
        {location.pathname === '/delivery/earnings' && summary?.weeklyEarnings && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-extrabold text-gray-800">Earnings Overview</h2>
              <span className="text-[10px] font-bold text-[#0D47A1] bg-blue-50 px-2 py-1 rounded-md">This Week</span>
            </div>
            <div className="mb-4">
              <h3 className="text-2xl font-extrabold text-gray-800">₹{summary?.estimatedEarnings || 0}</h3>
              <p className="text-xs font-semibold text-green-600">Today's estimated earnings</p>
            </div>
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={summary.weeklyEarnings} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0D47A1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#0D47A1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af', fontWeight: 600 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af', fontWeight: 600 }} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px', fontWeight: 'bold' }} itemStyle={{ color: '#0D47A1' }} />
                  <Area type="monotone" dataKey="earnings" stroke="#0D47A1" strokeWidth={3} fillOpacity={1} fill="url(#colorEarnings)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* ─── PROFILE TAB ─── */}
        {location.pathname === '/delivery/profile' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center space-y-5">
            <div className="w-20 h-20 bg-blue-50 rounded-full mx-auto flex items-center justify-center border-4 border-white shadow-md">
              <User className="w-10 h-10 text-[#0D47A1]" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-gray-800">{name}</h2>
              <p className="text-sm text-gray-500 font-medium">Delivery Partner</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-4 text-left space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 font-medium">Today's Date</span>
                <span className="font-bold text-gray-800">{todayShort}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 font-medium">Total Deliveries</span>
                <span className="font-bold text-gray-800">{summary?.totalToday || 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 font-medium">Completed</span>
                <span className="font-bold text-green-600">{summary?.completed || 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 font-medium">Pending</span>
                <span className="font-bold text-orange-500">{summary?.pending || 0}</span>
              </div>
            </div>
            <button
              onClick={() => { localStorage.clear(); navigate('/login'); }}
              className="w-full py-3 bg-red-50 text-red-600 font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-red-100 transition-colors"
            >
              <LogOut className="w-4 h-4" /> Log Out
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default DeliveryDashboard;
