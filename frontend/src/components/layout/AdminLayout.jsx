import React, { useState } from 'react';
import { 
  Home, 
  Truck, 
  FileText, 
  Package, 
  Users, 
  Archive, 
  MapPin, 
  LogOut,
  AlertTriangle,
  Shield,
  Menu,
  X
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import NotificationBell from '../common/NotificationBell';

const ROLE_PERMISSIONS = {
  ADMIN: ['Dashboard', 'Exceptions', 'Route Assignment', 'Performance', 'Daily Logs', 'Monthly Billing', 'Staff Management', 'Inventory', 'Products', 'Customers', 'Audit Logs'],
  INVENTORY_MNGR: ['Dashboard', 'Inventory', 'Products', 'Daily Logs'],
  BILLING_CLERK: ['Dashboard', 'Monthly Billing', 'Daily Logs', 'Exceptions'],
  SUPPORT: ['Dashboard', 'Customers', 'Exceptions', 'Route Assignment', 'Performance']
};

const ALL_MENU_ITEMS = [
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

const AdminLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const role = localStorage.getItem('role') || 'ADMIN';
  const name = localStorage.getItem('name') || 'Staff';

  const allowedNames = ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.ADMIN;
  const filteredMenuItems = ALL_MENU_ITEMS.filter(item => allowedNames.includes(item.name));

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-slate-50 font-['Poppins']">
      {/* Desktop Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col">
        {/* Logo Area */}
        <div className="h-20 flex items-center px-6 border-b border-gray-100">
          <img src="/logo.jpeg" alt="Amarale Dairy" className="h-10 object-contain rounded-md" />
          <div className="ml-3">
            <span className="block font-bold text-slate-800 text-sm leading-tight">Amarale Dairy</span>
            <span className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider">{role.replace('_', ' ')}</span>
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            {filteredMenuItems.map((item) => {
              const isActive = location.pathname === item.path;

              return (
                <li key={item.name}>
                  <Link
                    to={item.path}
                    className={`flex items-center px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                      isActive 
                        ? 'bg-[#0D47A1] text-white shadow-sm' 
                        : 'text-gray-600 hover:bg-slate-50 hover:text-[#0D47A1]'
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
        
        {/* User Info & Logout */}
        <div className="p-4 border-t border-gray-100">
          <div className="px-3 py-2 mb-2 bg-slate-50 rounded-xl">
            <p className="text-xs font-semibold text-slate-700 truncate">{name}</p>
            <p className="text-[10px] text-slate-400 truncate">{role}</p>
          </div>
          <button 
            onClick={handleLogout} 
            className="w-full flex items-center px-3 py-2 text-sm font-semibold text-gray-600 hover:text-red-600 transition-colors bg-transparent border-none cursor-pointer rounded-xl hover:bg-rose-50"
          >
            <LogOut className="w-5 h-5 mr-3 text-gray-400 hover:text-red-600" />
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile Drawer Backdrop */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Slide-over Drawer */}
      <div className={`fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out md:hidden ${
        mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-100">
          <div className="flex items-center">
            <img src="/logo.jpeg" alt="Logo" className="h-8 object-contain rounded" />
            <span className="ml-2 font-bold text-slate-800 text-sm">Amarale Dairy</span>
          </div>
          <button 
            onClick={() => setMobileMenuOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <ul className="space-y-1">
            {filteredMenuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <li key={item.name}>
                  <Link
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                      isActive 
                        ? 'bg-[#0D47A1] text-white shadow-sm' 
                        : 'text-gray-600 hover:bg-slate-50 hover:text-[#0D47A1]'
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

        <div className="p-4 border-t border-gray-100">
          <button 
            onClick={handleLogout} 
            className="w-full flex items-center px-3 py-2.5 text-sm font-semibold text-rose-600 hover:bg-rose-50 rounded-xl"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen bg-slate-50 overflow-hidden">
        {/* Header Bar */}
        <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-4 sm:px-6 shadow-sm flex-shrink-0">
          <div className="flex items-center">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 mr-2 text-slate-600 rounded-lg hover:bg-slate-100 md:hidden"
              aria-label="Open mobile menu"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-base sm:text-lg font-bold text-slate-800 truncate">
              {filteredMenuItems.find(i => i.path === location.pathname)?.name || 'Admin Portal'}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <NotificationBell />
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
