import React, { useState, useEffect } from 'react';
import { Package, Plus, Loader2, Save, X, Edit, Trash2 } from 'lucide-react';
import api from '../../api/client';

import toast from 'react-hot-toast'; // For notifications (assuming it's available or we can just use alert)

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    unit: '',
    price_per_unit: '',
    icon: '📦',
    in_stock: true
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await api.get('/admin/products');
      if (res) {
        const data = res.data;
        setProducts(data);
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const openAddModal = () => {
    setEditingId(null);
    setFormData({ name: '', unit: '', price_per_unit: '', icon: '📦', in_stock: true });
    setShowAddModal(true);
  };

  const openEditModal = (product) => {
    setEditingId(product.id);
    setFormData({
      name: product.name,
      unit: product.unit,
      price_per_unit: product.price_per_unit,
      icon: product.icon || '📦',
      in_stock: product.in_stock === 1 || product.in_stock === true
    });
    setShowAddModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      const res = await api.delete(`/admin/products/${id}`);
      if (res) {
        fetchProducts();
      }
    } catch (error) {
      console.error("Failed to delete product:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const url = editingId 
        ? `/admin/products/${editingId}`
        : '/admin/products';
      const method = editingId ? 'put' : 'post';

      const res = await api[method](url, formData);
      
      if (res) {
        setShowAddModal(false);
        fetchProducts();
      }
    } catch (error) {
      console.error("Failed to save product:", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 md:p-8 bg-slate-50 min-h-full font-['Poppins']">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Products Inventory</h1>
          <p className="text-sm text-gray-500 mt-1">Manage catalog, pricing, and stock status.</p>
        </div>
        
        <button 
          onClick={openAddModal}
          className="bg-[#0D47A1] hover:bg-blue-800 text-white px-4 py-2 rounded-lg font-semibold shadow-sm transition flex items-center text-sm"
        >
          <Plus className="w-4 h-4 mr-2" /> Add Product
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading ? (
           <div className="col-span-full flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-[#0D47A1]" /></div>
        ) : products.length === 0 ? (
           <div className="col-span-full text-center py-12 text-gray-500">No products found. Add one to get started.</div>
        ) : (
          products.map(product => (
            <div key={product.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full hover:shadow-md transition group">
              <div className="flex justify-between items-start mb-4">
                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-3xl">
                  {product.icon}
                </div>
                <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEditModal(product)} className="p-1.5 bg-gray-50 text-gray-600 rounded hover:bg-blue-50 hover:text-[#0D47A1]">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(product.id)} className="p-1.5 bg-gray-50 text-gray-600 rounded hover:bg-red-50 hover:text-red-600">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="flex-grow">
                <h3 className="text-lg font-bold text-gray-800">{product.name}</h3>
                <p className="text-sm text-gray-500 mt-1">{product.unit}</p>
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-between items-end mt-4">
                <div>
                   <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Price</p>
                   <p className="text-lg font-extrabold text-[#0D47A1]">₹{product.price_per_unit}</p>
                </div>
                <div>
                   <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded-full ${
                     (product.in_stock === 1 || product.in_stock === true) ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                   }`}>
                     {(product.in_stock === 1 || product.in_stock === true) ? 'In Stock' : 'Out of Stock'}
                   </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-800">{editingId ? 'Edit Product' : 'Add Product'}</h2>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Product Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-[#0D47A1] focus:border-[#0D47A1] text-sm outline-none" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Unit (e.g., 1L, 500g)</label>
                  <input type="text" name="unit" value={formData.unit} onChange={handleChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-[#0D47A1] focus:border-[#0D47A1] text-sm outline-none" required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Price (₹)</label>
                  <input type="number" step="0.01" name="price_per_unit" value={formData.price_per_unit} onChange={handleChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-[#0D47A1] focus:border-[#0D47A1] text-sm outline-none" required />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Emoji Icon</label>
                <input type="text" name="icon" value={formData.icon} onChange={handleChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-[#0D47A1] focus:border-[#0D47A1] text-sm outline-none text-2xl" required />
              </div>
              <div className="flex items-center mt-4">
                <input type="checkbox" id="in_stock" name="in_stock" checked={formData.in_stock} onChange={handleChange} className="w-4 h-4 text-[#0D47A1] rounded border-gray-300 focus:ring-[#0D47A1]" />
                <label htmlFor="in_stock" className="ml-2 text-sm font-bold text-gray-700">Currently In Stock</label>
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end space-x-3 mt-6">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 text-sm font-bold text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg transition">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="px-4 py-2 text-sm font-bold text-white bg-[#0D47A1] hover:bg-blue-800 rounded-lg flex items-center transition disabled:opacity-50">
                  {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  {editingId ? 'Save Changes' : 'Add Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
