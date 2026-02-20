'use client';

import { useState, useEffect, useRef } from 'react';
import Chatbot from '../components/chatbot';

export default function AdminDashboard() {
  // --- States for Products ---
  const [menu, setMenu] = useState([]);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(''); 
  const [stock, setStock] = useState('');       
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isBestSeller, setIsBestSeller] = useState(false);
  const fileInputRef = useRef(null);
  const [isSaving, setIsSaving] = useState(false);

  // --- Filter State ---
  const [activeFilter, setActiveFilter] = useState('All');

  // --- States for Q&A ---
  const [qna, setQna] = useState([]);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');

  // Initial Data Fetch
  useEffect(() => {
    fetchProducts();
    const savedQna = JSON.parse(localStorage.getItem('qna') || '[]');
    setQna(savedQna);
  }, []);

  const fetchProducts = () => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => setMenu(data));
  };

  // --- Logic for Best Sellers ---
  const bestSellersList = menu.filter(item => item.is_best_seller);

  async function toggleBestSeller(id, currentStatus) {
    const response = await fetch(`/api/products/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ is_best_seller: !currentStatus }),
    });
    if (response.ok) {
      fetchProducts();
    }
  }

  // --- Filter Logic ---
  const filteredMenu = activeFilter === 'All' 
    ? menu 
    : menu.filter(item => item.category === activeFilter);

  // --- Image Handling ---
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  // --- CRUD Operations ---
  async function handleDelete(id) {
    if (!confirm("Are you sure you want to delete this product?")) return;
    const response = await fetch(`/api/products/${id}`, { method: 'DELETE' });
    if (response.ok) {
      fetchProducts();
    }
  }

  
async function handleProductSave(e) {
  e.preventDefault();
  setIsSaving(true); // 1. Start the loading screen

  const file = fileInputRef.current?.files[0];
  let finalImageUrl = '/placeholder.jpg';

  try {
    if (file) {
      const response = await fetch(`/api/upload?filename=${file.name}`, {
        method: 'POST',
        body: file,
      });

      if (response.ok) {
        const newBlob = await response.json();
        finalImageUrl = newBlob.url;
      }
    }

    const dbResponse = await fetch('/api/products', {
      method: 'POST',
      body: JSON.stringify({ 
        name, 
        price, 
        description, 
        image_url: finalImageUrl,
        category,
        stock_quantity: parseInt(stock) || 0,
        is_best_seller: isBestSeller 
      }),
    });

    if (dbResponse.ok) {
      fetchProducts();
      // Reset Form
      setName(''); setPrice(''); setDescription(''); setCategory(''); setStock(''); 
      setPreviewUrl(null); setIsBestSeller(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  } catch (error) {
    console.error("Save failed:", error);
  } finally {
    setIsSaving(false); // 2. Stop the loading screen automatically
  }
}

  // --- AI Knowledge Logic ---
  function handleQnaSave(e) {
    e.preventDefault();
    if (!question || !answer) return;
    const updatedQna = [...qna, { question, answer }];
    setQna(updatedQna);
    localStorage.setItem('qna', JSON.stringify(updatedQna));
    setQuestion(''); setAnswer('');
  }

  function deleteQna(idx) {
    const updated = qna.filter((_, i) => i !== idx);
    setQna(updated);
    localStorage.setItem('qna', JSON.stringify(updated));
  }

  return (
    <main className="min-h-screen bg-[#8A38F5] p-6 font-sans text-gray-800">
      {/* TOP NAVIGATION BAR */}
      <div className="flex justify-between items-center mb-8 bg-white p-4 rounded-2xl shadow-lg">
        <h1 className="text-2xl font-bold text-[#8A38F5]">Gamcheon Mart Admin</h1>
        <div className="flex gap-4">
           <a href="/" className="bg-gray-100 px-4 py-2 rounded-xl font-bold hover:bg-gray-200 text-sm">Home</a>
           <a href="/shop" className="bg-[#8A38F5] text-white px-4 py-2 rounded-xl font-bold hover:bg-[#742ed4] text-sm">View Shop</a>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* PANEL 1: PRODUCT EDITOR */}
        <section className="bg-[#FFD18B] p-8 rounded-[40px] shadow-2xl flex flex-col gap-6">
          <h2 className="text-xl font-black text-gray-800 uppercase tracking-tight italic">🛒 Add New Product</h2>
          <form onSubmit={handleProductSave} className="space-y-4">
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Item Name" className="w-full p-4 rounded-2xl border-none shadow-inner text-sm" required />
            
            <div className="flex gap-2">
              <select value={category} onChange={e => setCategory(e.target.value)} className="w-2/3 p-4 rounded-2xl border-none shadow-inner bg-white font-bold text-gray-500 text-sm" required>
                <option value="">Category</option>
                <option value="Ramen">Ramen</option>
                <option value="Snacks">Snacks</option>
                <option value="Drinks">Drinks</option>
                <option value="Meals">Meals</option>
              </select>
              <input value={price} onChange={e => setPrice(e.target.value)} type="number" placeholder="₱" className="w-1/3 p-4 rounded-2xl border-none shadow-inner text-sm" required />
            </div>

            <input value={stock} onChange={e => setStock(e.target.value)} type="number" placeholder="Stock Quantity" className="w-full p-4 rounded-2xl border-none shadow-inner text-sm" />
            <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Description" className="w-full p-4 rounded-2xl h-24 border-none shadow-inner text-sm" required />
            
            <div className="bg-white p-3 rounded-2xl shadow-inner text-center">
              <input type="file" ref={fileInputRef} onChange={handleImageChange} className="text-[10px] w-full" />
            </div>


            <button type="submit" className="w-full bg-[#8A38F5] text-white font-black py-4 rounded-2xl shadow-lg hover:bg-[#742ed4] transition-all uppercase text-sm">Save Product</button>
          </form>
        </section>

        {/* PANEL 2: ACTIVE BEST SELLERS */}
        <section className="bg-white p-8 rounded-[40px] shadow-2xl border-4 border-[#FFD18B]">
          <h2 className="text-xl font-black text-[#8A38F5] mb-6 uppercase italic flex items-center gap-2">⭐ Active Best Sellers</h2>
          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
            {bestSellersList.map(item => (
              <div key={item.id} className="flex items-center justify-between bg-gray-50 p-4 rounded-2xl border border-gray-100 group">
                <div className="flex items-center gap-3">
                  <img src={item.image_url} className="w-10 h-10 rounded-lg object-cover" alt="" />
                  <div>
                    <p className="font-black text-xs uppercase text-gray-800">{item.name}</p>
                    <p className="text-[9px] text-purple-500 font-bold uppercase">{item.category}</p>
                  </div>
                </div>
                <button 
                  onClick={() => toggleBestSeller(item.id, true)}
                  className="bg-red-50 text-red-400 p-2 rounded-xl text-[9px] font-black hover:bg-red-500 hover:text-white transition-all uppercase"
                >
                  Remove
                </button>
              </div>
            ))}
            {bestSellersList.length === 0 && (
              <div className="text-center py-10">
                <p className="text-gray-300 text-xs italic font-bold">No best sellers selected.</p>
                <p className="text-gray-300 text-[9px] uppercase mt-1">Star a product in the inventory below!</p>
              </div>
            )}
          </div>
        </section>

        {/* PANEL 3: AI KNOWLEDGE */}
        <section className="bg-[#5D1DB4] p-8 rounded-[40px] shadow-2xl text-white">
          <h2 className="text-xl font-black mb-6 text-purple-200 uppercase tracking-tight italic">🤖 AI Knowledge</h2>
          <form onSubmit={handleQnaSave} className="space-y-4 mb-6">
            <input value={question} onChange={e => setQuestion(e.target.value)} placeholder="User Question?" className="w-full p-4 rounded-2xl border-none text-gray-800 shadow-inner text-sm" required />
            <textarea value={answer} onChange={e => setAnswer(e.target.value)} placeholder="AI Answer..." className="w-full p-4 rounded-2xl h-24 border-none text-gray-800 shadow-inner text-sm" required />
            <button type="submit" className="w-full bg-purple-400 text-white font-black py-4 rounded-2xl shadow-lg hover:bg-purple-300 transition-all uppercase text-sm">Train AI</button>
          </form>
          <div className="bg-purple-900/40 p-6 rounded-3xl overflow-y-auto max-h-40 space-y-3">
            {qna.map((item, i) => (
              <div key={i} className="text-[10px] border-b border-purple-700 pb-3 flex justify-between items-start">
                <div className="pr-2"><p className="font-bold text-purple-200">Q: {item.question}</p></div>
                <button onClick={() => deleteQna(i)} className="text-red-400 font-bold uppercase hover:text-red-300">Delete</button>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* MASTER INVENTORY SECTION */}
      <div className="mt-8 bg-white p-8 rounded-[40px] shadow-2xl">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <h2 className="text-2xl font-black text-[#8A38F5] uppercase tracking-tighter">📦 Master Inventory</h2>
          
          {/* CATEGORY FILTER BAR */}
          <div className="flex flex-wrap gap-2 bg-gray-100 p-2 rounded-2xl">
            {['All', 'Ramen', 'Snacks', 'Drinks', 'Meals'].map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveFilter(cat)}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${
                  activeFilter === cat ? 'bg-[#8A38F5] text-white shadow-md' : 'text-gray-500 hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredMenu.map((item) => (
            <div key={item.id} className="bg-gray-50 border-2 border-gray-100 p-6 rounded-[32px] flex flex-col gap-4 relative group hover:border-[#8A38F5]/30 transition-all">
              
              {/* INTERACTIVE STAR TOGGLE */}
              <button 
                onClick={() => toggleBestSeller(item.id, item.is_best_seller)}
                className={`absolute -top-2 -right-2 w-10 h-10 rounded-full shadow-lg flex items-center justify-center transition-all z-10 ${
                item.is_best_seller === true 
                 ? 'bg-yellow-400 scale-110' 
                 : 'bg-white text-gray-200 hover:text-yellow-400'
            }`}
              >
               ⭐
             </button>

              <div className="h-32 w-full bg-gray-200 rounded-2xl overflow-hidden">
                 <img src={item.image_url} className="w-full h-full object-cover" alt="" />
              </div>

              <div className="flex flex-col">
                <span className="font-black text-sm text-gray-800 uppercase leading-tight">{item.name}</span>
                <span className="text-green-600 font-black text-sm">₱{item.price}</span>
                <div className="mt-2 flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${item.category === 'Meals' ? 'bg-blue-400' : (item.stock_quantity > 0 ? 'bg-green-400' : 'bg-red-400')}`}></div>
                  <span className="text-[9px] text-gray-400 font-black uppercase">
                    {item.category === 'Meals' ? 'Freshly Prepared' : `Stock: ${item.stock_quantity ?? 0}`} 
                  </span>
                </div>
              </div>

              <button onClick={() => handleDelete(item.id)} className="w-full bg-red-50 text-red-500 hover:bg-red-500 hover:text-white py-4 rounded-2xl text-[10px] font-black transition-all uppercase">Delete</button>
            </div>
          ))}
        </div>
      </div>
      <Chatbot menu={menu} qna={qna} />
    </main>
  );
}