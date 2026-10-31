import React from 'react';
import { Link } from 'react-router-dom';
import { User, Shield } from 'lucide-react';

const Navbar = () => {
  return (
    <nav className="absolute top-0 w-full z-50 py-4 px-4 md:px-8 flex justify-between items-center text-white">
      <div className="flex items-center">
        <img src="/logo.jpeg" alt="अमराळे" className="h-16 md:h-20 object-contain" />
      </div>
      
      <div className="hidden md:flex space-x-8 text-sm font-semibold">
        <a href="#home" className="relative group text-white hover:text-blue-200 transition-colors duration-300">
          Home
          <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-blue-200 transition-all duration-300 group-hover:w-full rounded-full"></span>
        </a>
        <a href="#products" className="relative group text-white hover:text-blue-200 transition-colors duration-300">
          Our Products
          <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-blue-200 transition-all duration-300 group-hover:w-full rounded-full"></span>
        </a>
        <a href="#subscriptions" className="relative group text-white hover:text-blue-200 transition-colors duration-300">
          Subscriptions
          <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-blue-200 transition-all duration-300 group-hover:w-full rounded-full"></span>
        </a>
        <a href="#about" className="relative group text-white hover:text-blue-200 transition-colors duration-300">
          About Us
          <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-blue-200 transition-all duration-300 group-hover:w-full rounded-full"></span>
        </a>
        <a href="#contact" className="relative group text-white hover:text-blue-200 transition-colors duration-300">
          Contact Us
          <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-blue-200 transition-all duration-300 group-hover:w-full rounded-full"></span>
        </a>
      </div>

      <div className="flex space-x-3">
        <Link to="/login" className="flex items-center bg-white text-brand-dark px-4 py-2 rounded-full font-bold text-xs md:text-sm hover:bg-gray-100 transition shadow">
          <User className="w-4 h-4 mr-2" /> Customer Login
        </Link>
        <Link to="/login" className="hidden md:flex items-center bg-brand-dark border border-white/30 text-white px-4 py-2 rounded-full font-bold text-sm hover:bg-blue-900 transition shadow">
          <Shield className="w-4 h-4 mr-2" /> Admin / Staff Login
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;