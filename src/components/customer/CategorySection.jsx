import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';

const CATEGORIES = [
  {
    name: 'Women',
    slug: 'Women',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80',
    itemCount: '7 Styles'
  },
  {
    name: 'Men',
    slug: 'Men',
    image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=600&q=80',
    itemCount: '6 Styles'
  },
  {
    name: 'Outerwear',
    slug: 'Outerwear',
    image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=600&q=80',
    itemCount: '4 Styles'
  },
  {
    name: 'Streetwear',
    slug: 'Streetwear',
    image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=600&q=80',
    itemCount: '5 Styles'
  },
  {
    name: 'Formal',
    slug: 'Formal',
    image: 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=600&q=80',
    itemCount: '3 Styles'
  },
  {
    name: 'Accessories',
    slug: 'Accessories',
    image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=600&q=80',
    itemCount: '3 Styles'
  }
];

export default function CategorySection() {
  return (
    <section className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs uppercase font-extrabold tracking-widest text-coral-500">
              Department Capsules
            </span>
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-slate-900 dark:text-white mt-1">
              Shop by Category
            </h2>
          </div>
          <Link
            to="/products"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-700 transition-colors"
          >
            <span>View All Collections</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.name}
              to={`/products?category=${encodeURIComponent(cat.slug)}`}
              className="group relative aspect-[3/4] rounded-2xl overflow-hidden shadow-soft hover:shadow-soft-lg transition-all duration-300"
            >
              <img
                src={cat.image}
                alt={cat.name}
                className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-500"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent flex flex-col justify-end p-3.5 text-white transition-opacity">
                <span className="text-[10px] text-slate-300 uppercase tracking-wider font-medium">
                  {cat.itemCount}
                </span>
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-bold text-sm sm:text-base group-hover:text-coral-300 transition-colors">
                    {cat.name}
                  </h3>
                  <div className="w-6 h-6 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
