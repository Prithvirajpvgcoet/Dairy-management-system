import React from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Navigation, CheckCircle2, Phone, MapPin } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';

export default function DeliveryRouteMap({ route = [], onMarkDelivered, markingId }) {
    // Default center Pune / Kothrud area if stops have coordinates
    const stopsWithCoords = route.filter(r => r.gps_lat && r.gps_lng);
    const centerLat = stopsWithCoords.length > 0 
        ? stopsWithCoords.reduce((sum, s) => sum + parseFloat(s.gps_lat), 0) / stopsWithCoords.length 
        : 18.5074;
    const centerLng = stopsWithCoords.length > 0 
        ? stopsWithCoords.reduce((sum, s) => sum + parseFloat(s.gps_lng), 0) / stopsWithCoords.length 
        : 73.8077;

    const getMarkerColor = (status) => {
        if (status === 'DELIVERED') return '#10B981'; // Green
        if (status === 'CUSTOMER_SKIPPED') return '#94A3B8'; // Slate grey
        if (status === 'NOT_DELIVERED' || status === 'DELIVERY_FAILED') return '#EF4444'; // Red
        return '#3B82F6'; // Blue pending
    };

    const handleGoogleNav = (stop) => {
        const dest = stop.gps_lat && stop.gps_lng 
            ? `${stop.gps_lat},${stop.gps_lng}` 
            : encodeURIComponent(stop.address);
        window.open(`https://www.google.com/maps/dir/?api=1&destination=${dest}`, '_blank');
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                    <h3 className="text-sm font-bold text-slate-800">Live Route Map</h3>
                    <p className="text-xs text-slate-500">{stopsWithCoords.length} of {route.length} stops pinned</p>
                </div>
                <div className="flex items-center gap-3 text-xs font-semibold">
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block"></span> Pending</span>
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span> Delivered</span>
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-slate-400 inline-block"></span> Skipped</span>
                </div>
            </div>

            <div className="h-[450px] w-full relative z-0">
                <MapContainer
                    center={[centerLat, centerLng]}
                    zoom={14}
                    scrollWheelZoom={false}
                    className="h-full w-full"
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    {stopsWithCoords.map((stop, idx) => {
                        const isDelivered = stop.status === 'DELIVERED';
                        const color = getMarkerColor(stop.status);

                        return (
                            <CircleMarker
                                key={stop.id || idx}
                                center={[parseFloat(stop.gps_lat), parseFloat(stop.gps_lng)]}
                                radius={isDelivered ? 8 : 10}
                                pathOptions={{
                                    fillColor: color,
                                    fillOpacity: 0.9,
                                    color: '#ffffff',
                                    weight: 2
                                }}
                            >
                                <Popup>
                                    <div className="p-1 min-w-[200px]">
                                        <div className="flex items-center justify-between mb-1.5">
                                            <span className="text-xs font-bold text-slate-900">Stop #{stop.stop_order || (idx + 1)}</span>
                                            <StatusBadge status={stop.status} />
                                        </div>
                                        <p className="text-sm font-bold text-slate-800">{stop.customer_name}</p>
                                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                                            <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
                                            {stop.address}
                                        </p>
                                        <p className="text-xs font-semibold text-blue-700 mt-1">
                                            Qty: {stop.actual_quantity || stop.expected_quantity} L
                                        </p>

                                        <div className="mt-3 flex items-center gap-2">
                                            {stop.status !== 'DELIVERED' && (
                                                <button
                                                    onClick={() => onMarkDelivered(stop, 'DELIVERED')}
                                                    disabled={markingId === stop.id}
                                                    className="flex-1 py-1.5 px-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1 shadow-sm transition-all"
                                                >
                                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                                    Delivered
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleGoogleNav(stop)}
                                                className="py-1.5 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                                            >
                                                <Navigation className="w-3.5 h-3.5 text-blue-600" />
                                                Nav
                                            </button>
                                        </div>
                                    </div>
                                </Popup>
                            </CircleMarker>
                        );
                    })}
                </MapContainer>
            </div>
        </div>
    );
}
