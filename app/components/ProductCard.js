'use client';

import Link from 'next/link';

// 1. Export the ProductCard
export function ProductCard({ product }) {
  return (
    <div className="bg-white dark:bg-zinc-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-zinc-700 transition-transform hover:scale-[1.02]">
      <div className="h-48 w-full rounded-xl overflow-hidden mb-4 bg-gray-100">
        <img 
          src={product.image || '/placeholder.jpg'} 
          alt={product.name} 
          className="w-full h-full object-cover" 
        />
      </div>
      <h3 className="font-bold text-lg text-gray-800 dark:text-white uppercase truncate">{product.name}</h3>
      <p className="text-[#8A38F5] font-black text-xl mb-4">₱{product.price}</p>
      <Link 
        href={`/shop/${product.id}`}
        className="block text-center w-full py-3 bg-gray-100 dark:bg-zinc-700 rounded-xl font-bold text-xs uppercase hover:bg-gray-200 transition-colors"
      >
        View Details
      </Link>
    </div>
  );
}

// 2. Export the FeatureCard (THIS WAS LIKELY MISSING)
export function FeatureCard({ emoji, title, desc, color }) {
  return (
    <div className="p-8 bg-white dark:bg-zinc-800 rounded-[32px] text-center shadow-sm border border-gray-100 dark:border-zinc-700">
      <div 
        className="w-16 h-16 mx-auto mb-6 rounded-2xl flex items-center justify-center text-3xl shadow-inner"
        style={{ backgroundColor: `${color}20`, color: color }}
      >
        {emoji}
      </div>
      <h3 className="text-xl font-black mb-2 uppercase tracking-tight" style={{ color: color }}>{title}</h3>
      <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
    </div>
  );
}