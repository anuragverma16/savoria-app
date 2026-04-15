import { motion } from 'framer-motion'
import { FiMapPin, FiPhone, FiMail, FiClock, FiSend } from 'react-icons/fi'
import { GiKnifeFork, GiChefToque } from 'react-icons/gi'
import { useState } from 'react'
import toast from 'react-hot-toast'

const SERVICES = [
  { icon: GiKnifeFork, title: 'Fine Dining',       desc: 'An intimate, candlelit dining experience with a la carte and tasting menus curated by our head chef.' },
  { icon: GiChefToque, title: 'Private Events',    desc: 'Exclusive venue hire for weddings, corporate dinners, anniversaries, and celebrations of all kinds.' },
  { icon: '🚀',         title: 'Express Delivery',  desc: 'Hot meals delivered to your door in 30 minutes or less, within a 10km radius, 7 days a week.' },
  { icon: '🍷',         title: 'Wine Pairing',      desc: 'Our sommelier curates perfect wine pairings for your meal, with an extensive cellar of Indian & international wines.' },
  { icon: '🎂',         title: 'Custom Catering',   desc: 'Full-service catering for 10 to 500 guests. Menu designed entirely around your occasion and tastes.' },
  { icon: '📅',         title: 'Table Reservations', desc: 'Book your preferred date, time and seating. Special requests for décor and ambience always welcome.' },
]

export function ServicesPage() {
  return (
    <div className="min-h-screen pt-24 pb-20">
      {/* Hero */}
      <div className="relative py-20 mb-16 overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 30% 50%, #c0392b 0%, transparent 50%), radial-gradient(circle at 70% 50%, #d4af37 0%, transparent 50%)' }} />
        <div className="relative max-w-7xl mx-auto px-6 text-center">
          <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-gold-DEFAULT text-xs uppercase tracking-[4px] font-medium mb-3 block">What We Offer</motion.span>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="font-display font-black text-5xl md:text-6xl text-white mb-4">
            Our <span className="text-gold-gradient">Services</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="text-white/40 text-lg font-light max-w-xl mx-auto">
            From intimate dinners to grand celebrations — we craft experiences that linger long after the last bite.
          </motion.p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SERVICES.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass rounded-2xl p-7 group hover:border-gold-DEFAULT/30 transition-all cursor-default"
            >
              <div className="text-3xl mb-5 group-hover:scale-110 transition-transform duration-300 inline-block">
                {typeof s.icon === 'string' ? s.icon : <s.icon className="text-gold-DEFAULT" />}
              </div>
              <h3 className="font-display font-semibold text-xl text-white mb-3">{s.title}</h3>
              <p className="text-white/40 text-sm leading-relaxed">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '', type: 'general' })
  const [sending, setSending] = useState(false)
  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSending(true)
    await new Promise(r => setTimeout(r, 1200))
    toast.success('Message sent! We\'ll get back to you shortly.', {
      style: { background: '#1a1a1a', color: '#f5f5f0', border: '1px solid rgba(212,175,55,0.2)' }
    })
    setForm({ name: '', email: '', phone: '', message: '', type: 'general' })
    setSending(false)
  }

  return (
    <div className="min-h-screen pt-24 pb-20 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-14">
          <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-gold-DEFAULT text-xs uppercase tracking-[4px] font-medium mb-3 block">Reach Out</motion.span>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="font-display font-black text-5xl text-white mb-4">
            Get In <span className="text-gold-gradient">Touch</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="text-white/40 font-light max-w-md mx-auto">
            Reservations, private events, feedback — we'd love to hear from you.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Info Cards */}
          <div className="lg:col-span-2 space-y-4">
            {[
              { icon: FiMapPin, label: 'Visit Us',      value: '12 Connaught Place\nNew Delhi, 110001' },
              { icon: FiPhone,  label: 'Call Us',       value: '+91 11 4567 8901\n+91 98765 43210' },
              { icon: FiMail,   label: 'Email Us',      value: 'hello@savoria.in\nevents@savoria.in' },
              { icon: FiClock,  label: 'Opening Hours', value: 'Mon–Thu: 12:00–23:00\nFri–Sat: 12:00–00:00\nSunday: 13:00–22:00' },
            ].map((info, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} className="glass rounded-xl p-5 flex gap-4">
                <div className="w-10 h-10 rounded-lg bg-gold-DEFAULT/10 flex items-center justify-center flex-shrink-0">
                  <info.icon className="text-gold-DEFAULT" />
                </div>
                <div>
                  <p className="text-white/40 text-xs uppercase tracking-wider mb-1">{info.label}</p>
                  {info.value.split('\n').map((line, j) => (
                    <p key={j} className="text-white/70 text-sm">{line}</p>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Contact Form */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-3 glass rounded-2xl p-7">
            <h3 className="font-display font-semibold text-xl text-white mb-6">Send a Message</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-white/40 uppercase tracking-wider mb-1.5 block">Your Name</label>
                  <input value={form.name} onChange={set('name')} required placeholder="Full name" className="input-dark w-full px-4 py-3 rounded-xl text-sm" />
                </div>
                <div>
                  <label className="text-xs text-white/40 uppercase tracking-wider mb-1.5 block">Phone</label>
                  <input value={form.phone} onChange={set('phone')} placeholder="+91 98765 43210" className="input-dark w-full px-4 py-3 rounded-xl text-sm" />
                </div>
              </div>
              <div>
                <label className="text-xs text-white/40 uppercase tracking-wider mb-1.5 block">Email</label>
                <input type="email" value={form.email} onChange={set('email')} required placeholder="you@example.com" className="input-dark w-full px-4 py-3 rounded-xl text-sm" />
              </div>
              <div>
                <label className="text-xs text-white/40 uppercase tracking-wider mb-1.5 block">Enquiry Type</label>
                <select value={form.type} onChange={set('type')} className="input-dark w-full px-4 py-3 rounded-xl text-sm">
                  <option value="general">General Enquiry</option>
                  <option value="reservation">Table Reservation</option>
                  <option value="private">Private Event</option>
                  <option value="feedback">Feedback</option>
                  <option value="catering">Catering</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-white/40 uppercase tracking-wider mb-1.5 block">Message</label>
                <textarea value={form.message} onChange={set('message')} required rows={5} placeholder="How can we help you?" className="input-dark w-full px-4 py-3 rounded-xl text-sm resize-none" />
              </div>
              <button type="submit" disabled={sending} className="btn-gold w-full py-4 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-70">
                {sending ? (
                  <><div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> Sending...</>
                ) : (
                  <><FiSend /> Send Message</>
                )}
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
