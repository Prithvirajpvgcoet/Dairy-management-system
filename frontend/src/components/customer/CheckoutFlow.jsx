import toast from 'react-hot-toast';
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MapPin, CreditCard, Wallet, Smartphone, ShieldCheck, ArrowLeft, Loader2, CheckCircle2, ChevronRight, QrCode } from 'lucide-react';
import api from '../../api/client';

const CheckoutFlow = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { type, items, total, dailyCost } = location.state || {};

  const [step, setStep] = useState(1);
  const [address, setAddress] = useState('Loading...');
  const [paymentMethod, setPaymentMethod] = useState('UPI'); // UPI, CARD, NETBANKING, WALLET, COD
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [userName, setUserName] = useState('Rahul Sharma');
  const [orderId, setOrderId] = useState('#ORD123456');

  useEffect(() => {
    if (!type || (!items && type === 'ONE_TIME')) {
      navigate('/customer');
      return;
    }
    fetchAddress();
  }, [type, items, navigate]);

  const fetchAddress = async () => {
    try {
      const res = await api.get('/customer/account');
      if (res) {
        setAddress(res.data.address || '123, Ganesh Nagar, Pune - 411001, Maharashtra');
        setUserName(res.data.name || 'Rahul Sharma');
      }
    } catch (error) {
      console.error("Failed to fetch address", error);
      setAddress('123, Ganesh Nagar, Pune - 411001, Maharashtra');
    }
  };

  const handleProcessPayment = async () => {
    setIsProcessing(true);
    
    try {
      if (paymentMethod !== 'COD') {
        toast('Opening secure payment gateway...', { icon: '🔒' });
        // Mock processing
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      const endpoint = type === 'SUBSCRIPTION' ? '/customer/checkout-subscription' : '/customer/checkout-onetime';
      const data = type === 'ONE_TIME' ? { items: items.map(i => ({ product_id: i.product_id || i.id, quantity: i.quantity, price_per_unit: i.price_per_unit })) } : {};
      
      const res = await api.post(endpoint, data);
      
      if (type === 'ONE_TIME') {
        localStorage.removeItem('oneTimeCart');
        window.dispatchEvent(new Event('cartCleared'));
      }
      
      setIsProcessing(false);
      setIsSuccess(true);
      toast.success('Payment successful!');
      setOrderId('#ORD' + Math.floor(100000 + Math.random() * 900000));
      
    } catch (error) {
      console.error("Payment failed", error);
      setIsProcessing(false);
      toast.error('Payment processing error.');
    }
  };

  const displayItems = items || [];
  const displayTotal = total || 0;

  // Render Step 3: SUCCESS SCREEN (Blue background with milk splash)
  if (isSuccess) {
    return (
      <div className="min-h-screen bg-[#0D47A1] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden font-['Poppins']">
        <div className="absolute top-1/4 w-full flex justify-center z-10 animate-bounce">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center shadow-xl border-4 border-white">
            <CheckCircle2 className="w-10 h-10 text-white" />
          </div>
        </div>
        
        <div className="relative z-10 text-center mt-32 mb-10 w-full max-w-md">
          <h2 className="text-2xl font-extrabold mb-2">Payment Successful!</h2>
          <p className="text-blue-200 text-sm mb-8">Your order has been placed successfully.</p>
          
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 text-left mb-8">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-medium text-blue-200">Order ID</span>
              <span className="text-sm font-bold">{orderId}</span>
            </div>
            <div className="flex justify-between items-center pb-4 border-b border-white/20 mb-4">
              <span className="text-sm font-medium text-blue-200">Amount Paid</span>
              <span className="text-xl font-extrabold">₹{displayTotal}</span>
            </div>
            <p className="text-xs text-blue-100 text-center font-medium leading-relaxed">
              Your order will be delivered<br/>tomorrow between 6:30 AM - 7:00 AM
            </p>
          </div>
          
          <button onClick={() => navigate('/customer/orders')} className="w-full bg-white text-[#0D47A1] py-3.5 rounded-xl font-bold mb-4 shadow-lg hover:bg-blue-50 transition-colors">
            View Order
          </button>
          <button onClick={() => navigate('/customer')} className="w-full bg-transparent border border-white/50 text-white py-3.5 rounded-xl font-bold hover:bg-white/10 transition-colors">
            Back to Home
          </button>
        </div>
        
        {/* Milk Splash Bottom Background */}
        <div className="absolute bottom-0 left-0 w-full h-[40%] bg-[url('/images/product2.png')] bg-cover bg-bottom opacity-20 pointer-events-none mix-blend-screen"></div>
        <div className="absolute -bottom-20 w-[150%] h-[50%] bg-white blur-3xl opacity-10 rounded-[100%]"></div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen font-['Poppins'] pb-24 md:pb-10">
      
      {/* Header */}
      <div className="bg-white px-5 py-4 flex items-center shadow-sm sticky top-0 z-10">
        <button onClick={() => step === 2 ? setStep(1) : navigate(-1)} className="mr-4 text-gray-600 hover:text-[#0D47A1]">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-extrabold text-gray-900">{step === 1 ? 'Checkout' : 'Payment Interface'}</h1>
      </div>

      <div className="max-w-4xl mx-auto p-4 md:p-8 flex flex-col md:flex-row gap-6">
        
        {/* ─── LEFT COLUMN / STEP 1: CHECKOUT PAGE ─── */}
        {step === 1 && (
          <div className="w-full space-y-4">
            
            {/* Address */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-extrabold text-gray-900">Delivery Address</h3>
                <button className="text-[10px] font-bold text-[#0D47A1] uppercase tracking-wider">Change</button>
              </div>
              <p className="text-sm font-bold text-gray-800 mb-1">{userName}</p>
              <p className="text-xs text-gray-500 font-medium leading-relaxed max-w-sm">{address}</p>
            </div>

            {/* Delivery Slot */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-extrabold text-gray-900">Delivery Slot</h3>
                <button className="text-[10px] font-bold text-[#0D47A1] uppercase tracking-wider">Change</button>
              </div>
              <p className="text-sm font-bold text-[#0D47A1] flex items-center bg-blue-50 w-fit px-3 py-1.5 rounded-lg">
                <Clock className="w-4 h-4 mr-2" /> Tomorrow, 6:30 AM - 7:00 AM
              </p>
            </div>

            {/* Order Summary */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h3 className="text-sm font-extrabold text-gray-900 mb-4">Order Summary <span className="text-gray-400 font-medium text-xs ml-1">({displayItems.length} items)</span></h3>
              
              <div className="space-y-4 mb-4">
                {displayItems.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center pb-4 border-b border-gray-50">
                    <div>
                      <p className="text-sm font-bold text-gray-800">{item.name}</p>
                      <p className="text-xs font-semibold text-gray-500 mt-1">₹{item.price_per_unit} x {item.quantity}</p>
                    </div>
                    <p className="text-sm font-extrabold text-gray-900">₹{item.price_per_unit * item.quantity}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-2 mb-4 pt-2">
                <div className="flex justify-between text-xs font-semibold text-gray-500">
                  <span>Subtotal</span>
                  <span className="text-gray-800">₹{displayTotal}</span>
                </div>
                <div className="flex justify-between text-xs font-semibold text-gray-500">
                  <span>Delivery Charges</span>
                  <span className="text-green-600 font-bold">Free</span>
                </div>
              </div>
              
              <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                <span className="text-sm font-extrabold text-gray-900">Total Amount</span>
                <span className="text-xl font-extrabold text-[#0D47A1]">₹{displayTotal}</span>
              </div>
            </div>

            {/* Add Note */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h3 className="text-sm font-extrabold text-gray-900 mb-3">Add a Note (Optional)</h3>
              <textarea 
                className="w-full bg-slate-50 border border-gray-100 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D47A1]/20 focus:border-[#0D47A1]"
                rows="2"
                placeholder="Write your note here..."
              ></textarea>
            </div>

            <button 
              onClick={() => setStep(2)}
              className="w-full bg-[#0D47A1] text-white py-3.5 rounded-xl font-bold shadow-lg shadow-blue-900/20 flex justify-between items-center px-6 active:scale-95 transition-transform"
            >
              <span className="flex flex-col items-start">
                <span className="text-xs text-blue-200">Total</span>
                <span className="text-lg">₹{displayTotal}</span>
              </span>
              <span className="flex items-center">Proceed to Payment <ChevronRight className="w-5 h-5 ml-2" /></span>
            </button>
          </div>
        )}

        {/* ─── RIGHT COLUMN / STEP 2: PAYMENT INTERFACE ─── */}
        {step === 2 && (
          <div className="w-full space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-6">
                {/* Order Details */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                  <h3 className="text-sm font-extrabold text-gray-900 mb-4">Order Details</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between pb-4 border-b border-gray-50">
                      <span className="text-xs font-semibold text-gray-500">Order ID</span>
                      <span className="text-xs font-bold text-gray-900">#ORD123456</span>
                    </div>
                    <div className="flex justify-between pb-4 border-b border-gray-50">
                      <span className="text-xs font-semibold text-gray-500 w-1/3">Delivery Address</span>
                      <span className="text-xs font-bold text-gray-900 text-right w-2/3">{address}</span>
                    </div>
                    <div className="flex justify-between pb-4 border-b border-gray-50">
                      <span className="text-xs font-semibold text-gray-500">Delivery Slot</span>
                      <span className="text-xs font-bold text-gray-900">Tomorrow, 6:30 AM - 7:00 AM</span>
                    </div>
                    <div className="flex justify-between pt-2">
                      <span className="text-sm font-extrabold text-gray-900">Total Amount</span>
                      <span className="text-lg font-extrabold text-[#0D47A1]">₹{displayTotal}</span>
                    </div>
                  </div>
                </div>

                {/* Choose Payment Method */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                  <h3 className="text-sm font-extrabold text-gray-900 mb-4">Choose Payment Method</h3>
                  <div className="space-y-3">
                    {[
                      { id: 'UPI', label: 'UPI', sub: 'Pay using any UPI app', icon: Smartphone, icons: ['/upi.png'] },
                      { id: 'CARD', label: 'Card', sub: 'Visa, Mastercard, Rupay', icon: CreditCard, icons: [] },
                      { id: 'NETBANKING', label: 'Net Banking', sub: 'All major banks supported', icon: ShieldCheck, icons: [] },
                      { id: 'WALLET', label: 'Wallet', sub: 'Paytm, PhonePe, Amazon Pay', icon: Wallet, icons: [] },
                      { id: 'COD', label: 'Cash on Delivery', sub: 'Pay when you receive', icon: Wallet, icons: [] },
                    ].map(method => (
                      <label key={method.id} className={`flex items-center p-3 border rounded-xl cursor-pointer transition-colors ${paymentMethod === method.id ? 'border-[#0D47A1] bg-blue-50' : 'border-gray-100 hover:bg-slate-50'}`}>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-4 ${paymentMethod === method.id ? 'border-[#0D47A1]' : 'border-gray-300'}`}>
                          {paymentMethod === method.id && <div className="w-2.5 h-2.5 bg-[#0D47A1] rounded-full"></div>}
                        </div>
                        <input type="radio" name="payment" value={method.id} checked={paymentMethod === method.id} onChange={(e) => setPaymentMethod(e.target.value)} className="hidden" />
                        <div className="flex-1">
                          <p className={`text-sm font-bold ${paymentMethod === method.id ? 'text-[#0D47A1]' : 'text-gray-800'}`}>{method.label}</p>
                          <p className="text-xs text-gray-500 font-medium">{method.sub}</p>
                        </div>
                        <method.icon className={`w-5 h-5 ${paymentMethod === method.id ? 'text-[#0D47A1]' : 'text-gray-400'}`} />
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Scan & Pay QR (Only show if UPI selected, otherwise show payment button) */}
              <div className="space-y-6">
                {paymentMethod === 'UPI' && (
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
                    <h3 className="text-sm font-extrabold text-gray-900 mb-6">Scan & Pay</h3>
                    <div className="w-48 h-48 bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl flex items-center justify-center mb-6 relative">
                      <QrCode className="w-24 h-24 text-gray-300" />
                      {/* Fake scanner line */}
                      <div className="absolute top-1/2 left-0 w-full h-0.5 bg-[#0D47A1] shadow-[0_0_10px_#0D47A1] animate-[ping_3s_infinite]"></div>
                    </div>
                    <p className="text-sm font-bold text-gray-900 mb-2">UPI ID: amarale@upi</p>
                    <p className="text-xs text-[#0D47A1] font-semibold cursor-pointer">Or pay using UPI ID</p>
                  </div>
                )}

                <button 
                  onClick={handleProcessPayment}
                  disabled={isProcessing}
                  className="w-full bg-[#0D47A1] text-white py-4 rounded-xl font-extrabold shadow-lg shadow-blue-900/20 flex justify-center items-center active:scale-95 transition-transform disabled:opacity-70 disabled:active:scale-100"
                >
                  {isProcessing ? (
                    <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Processing...</>
                  ) : (
                    `Pay ₹${displayTotal}`
                  )}
                </button>
              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
};

export default CheckoutFlow;
