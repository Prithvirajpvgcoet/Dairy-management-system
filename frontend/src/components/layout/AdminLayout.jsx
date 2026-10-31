import React from 'react';
import { 
  Home, 
  Truck, 
  FileText, 
  Package, 
  Users, 
  Archive, 
  CreditCard, 
  BarChart2, 
  UserPlus, 
  MapPin, 
  Settings,
  LogOut,
  AlertTriangle,
  Bell,
  Shield
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import NotificationBell from '../common/NotificationBell';

const AdminLayout = ({ children }) => {
  const location = useLocation();

  const menuItems = [
    { name: 'Dashboard', icon: Home, path: '/admin' },
    { name: 'Exceptions', icon: AlertTriangle, path: '/admin/exceptions' },
    { name: 'Route Assignment', icon: MapPin, path: '/admin/assign-route' },
    { name: 'Performance', icon: Users, path: '/admin/performance' },
    { name: 'Daily Logs', icon: Truck, path: '/admin/daily-logs' },
    { name: 'Monthly Billing', icon: FileText, path: '/admin/monthly-billing' },
    { name: 'Staff Management', icon: Shield, path: '/admin/staff-management' },
    { name: 'Inventory', icon: Archive, path: '/admin/inventory' },
    { name: 'Products', icon: Package, path: '/admin/products' },
    { name: 'Customers', icon: Users, path: '/admin/customers' },
    { name: 'Audit Logs', icon: Shield, path: '/admin/audit-logs' },
  ];

  return (
    <div className="flex h-screen bg-slate-50 font-['Poppins']">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col hidden md:flex">
        {/* Logo Area */}
        <div className="h-20 flex items-center justify-center border-b border-gray-100">
          <img src="/logo.jpeg" alt="Logo" className="h-12 object-contain" />
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;

              return (
                <li key={item.name}>
                  <Link
                    to={item.path}
                    className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                      isActive 
                        ? 'bg-[#0D47A1] text-white' 
                        : 'text-gray-600 hover:bg-gray-50 hover:text-[#0D47A1]'
                    }`}
                  >
                    <item.icon className={`w-5 h-5 mr-3 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        
        {/* Logout */}
        <div className="p-4 border-t border-gray-100">
          <Link to="/" className="flex items-center px-3 py-2 text-sm font-semibold text-gray-600 hover:text-red-600 transition-colors">
            <LogOut className="w-5 h-5 mr-3 text-gray-400 hover:text-red-600" />
            Logout
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen bg-slate-50 overflow-hidden">
        {/* Header Bar */}
        <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-end px-6 shadow-sm flex-shrink-0">
          <NotificationBell />
        </header>

        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
