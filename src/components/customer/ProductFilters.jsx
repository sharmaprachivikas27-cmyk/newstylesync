import React from 'react';
import { Filter, X, RotateCcw } from 'lucide-react';

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '38R', '40R', '42R', 'One Size'];

const COLOR_SWATCHES = [
  { name: 'Camel Tan', hex: '#c29b68' },
  { name: 'Midnight Black', hex: '#0f172a' },
  { name: 'Cream White', hex: '#f8fafc' },
  { name: 'Terracotta Rose', hex: '#fb7185' },
  { name: 'Deep Navy', hex: '#1e1b4b' },
  { name: 'Washed Olive', hex: '#3f4f3e' },
  { name: 'Champagne Pearl', hex: '#fed7aa' },
  { name: 'Indigo Selvedge', hex: '#1e3a8a' },
];

export default function ProductFilters({
  categories = [],
  selectedCategory = 'All',
  onSelectCategory,
  priceRange = [0, 2000],
  maxPossiblePrice = 2000,
  onChangePrice,
  selectedSize = '',
  onSelectSize,
  selectedColor = '',
  onSelectColor,
  inStockOnly = false,
  onToggleInStock,
  onResetFilters,
  onCloseMobile
}) {
  const hasActiveFilters =
    selectedCategory !== 'All' ||
    priceRange[1] < maxPossiblePrice ||
    priceRange[0] > 0 ||
    selectedSize !== '' ||
    selectedColor !== '' ||
    inStockOnly;

  return (
    <div className="space-y-6 text-sm">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2 font-display font-bold text-slate-900 dark:text-white">
          <Filter className="w-4 h-4 text-brand-600 dark:text-brand-400" />
          <span>Filters</span>
        </div>

        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <button
              onClick={onResetFilters}
              className="text-xs font-semibold text-rose-500 hover:text-rose-600 flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              Reset
            </button>
          )}
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Category Filter */}
      <div>
        <h4 className="font-semibold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
          Category
        </h4>
        <div className="space-y-1.5">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => onSelectCategory(cat)}
              className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-colors flex items-center justify-between ${
                selectedCategory.toLowerCase() === cat.toLowerCase()
                  ? 'bg-brand-600 text-white font-semibold shadow-soft'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <span>{cat}</span>
              {selectedCategory.toLowerCase() === cat.toLowerCase() && (
                <span className="w-1.5 h-1.5 rounded-full bg-white" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-semibold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Max Price
          </h4>
          <span className="text-xs font-bold text-brand-600 dark:text-brand-400">
            ${priceRange[1]}
          </span>
        </div>
        <input
          type="range"
          min={30}
          max={maxPossiblePrice}
          step={5}
          value={priceRange[1]}
          onChange={(e) => onChangePrice([priceRange[0], Number(e.target.value)])}
          className="w-full accent-brand-600 dark:accent-brand-500 cursor-pointer"
        />
        <div className="flex justify-between text-[11px] text-slate-400 mt-1">
          <span>$30</span>
          <span>${maxPossiblePrice}+</span>
        </div>
      </div>

      {/* Size Filter */}
      <div>
        <h4 className="font-semibold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
          Size
        </h4>
        <div className="flex flex-wrap gap-1.5">
          {SIZES.map((sz) => {
            const isSelected = selectedSize === sz;
            return (
              <button
                key={sz}
                onClick={() => onSelectSize(isSelected ? '' : sz)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                  isSelected
                    ? 'border-brand-600 bg-brand-600 text-white font-bold shadow-soft'
                    : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-brand-400 bg-white dark:bg-slate-900'
                }`}
              >
                {sz}
              </button>
            );
          })}
        </div>
      </div>

      {/* Color Filter */}
      <div>
        <h4 className="font-semibold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
          Color
        </h4>
        <div className="flex flex-wrap gap-2">
          {COLOR_SWATCHES.map((c) => {
            const isSelected = selectedColor.toLowerCase() === c.name.toLowerCase();
            return (
              <button
                key={c.name}
                onClick={() => onSelectColor(isSelected ? '' : c.name)}
                title={c.name}
                className={`w-7 h-7 rounded-full border-2 transition-all flex items-center justify-center ${
                  isSelected
                    ? 'ring-2 ring-brand-600 dark:ring-brand-400 ring-offset-2 dark:ring-offset-slate-950 scale-110'
                    : 'border-slate-200 dark:border-slate-700 hover:scale-105'
                }`}
                style={{ backgroundColor: c.hex }}
              >
                {isSelected && (
                  <span className={`w-2 h-2 rounded-full ${c.hex === '#f8fafc' ? 'bg-slate-900' : 'bg-white'}`} />
                )}
              </button>
            );
          })}
        </div>
        {selectedColor && (
          <p className="text-[11px] text-brand-600 dark:text-brand-400 mt-2 font-medium">
            Selected: {selectedColor}
          </p>
        )}
      </div>

      {/* In-Stock Toggle */}
      <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            In Stock Only
          </span>
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => onToggleInStock(e.target.checked)}
            className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 border-slate-300 dark:border-slate-700"
          />
        </label>
      </div>

    </div>
  );
}
