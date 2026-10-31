import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  Search, Filter, ShoppingBag, Check, Plus, 
  Sparkles, ShieldCheck, ChevronRight 
} from 'lucide-react';
import PublicLayout from '../components/layout/PublicLayout';
import api from '../api/client';
import toast from 'react-hot-toast';

const CATEGORIES = [
  'All',
  'Milk',
  'Curd and Yogurt',
  'Paneer',
  'Ghee',
  'Butter',
  'Flavoured'
];

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get('category') || 'All';

  const [products, setProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState(categoryParam);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Sync category param from URL
  useEffect(() => {
    if (categoryParam) {
      setActiveCategory(categoryParam);
    }
  }, [categoryParam]);

  useEffect(() => {
    fetchProducts();
  }, [activeCategory, searchQuery]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = {};
      if (activeCategory !== 'All') {
        params.category = activeCategory;
      }
      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }

      const res = await api.get('/products', { params });
      setProducts(res.data || []);
    } catch (err) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (cat) => {
    setActiveCategory(cat);
    if (cat === 'All') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', cat);
    }
    setSearchParams(searchParams);
  };

  const handleQuickAdd = (product) => {
    // Save to persistent cart in localStorage
    const savedCart = JSON.parse(localStorage.getItem('amarale_cart') || '{}');
    savedCart[product.id] = (savedCart[product.id] || 0) + 1;
    localStorage.setItem('amarale_cart', JSON.stringify(savedCart));
    toast.success(`Added ${product.name} to cart!`);
  };

  return (
    <PublicLayout>
      {/* ── Page Header ── */}
      <div className="bg-white border-b border-slate-200 py-10 sm:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <span className="text-xs font-bold text-[#0D47A1] uppercase tracking-wider">Amarale Dairy Farm</span>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mt-1">
              Pure Dairy Products
            </h1>
            <p className="text-sm sm:text-base text-slate-600 mt-2">
              Freshly milked and prepared daily. Zero synthetic hormones, zero adulteration, and delivered at chilled 4°C.
            </p>
          </div>

          {/* Search & Category Filter */}
          <div className="mt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search milk, curd, paneer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D47A1] focus:border-transparent bg-slate-50"
              />
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => handleCategoryChange(cat)}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
                    activeCategory === cat
                      ? 'bg-[#0D47A1] text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Product Grid ── */}
      <div className="py-12 sm:py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white rounded-2xl h-80 animate-pulse border border-slate-200"></div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 max-w-lg mx-auto p-8">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 text-[#0D47A1] flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                🥛
              </div>
              <h3 className="text-xl font-bold text-slate-900">No products found</h3>
              <p className="text-sm text-slate-500 mt-2">
                We couldn't find any products in "{activeCategory}" matching your search.
              </p>
              <button
                onClick={() => { setActiveCategory('All'); setSearchQuery(''); }}
                className="mt-6 px-5 py-2.5 rounded-xl bg-[#0D47A1] text-white text-xs font-bold"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div>
                    {/* Image Header */}
                    <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                      <img
                        src={product.image_url || 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=600&auto=format&fit=crop'}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-3 left-3 px-3 py-1 bg-white/90 backdrop-blur-md rounded-lg text-xs font-bold text-slate-800 shadow-sm">
                        {product.category || 'Dairy'}
                      </div>
                      <div className="absolute top-3 right-3 px-2.5 py-1 bg-emerald-500 text-white rounded-lg text-[11px] font-bold shadow-sm">
                        In Stock
                      </div>
                    </div>

                    {/* Details */}
                    <div className="p-6">
                      <div className="flex items-baseline justify-between gap-2">
                        <h3 className="text-xl font-black text-slate-900 group-hover:text-[#0D47A1] transition-colors">
                          {product.name}
                        </h3>
                        <span className="text-xs font-semibold text-slate-400">
                          {product.unit}
                        </span>
                      </div>

                      <p className="text-xs sm:text-sm text-slate-500 mt-2.5 leading-relaxed">
                        {product.description || 'Farm-fresh nutritious dairy prepared daily under sterile conditions.'}
                      </p>

                      <div className="mt-4 flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                          <ShieldCheck className="w-3 h-3" /> Zero Preservatives
                        </span>
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                          Chilled 4°C
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Pricing and Actions */}
                  <div className="p-6 pt-0 mt-2 border-t border-slate-100 flex items-center justify-between gap-3">
                    <div>
                      <span className="text-xs text-slate-400 font-medium">Daily Rate</span>
                      <p className="text-2xl font-black text-slate-900">
                        ₹{parseFloat(product.price_per_unit).toFixed(0)}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleQuickAdd(product)}
                        title="Add to one-time cart"
                        className="p-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>

                      <Link
                        to={`/subscriptions?product=${product.id}`}
                        className="px-5 py-3 rounded-xl bg-[#0D47A1] hover:bg-blue-800 text-white font-bold text-xs sm:text-sm transition-all shadow-sm"
                      >
                        Subscribe
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PublicLayout>
  );
}
