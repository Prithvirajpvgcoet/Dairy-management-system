import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Public Pages
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import SubscriptionsPage from './pages/SubscriptionsPage';
import OurStoryPage from './pages/OurStoryPage';
import QualityPage from './pages/QualityPage';
import ContactPage from './pages/ContactPage';
import Login from './pages/auth/Login';

// Layouts & Auth
import AdminLayout from './components/layout/AdminLayout';
import DeliveryLayout from './components/layout/DeliveryLayout';
import CustomerLayout from './components/layout/CustomerLayout';
import RequireRole from './components/common/RequireRole';
import { AuthProvider } from './context/AuthContext';

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
import SupportMessages from './components/admin/SupportMessages';

// Customer Components
import CustomerDashboard from './components/customer/CustomerDashboard';
import Orders from './components/customer/Orders';
import Requirement from './components/customer/Requirement';
import Bills from './components/customer/Bills';
import Account from './components/customer/Account';
import CheckoutFlow from './components/customer/CheckoutFlow';

// Delivery Components
import DeliveryDashboard from './components/deliveryBoy/DeliveryDashboard';

import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Toaster position="top-right" />
        <Routes>
          {/* Public 5-Page Brand Website */}
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/subscriptions" element={<SubscriptionsPage />} />
          <Route path="/our-story" element={<OurStoryPage />} />
          <Route path="/quality" element={<QualityPage />} />
          <Route path="/contact" element={<ContactPage />} />

          {/* Authentication */}
          <Route path="/login" element={<Login />} />

          {/* Protected Routes (Admin & Management) */}
          <Route path="/admin/*" element={
            <RequireRole roles={['ADMIN', 'INVENTORY_MNGR', 'BILLING_CLERK', 'SUPPORT']}>
              <AdminLayout>
                <Routes>
                  <Route path="/" element={<AdminDashboard />} />
                  <Route path="/messages" element={<SupportMessages />} />
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
                </Routes>
              </AdminLayout>
            </RequireRole>
          } />

          {/* Protected Routes (Customer) */}
          <Route path="/customer/*" element={
            <RequireRole roles={['CUSTOMER']}>
              <CustomerLayout>
                <Routes>
                  <Route path="/" element={<CustomerDashboard />} />
                  <Route path="/orders" element={<Orders />} />
                  <Route path="/plans" element={<CheckoutFlow />} />
                  <Route path="/bills" element={<Bills />} />
                  <Route path="/account" element={<Account />} />
                  <Route path="/requirement" element={<Requirement />} />
                </Routes>
              </CustomerLayout>
            </RequireRole>
          } />
          
          {/* Protected Routes (Delivery Partner) */}
          <Route path="/delivery/*" element={
            <RequireRole roles={['DELIVERY_BOY']}>
              <DeliveryLayout>
                <Routes>
                  <Route path="/" element={<DeliveryDashboard />} />
                  <Route path="/route" element={<DeliveryDashboard />} />
                  <Route path="/earnings" element={<DeliveryDashboard />} />
                  <Route path="/profile" element={<DeliveryDashboard />} />
                </Routes>
              </DeliveryLayout>
            </RequireRole>
          } />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
