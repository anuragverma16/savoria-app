import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView } from 'framer-motion'
import { FiArrowRight, FiStar, FiClock, FiAward, FiTruck } from 'react-icons/fi'
import { GiChefToque, GiKnifeFork } from 'react-icons/gi'
import { useMenu } from '../context/MenuContext'
import MenuCard from '../components/MenuCard'

/* ─── Animation Variants ─────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.7, delay: i * 0.1, ease: [0.25, 0.46, 0.45, 0.94] } })
}

/* ─── Section Wrapper with InView ────────────────────────── */
function Section({ children, className = '' }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  return (
    <motion.section ref={ref} initial="hidden" animate={inView ? 'visible' : 'hidden'} className={className}>
      {children}
    </motion.section>
  )
}

const STATS = [
  { icon: FiStar,  value: '4.9', label: 'Average Rating' },
  { icon: GiChefToque, value: '5+', label: 'Expert Chefs' },
  { icon: FiClock, value: '30min', label: 'Avg Delivery' },
  { icon: FiTruck, value: '0k+', label: 'Orders Served' },
]

const FEATURES = [
  { icon: GiKnifeFork, title: 'Authentic Recipes', desc: 'Curated by master chefs with decades of culinary tradition and innovation.' },
  { icon: FiAward, title: 'Premium Ingredients', desc: 'Hand-picked fresh ingredients sourced daily from trusted local farms.' },
  { icon: FiTruck, title: 'Swift Delivery', desc: 'Hot, fresh meals delivered to your doorstep within 30 minutes, guaranteed.' },
  { icon: FiClock, title: 'Reserve Your Table', desc: 'Book a fine-dining experience in advance. Intimate settings for every occasion.' },
]

const TESTIMONIALS = [
  { name: 'Priya Nair', role: 'Food Critic', quote: 'Savoria redefines Indian fine dining. The Hyderabadi Biryani is unlike anything I\'ve tasted.', rating: 5, avatar: 'PN' },
  { name: 'Arjun Mehta', role: 'Regular Guest', quote: 'The butter chicken and garlic naan are absolute perfection. My family\'s favourite every weekend.', rating: 5, avatar: 'AM' },
  { name: 'Kavita Reddy', role: 'Food Blogger', quote: 'Phenomenal flavours, impeccable service, and a stunning ambience. A must-visit in Delhi.', rating: 5, avatar: 'KR' },
]

export default function HomePage() {
  const { menuItems } = useMenu()
  const bestsellers = menuItems.filter(i => i.isBestseller).slice(0, 4)

  return (
    <div className="min-h-screen">
      {/* ════════════════════════════════════════════════ HERO ══ */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Background Video */}
        <video
          autoPlay loop muted playsInline
          className="absolute inset-0 w-full h-full object-cover"
          poster="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1920&q=80"
        >
          <source src="https://assets.mixkit.co/videos/preview/mixkit-cooking-a-delicious-meal-in-a-restaurant-kitchen-41545-large.mp4" type="video/mp4" />
          {/* Fallback image shown via poster attribute */}
        </video>

        {/* Overlays */}
        <div className="absolute inset-0 video-overlay" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />

        {/* Decorative elements */}
        <div className="absolute top-32 right-10 w-64 h-64 rounded-full bg-gold-DEFAULT/5 blur-3xl" />
        <div className="absolute bottom-20 left-10 w-96 h-96 rounded-full bg-red-DEFAULT/5 blur-3xl" />

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full mb-6"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-gold-DEFAULT animate-pulse" />
            <span className="text-gold-DEFAULT text-xs font-medium uppercase tracking-widest">🎉 “Flat 20% OFF on first order"</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="font-display font-black text-5xl md:text-7xl lg:text-8xl text-white leading-none mb-6"
          >
            Where Every Bite
            <span className="block text-gold-shimmer italic">Tells a Story</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-white/60 text-lg md:text-xl max-w-2xl mx-auto mb-10 font-body font-light"
          >
            Experience the finest Indian cuisine crafted by award-winning chefs using centuries-old recipes and the freshest ingredients.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.45 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link to="/menu" className="btn-gold px-8 py-4 rounded-full text-base font-semibold flex items-center gap-2 group">
              Order Now
              <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/contact" className="btn-outline-gold px-8 py-4 rounded-full text-base font-semibold">
              Book a Table
            </Link>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="text-white/30 text-xs uppercase tracking-widest">Scroll</span>
          <div className="w-px h-12 bg-gradient-to-b from-gold-DEFAULT/40 to-transparent" />
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════════ STATS ══ */}
      <section className="py-12 border-y border-white/5 bg-surface">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {STATS.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <stat.icon className="text-gold-DEFAULT text-2xl mx-auto mb-2" />
                <p className="font-display font-bold text-3xl text-white mb-1">{stat.value}</p>
                <p className="text-white/40 text-sm">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════ BESTSELLERS ══ */}
      <Section className="py-24 max-w-7xl mx-auto px-6">
        <motion.div variants={fadeUp} className="text-center mb-14">
          <span className="text-gold-DEFAULT text-xs uppercase tracking-[4px] font-medium mb-3 block">Chef's Selection</span>
          <h2 className="font-display font-bold text-4xl md:text-5xl text-white mb-4">
            Our <span className="text-gold-gradient">Bestsellers</span>
          </h2>
          <div className="section-divider max-w-xs mx-auto">
            <span className="text-gold-DEFAULT/40 text-lg font-display">✦</span>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {bestsellers.map((item, i) => (
            <MenuCard key={item._id} item={item} index={i} />
          ))}
        </div>

        <motion.div variants={fadeUp} className="text-center mt-12">
          <Link to="/menu" className="btn-outline-gold px-8 py-3 rounded-full text-sm font-semibold inline-flex items-center gap-2 group">
            View Full Menu
            <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </Section>

      {/* ════════════════════════════════════════════ FEATURES ══ */}
      <Section className="py-24 bg-surface">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div variants={fadeUp} className="text-center mb-14">
            <span className="text-gold-DEFAULT text-xs uppercase tracking-[4px] font-medium mb-3 block">Why Choose Us</span>
            <h2 className="font-display font-bold text-4xl md:text-5xl text-white">
              The <span className="text-gold-gradient">Savoria</span> Difference
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((feat, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                custom={i}
                className="glass rounded-2xl p-6 text-center hover:border-gold-DEFAULT/30 transition-all group cursor-default"
              >
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-gold-DEFAULT/20 to-red-DEFAULT/10 flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform">
                  <feat.icon className="text-gold-DEFAULT text-2xl" />
                </div>
                <h3 className="font-display font-semibold text-white text-lg mb-2">{feat.title}</h3>
                <p className="text-white/40 text-sm leading-relaxed">{feat.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* ══════════════════════════════════════════ TESTIMONIALS ══ */}
      <Section className="py-24 max-w-7xl mx-auto px-6">
        <motion.div variants={fadeUp} className="text-center mb-14">
          <span className="text-gold-DEFAULT text-xs uppercase tracking-[4px] font-medium mb-3 block">Guest Reviews</span>
          <h2 className="font-display font-bold text-4xl md:text-5xl text-white">
            What Our <span className="text-gold-gradient">Guests Say</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <motion.div key={i} variants={fadeUp} custom={i} className="glass rounded-2xl p-6">
              <div className="flex gap-0.5 mb-4">
                {[...Array(t.rating)].map((_, j) => (
                  <FiStar key={j} className="text-gold-DEFAULT fill-gold-DEFAULT" />
                ))}
              </div>
              <p className="text-white/60 text-sm leading-relaxed mb-6 font-light italic">"{t.quote}"</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-DEFAULT to-red-dark flex items-center justify-center text-xs font-bold text-white">
                  {t.avatar}
                </div>
                <div>
                  <p className="font-semibold text-white text-sm">{t.name}</p>
                  <p className="text-white/30 text-xs">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* ══════════════════════════════════════════════════ CTA ══ */}
      <Section className="py-24 px-6">
        <motion.div
          variants={fadeUp}
          className="max-w-4xl mx-auto rounded-3xl overflow-hidden relative"
          style={{ background: 'linear-gradient(135deg, #1a0a0a 0%, #0a0a0a 50%, #0a0d0a 100%)' }}
        >
          <div className="absolute inset-0 opacity-20"
            style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #c0392b 0%, transparent 50%), radial-gradient(circle at 80% 50%, #d4af37 0%, transparent 50%)' }}
          />
          <div className="relative z-10 text-center px-8 py-16">
            <h2 className="font-display font-black text-4xl md:text-5xl text-white mb-4">
              Ready for an <span className="text-gold-gradient">Unforgettable</span> Experience?
            </h2>
            <p className="text-white/50 mb-10 max-w-xl mx-auto font-light">
              Reserve your table today or order online for delivery. Crafted with passion, delivered with love.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/menu" className="btn-gold px-8 py-4 rounded-full text-base font-semibold">Order Online</Link>
              <Link to="/contact" className="btn-outline-gold px-8 py-4 rounded-full text-base font-semibold">Book a Table</Link>
            </div>
          </div>
        </motion.div>
      </Section>
    </div>
  )
}
