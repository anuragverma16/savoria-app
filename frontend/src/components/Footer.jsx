import { Link } from 'react-router-dom'
import { GiKnifeFork } from 'react-icons/gi'
import { FiInstagram, FiFacebook, FiTwitter, FiYoutube, FiMapPin, FiPhone, FiMail } from 'react-icons/fi'

export default function Footer() {
  return (
    <footer className="bg-surface border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <GiKnifeFork className="text-gold-DEFAULT text-2xl" />
              <span className="font-display text-2xl font-bold text-gold-gradient">Savoria</span>
            </div>
            <p className="text-white/40 text-sm leading-relaxed mb-6">
              Where culinary artistry meets an unforgettable dining experience. Bringing India's finest flavours to your table.
            </p>
            <div className="flex items-center gap-3">
              {[FiInstagram, FiFacebook, FiTwitter, FiYoutube].map((Icon, i) => (
                <a key={i} href="#" className="w-9 h-9 rounded-full glass-light border-gold flex items-center justify-center text-white/50 hover:text-gold-DEFAULT hover:border-gold-DEFAULT/50 transition-all">
                  <Icon className="text-sm" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display font-semibold text-white mb-5">Quick Links</h4>
            <ul className="space-y-3">
              {[['/', 'Home'], ['/menu', 'Menu'], ['/cart', 'Cart'], ['/login', 'Sign In'], ['/contact', 'Contact']].map(([to, label]) => (
                <li key={to}>
                  <Link to={to} className="text-sm text-white/40 hover:text-gold-DEFAULT transition-colors flex items-center gap-2 group">
                    <span className="w-1 h-1 rounded-full bg-gold-DEFAULT/40 group-hover:bg-gold-DEFAULT transition-colors"></span>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Hours */}
          <div>
            <h4 className="font-display font-semibold text-white mb-5">Opening Hours</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex justify-between">
                <span className="text-white/40">Mon – Thu</span>
                <span className="text-white/70">12:00 – 23:00</span>
              </li>
              <li className="flex justify-between">
                <span className="text-white/40">Fri – Sat</span>
                <span className="text-white/70">12:00 – 00:00</span>
              </li>
              <li className="flex justify-between">
                <span className="text-white/40">Sunday</span>
                <span className="text-white/70">13:00 – 22:00</span>
              </li>
            </ul>
            <div className="mt-5 pt-5 border-t border-white/5">
              <span className="inline-flex items-center gap-2 text-xs text-green-400">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                Open Now · Closes at 23:00
              </span>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display font-semibold text-white mb-5">Get In Touch</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-sm text-white/40">
                <FiMapPin className="mt-0.5 text-gold-DEFAULT flex-shrink-0" />
                <span>12 Connaught Place, New Delhi, 110001</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-white/40">
                <FiPhone className="text-gold-DEFAULT flex-shrink-0" />
                <span>+91 11 4567 8901</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-white/40">
                <FiMail className="text-gold-DEFAULT flex-shrink-0" />
                <span>hello@savoria.in</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/25 text-xs">© 2024 Savoria. All rights reserved.</p>
          <div className="flex items-center gap-6">
            {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map(t => (
              <a key={t} href="#" className="text-white/25 text-xs hover:text-gold-DEFAULT transition-colors">{t}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
