import React from 'react';
import { 
  Home, 
  ShoppingBag, 
  Calendar, 
  FileText, 
  User, 
  Menu,
  Bell,
  ShoppingCart,
  LogOut,
  Droplets
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import api from '../../api/client';

const CustomerLayout = ({ children }) => {
  const location = useLocation();
  const [userName, setUserName] = React.useState('');

  React.useEffect(() => {
    fetchAccountDetails();
  }, []);

  const fetchAccountDetails = async () => {
    try {
      const res = await api.get('/customer/account');
      if (res) {
        setUserName(res.data.name);
      }
    } catch (error) {
      console.error("Failed to fetch layout account details", error);
    }
  };

  const getInitials = (name) => name ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'CU';

  const navItems = [
    { name: 'Home', icon: Home, path: '/customer' },
    { name: 'Orders', icon: ShoppingBag, path: '/customer/orders' },
    { name: 'Daily Req', icon: Droplets, path: '/customer/requirement' },
    { name: 'Bills', icon: FileText, path: '/customer/bills' },
    { name: 'Account', icon: User, path: '/customer/account' },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50 font-['Poppins']">
      
      {/* Desktop Sidebar (Hidden on mobile) */}
      <aside className="w-64 bg-white border-r border-gray-100 hidden md:flex flex-col z-20 shadow-sm fixed h-full">
        <div className="h-20 flex items-center justify-center border-b border-gray-100 p-4">
          <img src="/images/logo.jpg" alt="Logo" className="h-10 w-10 rounded-lg object-cover mr-3 shadow-sm" />
          <span className="text-xl font-extrabold text-[#0D47A1]">अमराळे</span>
        </div>
        <nav className="flex-1 overflow-y-auto py-6">
          <ul className="space-y-2 px-4">
            {navItems.map((item, idx) => {
              const isActive = location.pathname === item.path;
              return (
                <li key={idx}>
                  <Link
                    to={item.path}
                    className={`flex items-center px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                      isActive 
                        ? 'bg-[#0D47A1] text-white shadow-md shadow-blue-900/20' 
                        : 'text-gray-500 hover:bg-blue-50 hover:text-[#0D47A1]'
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
            onClick={() => {
              localStorage.clear();
              window.location.href = '/';
            }} 
            className="flex items-center px-4 py-3 text-sm font-bold text-gray-500 hover:bg-red-50 hover:text-red-600 rounded-xl transition-colors w-full text-left"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Logout
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col relative w-full md:pl-64">
        
        {/* Mobile Top Header (Hidden on Desktop) */}
        <header className="md:hidden bg-white px-5 py-4 flex items-center justify-between z-10 sticky top-0 shadow-sm">
          <div className="flex items-center gap-2">
            <img src="/images/logo.jpg" alt="Logo" className="h-8 w-8 rounded-md object-cover shadow-sm" />
            <span className="text-lg font-extrabold text-[#0D47A1]">अमराळे</span>
          </div>
          <div className="flex space-x-3">
            <button className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-gray-500 hover:text-[#0D47A1] hover:bg-blue-50 transition-colors relative">
              <Bell className="w-4 h-4" />
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </button>
            <button className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-gray-500 hover:text-[#0D47A1] hover:bg-blue-50 transition-colors">
              <ShoppingCart className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Desktop Top Header */}
        <header className="hidden md:flex bg-white h-20 px-8 items-center justify-end border-b border-gray-100 z-10 sticky top-0 space-x-6">
           <button className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-gray-500 hover:text-[#0D47A1] hover:bg-blue-50 transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
           </button>
           <button className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-gray-500 hover:text-[#0D47A1] hover:bg-blue-50 transition-colors">
              <ShoppingCart className="w-5 h-5" />
           </button>
           <div className="flex items-center pl-6 border-l border-gray-100">
             <div className="w-10 h-10 rounded-full bg-[#0D47A1] text-white flex items-center justify-center font-bold text-sm shadow-md cursor-pointer border-2 border-blue-100">
                {getInitials(userName)}
             </div>
           </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 w-full pb-20 md:pb-0 bg-slate-50 relative overflow-y-auto">
          <div className="max-w-7xl mx-auto w-full h-full min-h-[calc(100vh-80px)] p-0 md:p-8">
            {children}
          </div>
        </main>

        {/* Mobile Bottom Navigation Bar (Hidden on Desktop) */}
        <nav className="md:hidden fixed bottom-0 w-full bg-white border-t border-gray-100 z-50 shadow-[0_-4px_6px_-1px_rgb(0,0,0,0.05)] pb-safe">
          <ul className="flex justify-around items-end h-16 px-2">
            {navItems.map((item, idx) => {
              const isActive = location.pathname === item.path;
              return (
                <li key={idx} className="flex-1">
                  <Link
                    to={item.path}
                    className={`flex flex-col items-center justify-center w-full pb-3 transition-all relative ${
                      isActive ? 'text-[#0D47A1]' : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    {isActive && (
                      <div className="absolute -top-5 w-12 h-12 bg-[#0D47A1] rounded-full flex items-center justify-center shadow-lg shadow-blue-900/30 text-white">
                        <item.icon className="w-5 h-5" />
                      </div>
                    )}
                    {!isActive && <item.icon className="w-5 h-5 mb-1" />}
                    
                    <span className={`text-[10px] font-bold text-center leading-tight transition-all ${isActive ? 'mt-6' : ''}`}>
                      {item.name}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default CustomerLayout;
