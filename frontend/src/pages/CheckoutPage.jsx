import React from 'react';
import { MapPin, Clock, Edit2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const CheckoutPage = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex justify-center p-4 md:p-8 font-sans">
      <div className="w-full max-w-5xl">
        <h1 className="text-2xl font-bold text-[#1551b5] mb-6">CHECKOUT PAGE</h1>
        
        <div className="grid md:grid-cols-2 gap-8">
          
          {/* Left Column */}
          <div className="space-y-6">
            {/* Delivery Address */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-800 text-sm">Delivery Address</h3>
                <span className="text-xs text-[#1551b5] font-semibold cursor-pointer">Change</span>
              </div>
              <div className="flex items-start">
                <MapPin className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-gray-800">Rahul Sharma</h4>
                  <p className="text-xs text-gray-500 mt-1">123, Ganesh Nagar,<br/>Pune, 411001, Maharashtra</p>
                </div>
              </div>
            </div>

            {/* Delivery Slot */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-800 text-sm">Delivery Slot</h3>
                <span className="text-xs text-[#1551b5] font-semibold cursor-pointer">Change</span>
              </div>
              <div className="flex items-start">
                <Clock className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-gray-800">Tomorrow, 6:30 AM - 7:00 AM</h4>
                </div>
              </div>
            </div>

            {/* Order Summary Summary (Bottom Left of mockup) */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-800 text-sm mb-4">Order Summary</h3>
              <div className="space-y-3 mb-4 border-b border-gray-100 pb-4">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">Cow Milk (1 L) <span className="ml-4">x 2</span></span>
                  <span className="font-bold text-gray-800">₹104</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">Buffalo Milk (1 L) <span className="ml-4">x 1</span></span>
                  <span className="font-bold text-gray-800">₹60</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">Curd (500g) <span className="ml-4">x 1</span></span>
                  <span className="font-bold text-gray-800">₹45</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">Paneer (500g) <span className="ml-4">x 1</span></span>
                  <span className="font-bold text-gray-800">₹110</span>
                </div>
              </div>
              <div className="flex justify-between text-xs mb-4">
                <span className="font-semibold text-gray-600">Delivery Charges</span>
                <span className="font-bold text-gray-800">₹10</span>
              </div>
              <div className="flex justify-between text-sm mb-6">
                <span className="font-bold text-[#1551b5]">Total Amount</span>
                <span className="font-bold text-gray-800">₹329</span>
              </div>
              
              <Link to="/payment" className="w-full block text-center bg-[#1551b5] text-white font-bold py-3 rounded-lg hover:bg-blue-800 transition-colors shadow-md">
                Proceed to Payment
              </Link>
            </div>
          </div>

          {/* Right Column (Your Order Edit) */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-fit">
             <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-[#1551b5] text-sm">Your Order <span className="text-gray-400 font-normal">(4 items)</span></h3>
             </div>

             <div className="space-y-6 mb-8">
               {/* Item 1 */}
               <div className="flex justify-between items-center">
                 <div className="flex items-center">
                   <div className="w-10 h-10 bg-slate-50 rounded border border-gray-100 flex items-center justify-center text-xl mr-3">🥛</div>
                   <div>
                     <h4 className="text-xs font-bold text-gray-800">Cow Milk (1L)</h4>
                     <p className="text-[10px] text-gray-500">₹52</p>
                   </div>
                 </div>
                 <div className="flex items-center space-x-4">
                   <div className="flex items-center border border-gray-200 rounded px-2 py-1 space-x-3">
                     <span className="text-gray-400 cursor-pointer font-bold">-</span>
                     <span className="text-xs font-bold">2</span>
                     <span className="text-gray-400 cursor-pointer font-bold">+</span>
                   </div>
                   <span className="text-sm font-bold text-gray-800 w-10 text-right">₹104</span>
                 </div>
               </div>

               {/* Item 2 */}
               <div className="flex justify-between items-center">
                 <div className="flex items-center">
                   <div className="w-10 h-10 bg-slate-50 rounded border border-gray-100 flex items-center justify-center text-xl mr-3">🥛</div>
                   <div>
                     <h4 className="text-xs font-bold text-gray-800">Buffalo Milk (1L)</h4>
                     <p className="text-[10px] text-gray-500">₹60</p>
                   </div>
                 </div>
                 <div className="flex items-center space-x-4">
                   <div className="flex items-center border border-gray-200 rounded px-2 py-1 space-x-3">
                     <span className="text-gray-400 cursor-pointer font-bold">-</span>
                     <span className="text-xs font-bold">1</span>
                     <span className="text-gray-400 cursor-pointer font-bold">+</span>
                   </div>
                   <span className="text-sm font-bold text-gray-800 w-10 text-right">₹60</span>
                 </div>
               </div>

               {/* Item 3 */}
               <div className="flex justify-between items-center">
                 <div className="flex items-center">
                   <div className="w-10 h-10 bg-slate-50 rounded border border-gray-100 flex items-center justify-center text-xl mr-3">🥣</div>
                   <div>
                     <h4 className="text-xs font-bold text-gray-800">Curd (500g)</h4>
                     <p className="text-[10px] text-gray-500">₹45</p>
                   </div>
                 </div>
                 <div className="flex items-center space-x-4">
                   <div className="flex items-center border border-gray-200 rounded px-2 py-1 space-x-3">
                     <span className="text-gray-400 cursor-pointer font-bold">-</span>
                     <span className="text-xs font-bold">1</span>
                     <span className="text-gray-400 cursor-pointer font-bold">+</span>
                   </div>
                   <span className="text-sm font-bold text-gray-800 w-10 text-right">₹45</span>
                 </div>
               </div>
               
               {/* Item 4 */}
               <div className="flex justify-between items-center">
                 <div className="flex items-center">
                   <div className="w-10 h-10 bg-slate-50 rounded border border-gray-100 flex items-center justify-center text-xl mr-3">🧀</div>
                   <div>
                     <h4 className="text-xs font-bold text-gray-800">Paneer (500g)</h4>
                     <p className="text-[10px] text-gray-500">₹110</p>
                   </div>
                 </div>
                 <div className="flex items-center space-x-4">
                   <div className="flex items-center border border-gray-200 rounded px-2 py-1 space-x-3">
                     <span className="text-gray-400 cursor-pointer font-bold">-</span>
                     <span className="text-xs font-bold">1</span>
                     <span className="text-gray-400 cursor-pointer font-bold">+</span>
                   </div>
                   <span className="text-sm font-bold text-gray-800 w-10 text-right">₹110</span>
                 </div>
               </div>
             </div>

             {/* Add a Note */}
             <div>
               <h4 className="text-xs font-bold text-[#1551b5] mb-2 flex items-center"><Edit2 className="w-3 h-3 mr-1" /> Add a Note (Optional)</h4>
               <textarea 
                 className="w-full border border-gray-200 rounded-lg p-3 text-xs outline-none focus:border-[#1551b5] resize-none" 
                 rows="3" 
                 placeholder="Write your note here..."
               ></textarea>
             </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
