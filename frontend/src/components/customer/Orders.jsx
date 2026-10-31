import React, { useState, useEffect } from 'react';
import { Package, Clock, CheckCircle2, XCircle, Loader2, CreditCard, ShoppingCart, Truck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/client';

const Orders = () => {
  const [data, setData] = useState({ pastOrders: [] });
  const [oneTimeCartItems, setOneTimeCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkingOutOneTime, setCheckingOutOneTime] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/customer/orders');
      if (res) {
        setData(res.data);
        
        // Build one time cart with product details
        const savedCart = localStorage.getItem('oneTimeCart');
        if (savedCart) {
          const cartMap = JSON.parse(savedCart);
          const dashRes = await api.get('/customer/dashboard');
          if (dashRes) {
            const dashData = dashRes.data;
            const fullProducts = dashData.products;
            
            const otItems = [];
            for (const [id, qty] of Object.entries(cartMap)) {
              if (qty > 0) {
                const product = fullProducts.find(p => p.id === parseInt(id));
                if (product) {
                  otItems.push({
                    product_id: product.id,
                    name: product.name,
                    quantity: qty,
                    price_per_unit: product.price_per_unit,
                    unit: product.unit,
                    icon: product.icon
                  });
                }
              }
            }
            setOneTimeCartItems(otItems);
          }
        }
      }
    } catch (error) {
      console.error("Failed to fetch orders", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckoutOneTime = () => {
    navigate('/customer/checkout', {
      state: {
        type: 'ONE_TIME',
        items: oneTimeCartItems,
        total: otTotalAmount
      }
    });
  };

  if (loading) {
      return <div className="flex-1 flex justify-center items-center h-full min-h-[50vh]"><Loader2 className="w-8 h-8 animate-spin text-[#1551b5]" /></div>;
  }

  const getStatusColor = (status) => {
    if(status === 'DELIVERED') return 'text-green-600 bg-green-50 border-green-200';
    if(status === 'MISSED') return 'text-red-600 bg-red-50 border-red-200';
    return 'text-orange-600 bg-orange-50 border-orange-200';
  };

  const getStatusIcon = (status) => {
    if(status === 'DELIVERED') return <CheckCircle2 className="w-5 h-5 text-green-500" />;
    if(status === 'MISSED') return <XCircle className="w-5 h-5 text-red-500" />;
    return <Clock className="w-5 h-5 text-orange-500" />;
  };

  const otTotalAmount = oneTimeCartItems.reduce((sum, item) => sum + (item.quantity * item.price_per_unit), 0);

  return (
    <div className="md:p-2 bg-slate-50 min-h-full">
      <div className="max-w-6xl mx-auto space-y-8 p-4 md:p-6">
        
        {/* Header */}
        <div className="flex items-center">
          <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center mr-4">
            <Package className="w-6 h-6 text-[#1551b5]" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-gray-800">My Orders</h2>
            <p className="text-sm text-gray-500 font-medium">Manage one-time purchases and view delivery history.</p>
          </div>
        </div>

        {/* ONE-TIME Cart / Checkout Section */}
        {oneTimeCartItems.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-orange-500/30 overflow-hidden relative">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-orange-500"></div>
            <div className="p-6 md:p-8">
              <div className="flex items-center mb-6">
                <ShoppingCart className="w-6 h-6 text-orange-500 mr-3" />
                <h3 className="text-xl font-bold text-gray-800">One-Time Purchase Cart</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {oneTimeCartItems.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between border border-gray-100 rounded-xl p-4 shadow-sm hover:border-orange-200 transition-colors">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center text-xl mr-3">📦</div>
                      <div>
                        <p className="text-sm font-bold text-gray-800">{item.name}</p>
                        <p className="text-xs text-gray-500 font-medium">{item.quantity} x {item.unit}</p>
                      </div>
                    </div>
                    <div className="text-base font-bold text-gray-800">
                      ₹{item.quantity * item.price_per_unit}
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-orange-50 rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border border-orange-100">
                <div>
                  <p className="text-xs text-orange-800 uppercase tracking-wider font-bold mb-1">Total Amount</p>
                  <p className="text-3xl font-extrabold text-orange-600">₹{otTotalAmount}</p>
                </div>
                <button 
                  onClick={handleCheckoutOneTime}
                  disabled={checkingOutOneTime}
                  className="w-full md:w-auto bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 px-8 rounded-xl shadow-lg shadow-orange-500/20 transition-all flex items-center justify-center disabled:opacity-70 active:scale-95"
                >
                  <CreditCard className="w-5 h-5 mr-2" />
                  Checkout & Buy
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Past Deliveries */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 md:p-8 border-b border-gray-100">
            <h3 className="text-xl font-extrabold text-gray-800">Daily Delivery History</h3>
            <p className="text-sm text-gray-500 font-medium mt-1">A record of your daily subscription deliveries.</p>
          </div>
          
          {data.pastOrders?.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-gray-300" />
              </div>
              <p className="text-gray-500 font-medium">No recent deliveries found.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {data.pastOrders.map(order => (
                <div key={order.id} className="p-6 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start">
                    <div className="mt-1 mr-4 bg-white rounded-full shadow-sm">{getStatusIcon(order.status)}</div>
                    <div>
                      <p className="font-extrabold text-gray-800 mb-1 text-base">
                        {new Date(order.date).toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                      </p>
                      <p className="text-sm text-gray-500 font-medium flex items-center gap-1">
                        <Truck className="w-4 h-4" /> Delivered by: <span className="font-bold text-gray-700">{order.delivery_boy || 'Pending Assignment'}</span>
                      </p>
                    </div>
                  </div>
                  <div className="ml-9 sm:ml-0">
                    <span className={`px-4 py-1.5 rounded-lg text-xs font-bold border ${getStatusColor(order.status)} uppercase tracking-wider`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Orders;
