import React from 'react';
import { Globe, Camera, MessageCircle, Share2 } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-brand-dark text-white pt-16 pb-8 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-5 gap-8 mb-12">
        
        <div className="md:col-span-1">
           <img src="/logo.jpeg" alt="अमराळे" className="h-16 mb-4 filter brightness-0 invert" />
           <p className="text-xs text-blue-200 mb-6">शुद्धता, विश्वास आणि चव यांचा अमृतसंगम.</p>
           <div className="flex space-x-3">
             <a href="#" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-brand-light transition"><Globe className="w-4 h-4"/></a>
             <a href="#" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-brand-light transition"><Camera className="w-4 h-4"/></a>
             <a href="#" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-brand-light transition"><MessageCircle className="w-4 h-4"/></a>
             <a href="#" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-brand-light transition"><Share2 className="w-4 h-4"/></a>
           </div>
        </div>

        <div>
          <h4 className="font-bold mb-4">द्रुत दुवे</h4>
          <ul className="text-sm text-blue-200 space-y-2">
            <li><a href="#" className="hover:text-white transition">मुखपृष्ठ</a></li>
            <li><a href="#" className="hover:text-white transition">आमची उत्पादने</a></li>
            <li><a href="#" className="hover:text-white transition">सदस्यता योजना</a></li>
            <li><a href="#" className="hover:text-white transition">आमच्याबद्दल</a></li>
            <li><a href="#" className="hover:text-white transition">संपर्क करा</a></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold mb-4">उत्पादने</h4>
          <ul className="text-sm text-blue-200 space-y-2">
            <li><a href="#" className="hover:text-white transition">गायीचे दूध</a></li>
            <li><a href="#" className="hover:text-white transition">म्हशीचे दूध</a></li>
            <li><a href="#" className="hover:text-white transition">दही</a></li>
            <li><a href="#" className="hover:text-white transition">पनीर</a></li>
            <li><a href="#" className="hover:text-white transition">तूप</a></li>
            <li><a href="#" className="hover:text-white transition">आणखी उत्पादने</a></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold mb-4">माहिती</h4>
          <ul className="text-sm text-blue-200 space-y-2">
            <li><a href="#" className="hover:text-white transition">डिलिव्हरी धोरण</a></li>
            <li><a href="#" className="hover:text-white transition">गोपनीयता धोरण</a></li>
            <li><a href="#" className="hover:text-white transition">अटी व शर्ती</a></li>
            <li><a href="#" className="hover:text-white transition">परतावा धोरण</a></li>
            <li><a href="#" className="hover:text-white transition">FAQ</a></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold mb-4">आमचे ॲप डाउनलोड करा</h4>
          <p className="text-xs text-blue-200 mb-4">तुमच्या मोबाईलवर तुमचे खाते सहजपणे व्यवस्थापित करा.</p>
          <div className="space-y-3">
             <button className="flex items-center bg-black/30 border border-white/20 rounded-lg px-4 py-2 hover:bg-black/50 transition w-full">
                <span className="text-left">
                   <span className="block text-[10px] text-gray-300">GET IT ON</span>
                   <span className="block text-sm font-bold">Google Play</span>
                </span>
             </button>
             <button className="flex items-center bg-black/30 border border-white/20 rounded-lg px-4 py-2 hover:bg-black/50 transition w-full">
                <span className="text-left">
                   <span className="block text-[10px] text-gray-300">Download on the</span>
                   <span className="block text-sm font-bold">App Store</span>
                </span>
             </button>
          </div>
        </div>

      </div>
      
      <div className="max-w-7xl mx-auto px-4 text-center border-t border-white/10 pt-6">
        <p className="text-xs text-blue-300">© 2025 श्रीकृष्ण डेअरी फार्मस् अमराळे, सर्व हक्क राखीव.</p>
      </div>
    </footer>
  );
};

export default Footer;