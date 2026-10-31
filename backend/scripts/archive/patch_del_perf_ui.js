const fs = require('fs');

let c = fs.readFileSync('frontend/src/components/deliveryBoy/DeliveryDashboard.jsx', 'utf8');

const perfState = `
  const [myPerf, setMyPerf] = useState(null);
`;
c = c.replace('const [viewMode, setViewMode] = useState(\'LIST\');', 'const [viewMode, setViewMode] = useState(\'LIST\');' + perfState);

c = c.replace(
  'const [routeRes, summaryRes] = await Promise.allSettled([',
  `const [routeRes, summaryRes, perfRes] = await Promise.allSettled([`
);

c = c.replace(
  'api.get(\'/delivery/summary\'),',
  'api.get(\'/delivery/summary\'),\n          api.get(\'/delivery/my-performance\'),'
);

c = c.replace(
  'const summaryData = summaryRes.status === \'fulfilled\' ? summaryRes.value.data : null;',
  `const perfData = perfRes.status === 'fulfilled' ? perfRes.value.data : null;
        if (perfData) setMyPerf(perfData);
        
        const summaryData = summaryRes.status === 'fulfilled' ? summaryRes.value.data : null;`
);

const perfUI = `
        {/* 📊 MY PERFORMANCE */}
        {myPerf && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mt-6 mb-8">
            <h3 className="text-sm font-extrabold text-gray-800 mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" /> My Performance (Last 30 Days)
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-xl text-center border border-gray-100">
                <p className="text-xs text-gray-500 font-bold mb-1">On-Time Rate</p>
                <p className={\`text-2xl font-black \${myPerf.on_time_rate >= 90 ? 'text-green-600' : 'text-orange-600'}\`}>
                  {myPerf.on_time_rate || 0}%
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl text-center border border-gray-100">
                <p className="text-xs text-gray-500 font-bold mb-1">Completed</p>
                <p className="text-2xl font-black text-gray-800">
                  {myPerf.total_delivered} <span className="text-xs text-gray-400">/ {myPerf.total_assigned}</span>
                </p>
              </div>
            </div>
          </div>
        )}
`;

c = c.replace('{/* 📋 END OF ROUTE LIST */}', '{/* 📋 END OF ROUTE LIST */}\n' + perfUI);

fs.writeFileSync('frontend/src/components/deliveryBoy/DeliveryDashboard.jsx', c);
console.log('patched DeliveryDashboard for Performance');
