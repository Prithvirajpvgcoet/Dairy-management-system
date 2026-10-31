import React from 'react';
import { Home, Truck, Wallet, User } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import NotificationBell from '../common/NotificationBell';

const DeliveryLayout = ({ children }) => {
  const location = useLocation();
  const tabs = [
    { name: 'Home', icon: Home, path: '/delivery' },
    { name: 'Deliveries', icon: Truck, path: '/delivery/route' },
    { name: 'Earnings', icon: Wallet, path: '/delivery/earnings' },
    { name: 'Profile', icon: User, path: '/delivery/profile' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-['Poppins'] pb-20 pt-16">
      {/* Top Header */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-100 flex items-center justify-between px-4 z-50">
        <h1 className="text-lg font-bold text-slate-800">Partner App</h1>
        <NotificationBell />
      </header>
      <div className="max-w-md mx-auto">
        {children}
      </div>
      {/* Bottom Tab Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 shadow-[0_-4px_6px_-1px_rgb(0,0,0,0.05)] z-50">
        <div className="max-w-md mx-auto flex">
          {tabs.map(tab => {
            const isActive = location.pathname === tab.path;
            return (
              <Link key={tab.name} to={tab.path} className="flex-1 flex flex-col items-center py-3 relative transition-all duration-300">
                {isActive && (
                  <div className="absolute -top-5 w-12 h-12 bg-[#0D47A1] rounded-full flex items-center justify-center shadow-lg shadow-blue-900/30">
                    <tab.icon className="w-5 h-5 text-white" />
                  </div>
                )}
                {!isActive && <tab.icon className="w-5 h-5 text-gray-400 group-hover:text-[#0D47A1] transition-colors" />}
                <span className={`text-[10px] font-bold mt-1 transition-all ${isActive ? 'text-[#0D47A1] mt-7' : 'text-gray-400'}`}>
                  {tab.name}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default DeliveryLayout;
