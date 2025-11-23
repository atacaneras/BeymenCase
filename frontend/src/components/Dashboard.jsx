import React, { useState, useEffect } from 'react';
import { ShoppingCart, Package, Bell, Plus, Loader, AlertCircle, CheckCircle, Trash2 } from 'lucide-react';

export default function Dashboard() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('orders');
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    items: [{ productId: 1, productName: 'Ürün', quantity: 1, unitPrice: 100 }]
  });
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: 0,
    stockQuantity: 0
  });

  const API_BASE = 'http://localhost:5001';
  const STOCK_API = 'http://localhost:5002';
  const NOTIFICATION_API = 'http://localhost:5003';

  useEffect(() => {
    fetchOrders();
    fetchProducts();
    fetchNotifications();
    const interval = setInterval(() => {
      fetchOrders();
      fetchProducts();
      fetchNotifications();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/orders`);
      if (res.ok) {
        const data = await res.json();
        setOrders(data || []);
      }
    } catch (err) {
      console.error('Siparişler yüklenemedi:', err);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${STOCK_API}/api/stock/products`);
      if (res.ok) {
        const data = await res.json();
        setProducts(data || []);
      }
    } catch (err) {
      console.error('Ürünler yüklenemedi:', err);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await fetch(`${NOTIFICATION_API}/api/notifications`);
      if (res.ok) {
        const data = await res.json();
        setNotifications(data || []);
      }
    } catch (err) {
      console.error('Bildirimler yüklenemedi:', err);
    }
  };

  const createOrder = async (e) => {
    e.preventDefault();
    if (!formData.customerName || !formData.customerEmail) {
      alert('Lütfen müşteri bilgilerini doldurunuz');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        alert('Sipariş oluşturuldu!');
        setFormData({
          customerName: '',
          customerEmail: '',
          customerPhone: '',
          items: [{ productId: 1, productName: 'Ürün', quantity: 1, unitPrice: 100 }]
        });
        fetchOrders();
      } else {
        alert('Sipariş oluşturulamadı');
      }
    } catch (err) {
      alert('Hata: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const createProduct = async (e) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.price) {
      alert('Lütfen ürün bilgilerini doldurunuz');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${STOCK_API}/api/stock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProduct)
      });
      if (res.ok) {
        alert('Ürün oluşturuldu!');
        setNewProduct({ name: '', description: '', price: 0, stockQuantity: 0 });
        fetchProducts();
      } else {
        alert('Ürün oluşturulamadı');
      }
    } catch (err) {
      alert('Hata: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'Pending': 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
      'StockReserved': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      'PaymentCompleted': 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      'Shipped': 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
      'Delivered': 'bg-green-500/20 text-green-300 border-green-500/30',
      'Failed': 'bg-red-500/20 text-red-300 border-red-500/30'
    };
    return colors[status] || 'bg-gray-500/20 text-gray-300 border-gray-500/30';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="bg-slate-950 border-b border-slate-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-2 rounded-lg">
                <ShoppingCart className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white">E-Ticaret Dashboard</h1>
            </div>
            <div className="flex gap-2">
              <div className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm border border-green-500/30">
                ✓ Servislere Bağlı
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-slate-900 border-b border-slate-700 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1">
            {[
              { id: 'orders', label: 'Siparişler', icon: ShoppingCart },
              { id: 'products', label: 'Ürünler', icon: Package },
              { id: 'notifications', label: 'Bildirimler', icon: Bell }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 font-medium transition-all flex items-center gap-2 border-b-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-slate-400 hover:text-slate-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Form */}
            <div className="lg:col-span-1">
              <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 shadow-xl">
                <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Plus className="w-5 h-5" /> Yeni Sipariş
                </h2>
                <form onSubmit={createOrder} className="space-y-4">
                  <input
                    type="text"
                    placeholder="Müşteri Adı"
                    value={formData.customerName}
                    onChange={e => setFormData({...formData, customerName: e.target.value})}
                    className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white placeholder-slate-400"
                  />
                  <input
                    type="email"
                    placeholder="E-posta"
                    value={formData.customerEmail}
                    onChange={e => setFormData({...formData, customerEmail: e.target.value})}
                    className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white placeholder-slate-400"
                  />
                  <input
                    type="tel"
                    placeholder="Telefon"
                    value={formData.customerPhone}
                    onChange={e => setFormData({...formData, customerPhone: e.target.value})}
                    className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white placeholder-slate-400"
                  />
                  <div className="border-t border-slate-600 pt-4">
                    <label className="text-sm text-slate-300 font-medium">Ürün Detayları</label>
                    <input
                      type="text"
                      placeholder="Ürün Adı"
                      value={formData.items[0].productName}
                      onChange={e => {
                        const items = [...formData.items];
                        items[0].productName = e.target.value;
                        setFormData({...formData, items});
                      }}
                      className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white placeholder-slate-400 mt-2"
                    />
                    <input
                      type="number"
                      placeholder="Adet"
                      min="1"
                      value={formData.items[0].quantity}
                      onChange={e => {
                        const items = [...formData.items];
                        items[0].quantity = parseInt(e.target.value) || 1;
                        setFormData({...formData, items});
                      }}
                      className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white placeholder-slate-400 mt-2"
                    />
                    <input
                      type="number"
                      placeholder="Fiyat"
                      min="0"
                      step="0.01"
                      value={formData.items[0].unitPrice}
                      onChange={e => {
                        const items = [...formData.items];
                        items[0].unitPrice = parseFloat(e.target.value) || 0;
                        setFormData({...formData, items});
                      }}
                      className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white placeholder-slate-400 mt-2"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 text-white font-bold py-2 rounded transition-all flex items-center justify-center gap-2"
                  >
                    {loading ? <Loader className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    Sipariş Oluştur
                  </button>
                </form>
              </div>
            </div>

            {/* Orders List */}
            <div className="lg:col-span-2">
              <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 shadow-xl">
                <h2 className="text-lg font-bold text-white mb-4">Son Siparişler</h2>
                {orders.length === 0 ? (
                  <div className="text-slate-400 text-center py-8">
                    <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    Henüz sipariş yok
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {orders.map(order => (
                      <div key={order.id} className="bg-slate-700 rounded-lg p-4 border border-slate-600">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="text-white font-semibold">{order.customerName}</p>
                            <p className="text-slate-400 text-sm">{order.customerEmail}</p>
                          </div>
                          <span className={`px-2 py-1 rounded text-xs font-semibold border ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </div>
                        <p className="text-blue-400 font-bold">{order.totalAmount.toFixed(2)} ₺</p>
                        <p className="text-slate-400 text-xs mt-1">{new Date(order.createdAt).toLocaleString('tr-TR')}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Form */}
            <div className="lg:col-span-1">
              <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 shadow-xl sticky top-40">
                <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Plus className="w-5 h-5" /> Yeni Ürün
                </h2>
                <form onSubmit={createProduct} className="space-y-4">
                  <input
                    type="text"
                    placeholder="Ürün Adı"
                    value={newProduct.name}
                    onChange={e => setNewProduct({...newProduct, name: e.target.value})}
                    className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white placeholder-slate-400"
                  />
                  <textarea
                    placeholder="Açıklama"
                    value={newProduct.description}
                    onChange={e => setNewProduct({...newProduct, description: e.target.value})}
                    className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white placeholder-slate-400 h-20 resize-none"
                  />
                  <input
                    type="number"
                    placeholder="Fiyat"
                    min="0"
                    step="0.01"
                    value={newProduct.price}
                    onChange={e => setNewProduct({...newProduct, price: parseFloat(e.target.value) || 0})}
                    className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white placeholder-slate-400"
                  />
                  <input
                    type="number"
                    placeholder="Stok Miktarı"
                    min="0"
                    value={newProduct.stockQuantity}
                    onChange={e => setNewProduct({...newProduct, stockQuantity: parseInt(e.target.value) || 0})}
                    className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white placeholder-slate-400"
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 text-white font-bold py-2 rounded transition-all flex items-center justify-center gap-2"
                  >
                    {loading ? <Loader className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    Ürün Ekle
                  </button>
                </form>
              </div>
            </div>

            {/* Products Grid */}
            <div className="lg:col-span-2">
              {products.length === 0 ? (
                <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 text-slate-400 text-center">
                  <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  Henüz ürün yok
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {products.map(product => (
                    <div key={product.id} className="bg-slate-800 rounded-xl border border-slate-700 p-4 shadow-xl hover:border-slate-600 transition-all">
                      <h3 className="text-white font-bold mb-2">{product.name}</h3>
                      <p className="text-slate-400 text-sm mb-3 line-clamp-2">{product.description}</p>
                      <div className="flex justify-between items-end">
                        <div>
                          <p className="text-blue-400 font-bold text-lg">{product.price.toFixed(2)} ₺</p>
                          <p className="text-slate-400 text-xs">Stok: {product.availableQuantity}/{product.stockQuantity}</p>
                        </div>
                        <div className="text-right">
                          {product.availableQuantity > 0 ? (
                            <span className="bg-green-500/20 text-green-300 px-2 py-1 rounded text-xs border border-green-500/30">
                              Müsait
                            </span>
                          ) : (
                            <span className="bg-red-500/20 text-red-300 px-2 py-1 rounded text-xs border border-red-500/30">
                              Tükendi
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 shadow-xl">
            <h2 className="text-lg font-bold text-white mb-4">Bildirimler</h2>
            {notifications.length === 0 ? (
              <div className="text-slate-400 text-center py-12">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                Henüz bildirim yok
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {notifications.map(notif => (
                  <div key={notif.id} className="bg-slate-700 rounded-lg p-4 border-l-4 border-blue-500">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-white font-semibold">{notif.type} - {notif.recipient}</p>
                        <p className="text-slate-300 text-sm mt-1">{notif.message}</p>
                        <p className="text-slate-400 text-xs mt-2">{new Date(notif.createdAt).toLocaleString('tr-TR')}</p>
                      </div>
                      {notif.status === 'Sent' ? (
                        <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 ml-4" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 ml-4" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}