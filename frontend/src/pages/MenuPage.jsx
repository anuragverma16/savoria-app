import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiSearch, FiFilter, FiX } from 'react-icons/fi'
import { FaLeaf } from 'react-icons/fa'
import { useMenu } from '../context/MenuContext'
import MenuCard from '../components/MenuCard'

export default function MenuPage() {
  const { menuItems, categories } = useMenu()
  const [activeCategory, setActiveCategory] = useState('All')
  const [search, setSearch] = useState('')
  const [vegOnly, setVegOnly] = useState(false)
  const [sortBy, setSortBy] = useState('default')

  const filtered = useMemo(() => {
    let list = [...menuItems]
    if (activeCategory !== 'All') list = list.filter(i => i.category === activeCategory)
    if (search) list = list.filter(i => i.name.toLowerCase().includes(search.toLowerCase()) || i.description.toLowerCase().includes(search.toLowerCase()))
    if (vegOnly) list = list.filter(i => i.isVeg)
    if (sortBy === 'price-asc') list.sort((a, b) => a.price - b.price)
    if (sortBy === 'price-desc') list.sort((a, b) => b.price - a.price)
    if (sortBy === 'rating') list.sort((a, b) => b.rating - a.rating)
    return list
  }, [menuItems, activeCategory, search, vegOnly, sortBy])

  return (
    <div className="min-h-screen pt-24 pb-16">
      {/* Header */}
      <div className="relative overflow-hidden bg-surface border-b border-white/5 py-16 mb-10">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 30% 50%, #c0392b 0%, transparent 60%), radial-gradient(circle at 70% 50%, #d4af37 0%, transparent 60%)' }} />
        <div className="relative max-w-7xl mx-auto px-6 text-center">
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-gold-DEFAULT text-xs uppercase tracking-[4px] font-medium mb-3 block"
          >
            Explore
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display font-black text-5xl md:text-6xl text-white mb-4"
          >
            Our <span className="text-gold-gradient">Menu</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-white/40 text-lg font-light max-w-xl mx-auto"
          >
            {menuItems.length} dishes crafted with passion and the finest ingredients
          </motion.p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6">
        {/* ── Controls Row ── */}
        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          {/* Search */}
          <div className="relative flex-1">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              type="text"
              placeholder="Search dishes, ingredients..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input-dark w-full pl-11 pr-4 py-3 rounded-xl text-sm"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
                <FiX />
              </button>
            )}
          </div>

          {/* Veg Toggle */}
          <button
            onClick={() => setVegOnly(!vegOnly)}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl border text-sm font-medium transition-all ${vegOnly ? 'bg-green-500/15 border-green-500/40 text-green-400' : 'glass-light border-white/10 text-white/50 hover:text-white/70'}`}
          >
            <FaLeaf /> Veg Only
          </button>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="input-dark px-4 py-3 rounded-xl text-sm min-w-[160px] cursor-pointer"
          >
            <option value="default className='bg-black'">Sort: Featured</option>
            <option value="price-asc" className='bg-black'>Price: Low → High</option>
            <option value="price-desc" className='bg-black'>Price: High → Low</option>
            <option value="rating" className='bg-black'>Highest Rated</option>
          </select>
        </div>

        {/* ── Category Pills ── */}
        <div className="flex flex-wrap gap-2 mb-10">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`category-pill px-5 py-2 rounded-full text-sm font-medium border ${activeCategory === cat ? 'active' : 'glass-light border-white/10 text-white/50'}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* ── Results Count ── */}
        <div className="mb-6 flex items-center gap-3">
          <span className="text-white/30 text-sm">{filtered.length} {filtered.length === 1 ? 'dish' : 'dishes'} found</span>
          {(search || vegOnly || activeCategory !== 'All') && (
            <button
              onClick={() => { setSearch(''); setVegOnly(false); setActiveCategory('All'); setSortBy('default') }}
              className="text-xs text-red-light hover:text-red-DEFAULT flex items-center gap-1"
            >
              <FiX className="text-xs" /> Clear filters
            </button>
          )}
        </div>

        {/* ── Menu Grid ── */}
        <AnimatePresence mode="wait">
          {filtered.length > 0 ? (
            <motion.div
              key={activeCategory + search + vegOnly}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {filtered.map((item, i) => (
                <MenuCard key={item._id} item={item} index={i} />
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-24"
            >
              <div className="text-6xl mb-4 opacity-30">🍽️</div>
              <p className="font-display text-2xl text-white/30 mb-2">No dishes found</p>
              <p className="text-white/20 text-sm">Try adjusting your search or filters</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
