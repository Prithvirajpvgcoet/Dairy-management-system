const fs = require('fs');

let c = fs.readFileSync('frontend/src/components/deliveryBoy/DeliveryDashboard.jsx', 'utf8');

const imports = `import React, { useState, useEffect } from 'react';
import { Truck, CheckCircle2, AlertCircle, Loader2, MapPin, Navigation, User, Map as MapIcon, List as ListIcon } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import api from '../../api/client';`;

c = c.replace(/import React, { useState, useEffect } from 'react';\nimport {.*? } from 'lucide-react';\nimport api from '\.\.\/\.\.\/api\/client';/, imports);

const mapState = `
  const [viewMode, setViewMode] = useState('LIST'); // LIST or MAP
  
  // Custom marker styles based on status
  const getMarkerColor = (status) => {
    if (status === 'DELIVERED') return '#10B981'; // green
    if (status === 'PENDING') return '#3B82F6'; // blue
    if (status === 'CUSTOMER_SKIPPED') return '#9CA3AF'; // grey
    return '#EF4444'; // red
  };
`;
c = c.replace('const [loading, setLoading] = useState(true);', 'const [loading, setLoading] = useState(true);' + mapState);

const viewToggleUI = `
        <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 bg-white rounded-full shadow-lg p-1 flex">
          <button 
            onClick={() => setViewMode('LIST')}
            className={\`px-6 py-2 rounded-full text-sm font-bold transition-colors flex items-center gap-2 \${viewMode === 'LIST' ? 'bg-[#0D47A1] text-white' : 'text-gray-500'}\`}
          >
            <ListIcon className="w-4 h-4" /> List
          </button>
          <button 
            onClick={() => setViewMode('MAP')}
            className={\`px-6 py-2 rounded-full text-sm font-bold transition-colors flex items-center gap-2 \${viewMode === 'MAP' ? 'bg-[#0D47A1] text-white' : 'text-gray-500'}\`}
          >
            <MapIcon className="w-4 h-4" /> Map
          </button>
        </div>
`;

c = c.replace(
  '<h2 className="text-lg font-bold text-gray-800">Today\'s Delivery Route</h2>',
  viewToggleUI + '\n<h2 className="text-lg font-bold text-gray-800 mt-6">Today\'s Delivery Route</h2>'
);

const mapRender = `
            {viewMode === 'MAP' ? (
              <div className="h-[500px] w-full rounded-2xl overflow-hidden shadow-sm border border-gray-100 relative z-0">
                <MapContainer center={[18.5204, 73.8567]} zoom={13} style={{ height: '100%', width: '100%' }}>
                  <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
                  {route.map((d, index) => {
                    const lat = parseFloat(d.gps_lat) || 18.5204 + (Math.random() - 0.5) * 0.05;
                    const lng = parseFloat(d.gps_lng) || 73.8567 + (Math.random() - 0.5) * 0.05;
                    return (
                      <CircleMarker 
                        key={d.id} 
                        center={[lat, lng]} 
                        radius={8}
                        pathOptions={{ 
                          fillColor: getMarkerColor(d.status), 
                          fillOpacity: 0.9, 
                          color: '#ffffff', 
                          weight: 2 
                        }}
                      >
                        <Popup>
                          <div className="p-1">
                            <h3 className="font-bold text-gray-800 text-sm mb-1">{index + 1}. {d.customer_name}</h3>
                            <p className="text-xs text-gray-600 mb-2">{d.address}</p>
                            <span className={\`text-[10px] font-bold px-2 py-1 rounded \${statusStyle(d.status)}\`}>
                              {d.status}
                            </span>
                            {d.status === 'PENDING' && (
                              <div className="mt-3">
                                <a 
                                  href={\`https://www.google.com/maps/dir/?api=1&destination=\${lat},\${lng}\`}
                                  target="_blank" rel="noreferrer"
                                  className="w-full bg-[#0D47A1] text-white py-2 rounded text-xs font-bold text-center block"
                                >
                                  Navigate
                                </a>
                              </div>
                            )}
                          </div>
                        </Popup>
                      </CircleMarker>
                    );
                  })}
                </MapContainer>
              </div>
            ) : (
              <div className="space-y-3">
`;

// Find where route.map is in JSX
c = c.replace('<div className="space-y-3">', mapRender);

// Close the MAP wrapper
c = c.replace('</div>\n          </div>\n        </div>\n      </div>\n    </div>\n  );\n};', '</div>\n          )}</div>\n        </div>\n      </div>\n    </div>\n  );\n};');

fs.writeFileSync('frontend/src/components/deliveryBoy/DeliveryDashboard.jsx', c);
console.log('patched DeliveryDashboard for Map');
