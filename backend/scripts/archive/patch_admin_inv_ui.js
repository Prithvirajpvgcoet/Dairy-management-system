const fs = require('fs');

let c = fs.readFileSync('frontend/src/components/admin/Inventory.jsx', 'utf8');

const uiPatch = `
                          <span className={\`font-extrabold text-lg \${isShort ? 'text-red-600' : item.total_available < 10 ? 'text-amber-500' : 'text-green-600'}\`}>
                            {item.total_available}
                          </span>
                          {item.total_available < 10 && !isShort && (
                            <span className="ml-2 bg-amber-100 text-amber-700 text-[10px] px-2 py-0.5 rounded font-bold">LOW STOCK</span>
                          )}
                          <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                            <div className={\`h-1.5 rounded-full \${isShort ? 'bg-red-500' : item.total_available < 10 ? 'bg-amber-500' : 'bg-green-500'}\`} style={{ width: \`\${Math.min(100, (item.total_available / Math.max(item.required, 1)) * 100)}%\` }}></div>
                          </div>
`;

c = c.replace(
  /<span className=\{\`font-extrabold text-lg \$\{isShort \? 'text-red-600' : 'text-green-600'\}\`\}>\s*\{item\.total_available\}\s*<\/span>/m,
  uiPatch
);

// We should also show "Out" column maybe.
// Let's add a Stock Out col.
const headerPatch = `
                      <th className="px-6 py-4 font-bold text-gray-500 text-left">Stock In</th>
                      <th className="px-6 py-4 font-bold text-gray-500 text-left">Stock Out (Delivered)</th>
                      <th className="px-6 py-4 font-bold text-gray-500 text-left">Status</th>
`;
c = c.replace(
  '<th className="px-6 py-4 font-bold text-gray-500 text-left">Stock In</th>\n                      <th className="px-6 py-4 font-bold text-gray-500 text-left">Status</th>',
  headerPatch
);

const tdPatch = `
                        <td className="px-6 py-4 font-bold text-gray-700">
                          {item.stock_in} <span className="text-xs text-gray-400 font-medium">units</span>
                        </td>
                        <td className="px-6 py-4 font-bold text-gray-700">
                          {item.stock_out || 0} <span className="text-xs text-gray-400 font-medium">units</span>
                        </td>
                        <td className="px-6 py-4">
`;
c = c.replace(
  /<td className="px-6 py-4 font-bold text-gray-700">\s*\{item\.stock_in\} <span className="text-xs text-gray-400 font-medium">units<\/span>\s*<\/td>\s*<td className="px-6 py-4">/m,
  tdPatch
);

fs.writeFileSync('frontend/src/components/admin/Inventory.jsx', c);
console.log('patched admin inventory UI');
