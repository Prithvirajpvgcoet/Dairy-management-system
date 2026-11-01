import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Plus, ArrowRight, ShieldCheck } from 'lucide-react';
import PublicLayout from '../components/layout/PublicLayout';
import api from '../api/client';
import toast from 'react-hot-toast';

const CATEGORIES = [
  'All Products',
  'Milk',
  'Curd & Yogurt',
  'Paneer',
  'Ghee',
  'Butter',
  'Flavoured Milk',
  'Other Products'
];

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeCategory, setActiveCategory] = useState(searchParams.get('category') || 'All Products');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/products')
      .then(res => {
        setProducts(res.data || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleCategoryChange = (cat) => {
    setActiveCategory(cat);
    if (cat === 'All Products') searchParams.delete('category');
    else searchParams.set('category', cat);
    setSearchParams(searchParams);
  };

  const handleQuickAdd = (product) => {
    const savedCart = JSON.parse(localStorage.getItem('amarale_cart') || '{}');
    savedCart[product.id] = (savedCart[product.id] || 0) + 1;
    localStorage.setItem('amarale_cart', JSON.stringify(savedCart));
    toast.success(`Added ${product.name} to cart!`);
  };

  // Curated demo products if DB catalog has only base items
  const milkProducts = products.filter(p => p.category === 'Milk' || p.name.includes('Milk'));
  const curdProducts = products.filter(p => p.category === 'Curd and Yogurt' || p.name.includes('Curd'));

  return (
    <PublicLayout>
      {/* ── Page Header ── */}
      <div className="bg-white border-b border-slate-100 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl sm:text-4xl font-black text-[#0A2540] tracking-tight">
            Our Products
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Pure, fresh and wholesome dairy products for your family.
          </p>

          {/* Category Filter Pills (Mockup exact) */}
          <div className="flex items-center gap-2 overflow-x-auto mt-6 pb-2 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  activeCategory === cat
                    ? 'bg-[#0B5ED7] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Products Section ── */}
      <div className="py-12 bg-slate-50/60 min-h-[600px]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          {/* Section 1: Milk */}
          {(activeCategory === 'All Products' || activeCategory === 'Milk') && (
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">Milk</h2>
                <p className="text-xs text-slate-500">Fresh milk, sourced from trusted farms.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                {/* 4 Cards */}
                <div className="lg:col-span-9 grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { id: 1, name: 'Cow Milk', unit: '1L', price: 52, img: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&auto=format&fit=crop' },
                    { id: 2, name: 'Buffalo Milk', unit: '1L', price: 60, img: 'https://images.unsplash.com/photo-1527153857715-3908f2ae5e81?w=400&auto=format&fit=crop' },
                    { id: 101, name: 'Toned Milk', unit: '1L', price: 48, img: 'https://images.unsplash.com/photo-1563227812-0ea4c22e6cc8?w=400&auto=format&fit=crop' },
                    { id: 102, name: 'Double Toned Milk', unit: '1L', price: 46, img: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&auto=format&fit=crop' },
                  ].map((p) => (
                    <div
                      key={p.id}
                      className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow group"
                    >
                      <div>
                        <div className="aspect-square rounded-xl bg-slate-50 overflow-hidden mb-3 p-2 flex items-center justify-center">
                          <img
                            src={p.img}
                            alt={p.name}
                            className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition-transform"
                          />
                        </div>
                        <h3 className="font-bold text-slate-900 text-sm">{p.name}</h3>
                        <p className="text-[11px] text-slate-400">{p.unit}</p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-base font-black text-slate-900">₹{p.price}</span>
                        <button
                          onClick={() => handleQuickAdd(p)}
                          className="px-3 py-1 rounded-lg bg-[#0B5ED7] hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1 transition-colors"
                        >
                          <Plus className="w-3 h-3" /> Add
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Side Promo Card (Mockup exact) */}
                <div className="lg:col-span-3 rounded-2xl bg-[#E8F3FD] border border-blue-200 p-6 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-[#0B5ED7]">100% PURE</span>
                    <h3 className="text-xl font-black text-slate-900 mt-1">Farm Fresh Milk</h3>
                    <p className="text-xs text-slate-600 mt-1">Natural. Pure. Nutritious.</p>
                  </div>
                  <div className="my-4 aspect-video rounded-xl overflow-hidden bg-white">
                    <img
                      src="https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=400&auto=format&fit=crop"
                      alt="Pasture Cow"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <Link
                    to="/subscriptions"
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#0B5ED7] hover:underline"
                  >
                    <span>Learn More</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Section 2: Curd & Yogurt */}
          {(activeCategory === 'All Products' || activeCategory === 'Curd & Yogurt') && (
            <div className="space-y-4 pt-6 border-t border-slate-200/60">
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">Curd & Yogurt</h2>
                <p className="text-xs text-slate-500">Rich in probiotics. Good for your gut.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                {/* 4 Cards */}
                <div className="lg:col-span-9 grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { id: 3, name: 'Curd', unit: '500 g', price: 45, img: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&auto=format&fit=crop' },
                    { id: 103, name: 'Greek Yogurt', unit: '400 g', price: 75, img: 'https://images.unsplash.com/photo-1584278679022-de497526bb87?w=400&auto=format&fit=crop' },
                    { id: 104, name: 'Flavoured Curd', unit: '200 g', price: 55, img: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&auto=format&fit=crop' },
                    { id: 105, name: 'Lassi', unit: '300 ml', price: 30, img: 'https://images.unsplash.com/photo-1563227812-0ea4c22e6cc8?w=400&auto=format&fit=crop' },
                  ].map((p) => (
                    <div
                      key={p.id}
                      className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow group"
                    >
                      <div>
                        <div className="aspect-square rounded-xl bg-slate-50 overflow-hidden mb-3 p-2 flex items-center justify-center">
                          <img
                            src={p.img}
                            alt={p.name}
                            className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition-transform"
                          />
                        </div>
                        <h3 className="font-bold text-slate-900 text-sm">{p.name}</h3>
                        <p className="text-[11px] text-slate-400">{p.unit}</p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-base font-black text-slate-900">₹{p.price}</span>
                        <button
                          onClick={() => handleQuickAdd(p)}
                          className="px-3 py-1 rounded-lg bg-[#0B5ED7] hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1 transition-colors"
                        >
                          <Plus className="w-3 h-3" /> Add
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Side Promo Card (Mockup exact) */}
                <div className="lg:col-span-3 rounded-2xl bg-[#E8F3FD] border border-blue-200 p-6 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-[#0B5ED7]">PROBIOTIC</span>
                    <h3 className="text-xl font-black text-slate-900 mt-1">Goodness in Every Spoon</h3>
                    <p className="text-xs text-slate-600 mt-1">Traditional set dahi.</p>
                  </div>
                  <div className="my-4 aspect-video rounded-xl overflow-hidden bg-white">
                    <img
                      src="https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&auto=format&fit=crop"
                      alt="Fresh Dahi"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <Link
                    to="/subscriptions"
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#0B5ED7] hover:underline"
                  >
                    <span>Explore Range</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Section 3: Paneer & Ghee */}
          {(activeCategory === 'All Products' || activeCategory === 'Paneer' || activeCategory === 'Ghee' || activeCategory === 'Butter') && (
            <div className="space-y-4 pt-6 border-t border-slate-200/60">
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">Paneer, Ghee & Butter</h2>
                <p className="text-xs text-slate-500">Traditional bilona churned dairy specialties.</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { id: 4, name: 'Fresh Malai Paneer', unit: '200 g', price: 110, img: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400&auto=format&fit=crop' },
                  { id: 5, name: 'Pure Desi Cow Ghee', unit: '500 g', price: 120, img: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=400&auto=format&fit=crop' },
                  { id: 6, name: 'Salted Table Butter', unit: '250 g', price: 90, img: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=400&auto=format&fit=crop' },
                  { id: 7, name: 'Masala Buttermilk', unit: '500 ml', price: 25, img: 'https://images.unsplash.com/photo-1563227812-0ea4c22e6cc8?w=400&auto=format&fit=crop' },
                ].map((p) => (
                  <div
                    key={p.id}
                    className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow group"
                  >
                    <div>
                      <div className="aspect-square rounded-xl bg-slate-50 overflow-hidden mb-3 p-2 flex items-center justify-center">
                        <img
                          src={p.img}
                          alt={p.name}
                          className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition-transform"
                        />
                      </div>
                      <h3 className="font-bold text-slate-900 text-sm">{p.name}</h3>
                      <p className="text-[11px] text-slate-400">{p.unit}</p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-base font-black text-slate-900">₹{p.price}</span>
                      <button
                        onClick={() => handleQuickAdd(p)}
                        className="px-3 py-1 rounded-lg bg-[#0B5ED7] hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1 transition-colors"
                      >
                        <Plus className="w-3 h-3" /> Add
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </PublicLayout>
  );
}
