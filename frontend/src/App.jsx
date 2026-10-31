import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Login from './pages/auth/Login';
import CheckoutPage from './pages/CheckoutPage';
import PaymentPage from './pages/PaymentPage';

// Layouts
import AdminLayout from './components/layout/AdminLayout';
import DeliveryLayout from './components/layout/DeliveryLayout';
import CustomerLayout from './components/layout/CustomerLayout';

// Admin Components
import AdminDashboard from './components/admin/AdminDashboard';
import RouteAssignment from './components/admin/RouteAssignment';
import Performance from './components/admin/Performance';
import DailyLogs from './components/admin/DailyLogs';
import MonthlyBilling from './components/admin/MonthlyBilling';
import StaffManagement from './components/admin/StaffManagement';
import Products from './components/admin/Products';
import Customers from './components/admin/Customers';
import Inventory from './components/admin/Inventory';
import Exceptions from './components/admin/Exceptions';
import AuditLogs from './components/admin/AuditLogs';

import CustomerDashboard from './components/customer/CustomerDashboard';
import DeliveryDashboard from './components/deliveryBoy/DeliveryDashboard';

import Orders from './components/customer/Orders';
import Requirement from './components/customer/Requirement';
import Bills from './components/customer/Bills';
import Account from './components/customer/Account';
import CheckoutFlow from './components/customer/CheckoutFlow';

import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage/>} />
        <Route path="/login" element={<Login />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/payment" element={<PaymentPage />} />

        {/* Protected Routes (Dashboards) */}
        <Route path="/admin/*" element={
          <AdminLayout>
            <Routes>
              <Route path="/" element={<AdminDashboard />} />
              <Route path="/assign-route" element={<RouteAssignment />} />
              <Route path="/performance" element={<Performance />} />
              <Route path="/daily-logs" element={<DailyLogs />} />
              <Route path="/monthly-billing" element={<MonthlyBilling />} />
              <Route path="/staff-management" element={<StaffManagement />} />
              <Route path="/products" element={<Products />} />
              <Route path="/customers" element={<Customers />} />
              <Route path="/inventory" element={<Inventory />} />
              <Route path="/exceptions" element={<Exceptions />} />
              <Route path="/audit-logs" element={<AuditLogs />} />
              <Route path="/logs" element={<AuditLogs />} />
            </Routes>
          </AdminLayout>
        } />
        
        <Route path="/customer/*" element={
          <CustomerLayout>
            <Routes>
              <Route path="/" element={<CustomerDashboard />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/checkout" element={<CheckoutFlow />} />
              <Route path="/bills" element={<Bills />} />
              <Route path="/account" element={<Account />} />
              <Route path="/requirement" element={<Requirement />} />
            </Routes>
          </CustomerLayout>
        } />
        
        <Route path="/delivery/*" element={
          <DeliveryLayout>
            <Routes>
              <Route path="/" element={<DeliveryDashboard />} />
              <Route path="/route" element={<DeliveryDashboard />} />
              <Route path="/earnings" element={<DeliveryDashboard />} />
              <Route path="/profile" element={<DeliveryDashboard />} />
            </Routes>
          </DeliveryLayout>
        } />
      </Routes>
    </Router>
  );
}

export default App;