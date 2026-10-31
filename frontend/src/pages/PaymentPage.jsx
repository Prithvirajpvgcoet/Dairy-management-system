import React, { useState } from 'react';
import { CreditCard, Wallet, Smartphone, Landmark, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const PaymentPage = () => {
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  if (paymentSuccess) {
    return (
      <div className="min-h-screen bg-[#0f3460] flex items-center justify-center p-4 relative overflow-hidden">
        {/* Decorative milk splash elements can go here */}
        <div className="absolute bottom-0 left-0 w-full z-0 opacity-50 translate-y-12">
           <img src="/hero-bottle.png" alt="" className="w-full h-48 object-cover object-bottom" />
        </div>
        
        <div className="z-10 flex flex-col items-center w-full max-w-sm">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(34,197,94,0.4)]">
            <CheckCircle2 className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Payment Successful!</h1>
          <p className="text-sm text-blue-200 text-center mb-8 px-4">Your order has been placed successfully.</p>
          
          <div className="w-full bg-white/10 rounded-xl p-5 mb-8 backdrop-blur-sm border border-white/20">
            <div className="flex justify-between items-center border-b border-white/10 pb-3 mb-3">
              <span className="text-xs text-blue-200">Order ID</span>
              <span className="text-sm font-bold text-white">#ORD123456</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-blue-200">Amount Paid</span>
              <span className="text-sm font-bold text-white">₹309</span>
            </div>
          </div>

          <p className="text-xs text-blue-200 text-center mb-8 px-8 leading-relaxed">
            Your order will be delivered<br/>tomorrow between <span className="font-bold text-white">6:30 AM - 7:00 AM</span>
          </p>

          <button className="w-full bg-transparent border border-white text-white font-bold py-3 rounded-lg hover:bg-white hover:text-[#0f3460] transition-colors mb-4">
            View Order
          </button>
          <Link to="/" className="w-full block text-center bg-white text-[#0f3460] font-bold py-3 rounded-lg hover:bg-blue-50 transition-colors shadow-lg">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex justify-center p-4 md:p-8 font-sans">
      <div className="w-full max-w-5xl">
        <h1 className="text-2xl font-bold text-[#1551b5] mb-6">PAYMENT INTERFACE</h1>
        
        <div className="grid md:grid-cols-3 gap-8">
          
          {/* Order Details Column */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-800 text-sm mb-4">Order Details</h3>
              
              <div className="space-y-4">
                <div>
                  <p className="text-[10px] text-gray-500 font-semibold mb-1">Order ID</p>
                  <p className="text-xs font-bold text-gray-800">#ORD123456</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 font-semibold mb-1">Delivery Address</p>
                  <h4 className="text-xs font-bold text-gray-800 mb-0.5">Rahul Sharma</h4>
                  <p className="text-[10px] text-gray-500 leading-tight">123, Ganesh Nagar,<br/>Pune - 411001</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 font-semibold mb-1">Delivery Slot</p>
                  <p className="text-xs font-bold text-gray-800">Tomorrow, 6:30 AM - 7:00 AM</p>
                </div>
                <div className="pt-4 border-t border-gray-100">
                  <p className="text-[10px] text-gray-500 font-semibold mb-1">Total Amount</p>
                  <h3 className="text-xl font-bold text-[#1551b5]">₹309</h3>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Methods Column */}
          <div className="md:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
             <h3 className="font-bold text-gray-800 text-sm mb-6">Choose Payment Method</h3>
             
             <div className="space-y-4">
               {/* UPI */}
               <label className="flex items-center justify-between p-3 border border-gray-200 rounded-lg cursor-pointer hover:border-[#1551b5] bg-blue-50/30">
                 <div className="flex items-start">
                   <input type="radio" name="payment" className="mt-1 mr-3 text-[#1551b5] focus:ring-[#1551b5]" defaultChecked />
                   <div>
                     <h4 className="text-xs font-bold text-gray-800">UPI</h4>
                     <p className="text-[10px] text-gray-500 mt-0.5">Pay using any UPI app</p>
                   </div>
                 </div>
                 <Smartphone className="w-5 h-5 text-gray-400" />
               </label>

               {/* Card */}
               <label className="flex items-center justify-between p-3 border border-gray-100 rounded-lg cursor-pointer hover:border-[#1551b5]">
                 <div className="flex items-start">
                   <input type="radio" name="payment" className="mt-1 mr-3" />
                   <div>
                     <h4 className="text-xs font-bold text-gray-800">Card</h4>
                     <p className="text-[10px] text-gray-500 mt-0.5">Visa, Mastercard, Rupay</p>
                   </div>
                 </div>
                 <CreditCard className="w-5 h-5 text-gray-400" />
               </label>

               {/* Net Banking */}
               <label className="flex items-center justify-between p-3 border border-gray-100 rounded-lg cursor-pointer hover:border-[#1551b5]">
                 <div className="flex items-start">
                   <input type="radio" name="payment" className="mt-1 mr-3" />
                   <div>
                     <h4 className="text-xs font-bold text-gray-800">Net Banking</h4>
                     <p className="text-[10px] text-gray-500 mt-0.5">All major banks supported</p>
                   </div>
                 </div>
                 <Landmark className="w-5 h-5 text-gray-400" />
               </label>

               {/* Wallet */}
               <label className="flex items-center justify-between p-3 border border-gray-100 rounded-lg cursor-pointer hover:border-[#1551b5]">
                 <div className="flex items-start">
                   <input type="radio" name="payment" className="mt-1 mr-3" />
                   <div>
                     <h4 className="text-xs font-bold text-gray-800">Wallet</h4>
                     <p className="text-[10px] text-gray-500 mt-0.5">Paytm, PhonePe, Amazon Pay</p>
                   </div>
                 </div>
                 <Wallet className="w-5 h-5 text-gray-400" />
               </label>
               
               {/* COD */}
               <label className="flex items-center justify-between p-3 border border-gray-100 rounded-lg cursor-pointer hover:border-[#1551b5]">
                 <div className="flex items-start">
                   <input type="radio" name="payment" className="mt-1 mr-3" />
                   <div>
                     <h4 className="text-xs font-bold text-gray-800">Cash on Delivery</h4>
                     <p className="text-[10px] text-gray-500 mt-0.5">Pay when you receive</p>
                   </div>
                 </div>
                 <span className="text-[16px]">💵</span>
               </label>
             </div>
          </div>

          {/* Scan and Pay Column */}
          <div className="md:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center">
             <h3 className="font-bold text-gray-800 text-sm mb-6 w-full text-left">Scan & Pay</h3>
             
             <div className="w-48 h-48 bg-slate-50 border border-gray-200 rounded-xl p-4 mb-4 flex items-center justify-center relative overflow-hidden">
               {/* Mock QR Code Pattern */}
               <div className="absolute inset-2" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' viewBox=\'0 0 20 20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0 0h10v10H0V0zm2 2v6h6V2H2zm10 0h8v8h-8V2zm2 2v4h4V4h-4zM0 12h10v8H0v-8zm2 2v4h6v-4H2zm10-2h2v2h-2v-2zm2 2h2v2h-2v-2zm-2 2h2v2h-2v-2zm2 2h2v2h-2v-2zm2-6h2v2h-2v-2zm0 4h2v2h-2v-2z\' fill=\'%23000000\' fill-opacity=\'0.8\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")', backgroundSize: '12px' }}></div>
               {/* Center Logo in QR */}
               <div className="w-10 h-10 bg-white rounded-lg z-10 flex items-center justify-center p-1 border-2 border-gray-800">
                  <img src="/logo.jpeg" alt="Logo" className="w-full h-full object-contain opacity-80" />
               </div>
             </div>

             <p className="text-xs text-gray-500 mb-6">UPI ID: amrutlok@upi</p>

             <p className="text-[10px] text-gray-400 mb-4 uppercase tracking-wider font-bold">Or</p>

             <button 
               onClick={() => setPaymentSuccess(true)}
               className="w-full bg-[#1551b5] text-white font-bold py-3 rounded-lg hover:bg-blue-800 transition-colors shadow-md text-sm"
             >
               Pay using UPI App
             </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
