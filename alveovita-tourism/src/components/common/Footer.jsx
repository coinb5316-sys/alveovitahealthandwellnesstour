// src/components/common/Footer.jsx
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaYoutube,
  FaHeart, FaWhatsapp, FaTelegram, FaTiktok, FaPinterest
} from 'react-icons/fa'
import { 
  MdLocationOn, MdPhone, MdEmail, MdPublic, MdAccessTime
} from 'react-icons/md'
import { useTheme } from '../../context/ThemeContext'
import logo from '../../assets/images/sun1.png?url'
import { useState } from 'react'

const Footer = () => {
  const currentYear = new Date().getFullYear()
  const [logoError, setLogoError] = useState(false)
  const { isDark } = useTheme()

  const LogoSection = () => {
    if (!logoError && logo) {
      return (
        <img 
          src={logo} 
          alt="Alveovita" 
          className="h-14 w-auto object-contain"
          onError={() => setLogoError(true)}
        />
      )
    }
    return (
      <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center text-white font-bold text-2xl">
        <span className="font-display">A</span>
      </div>
    )
  }

  const footerLinks = {
    company: [
      { name: 'About Us', href: '/about' },
      { name: 'Our Team', href: '/team' },
      { name: 'Careers', href: '/careers' },
      { name: 'Press Kit', href: '/press' },
      { name: 'Investors', href: '/investors' },
    ],
    services: [
      { name: 'Wellness Retreats', href: '/services/wellness' },
      { name: 'Medical Tourism', href: '/services/medical' },
      { name: 'Corporate Wellness', href: '/services/corporate' },
      { name: 'Special Programs', href: '/services/special' },
      { name: 'Cultural Tourism', href: '/services/cultural' },
    ],
    support: [
      { name: 'Help Center', href: '/help' },
      { name: 'Contact Us', href: '/contact' },
      { name: 'FAQ', href: '/faq' },
      { name: 'Live Chat', href: '/chat' },
      { name: 'Feedback', href: '/feedback' },
    ],
    legal: [
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Terms of Service', href: '/terms' },
    { name: 'Cookie Policy', href: '/cookies' },
    { name: 'Security', href: '/security' },
    { name: 'Accessibility', href: '/accessibility' },
  ]
  }

  const socialLinks = [
    { icon: FaFacebook, href: '#', color: 'hover:text-blue-500' },
    { icon: FaTwitter, href: '#', color: 'hover:text-sky-400' },
    { icon: FaInstagram, href: '#', color: 'hover:text-pink-500' },
    { icon: FaLinkedin, href: '#', color: 'hover:text-blue-600' },
    { icon: FaYoutube, href: '#', color: 'hover:text-red-500' },
    { icon: FaWhatsapp, href: '#', color: 'hover:text-green-500' },
    { icon: FaTiktok, href: '#', color: 'hover:text-gray-400' },
    { icon: FaPinterest, href: '#', color: 'hover:text-red-600' },
  ]

  return (
    <footer className={`${isDark ? 'bg-gray-950' : 'bg-gray-900'} text-white transition-colors duration-300 border-t ${isDark ? 'border-gray-800' : 'border-gray-800'}`}>
      {/* Newsletter Section */}
      <div className={`border-b ${isDark ? 'border-gray-800' : 'border-gray-800'}`}>
        <div className="container-custom py-12">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl font-bold text-amber-400">Subscribe to Our Newsletter</h3>
              <p className="text-gray-400 mt-2">Get the latest wellness tips, exclusive offers, and travel inspiration.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                placeholder="Enter your email"
                className={`flex-1 px-4 py-3 rounded-xl outline-none ${
                  isDark 
                    ? 'bg-gray-800 text-white placeholder-gray-400 border-gray-700'
                    : 'bg-gray-800 text-white placeholder-gray-400 border-gray-700'
                } border focus:border-amber-400 transition-colors`}
              />
              <button className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium hover:scale-105 transition-all shadow-lg shadow-amber-500/30">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container-custom py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-3 mb-4">
              <LogoSection />
              <span className="text-xl font-bold">Alveovita</span>
            </div>
            <p className="text-gray-400 mb-6 leading-relaxed text-sm">
              Bridging the gap between healthcare and travel with transformative wellness experiences in Ghana.
            </p>
            <div className="flex flex-wrap gap-2">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  className={`text-gray-400 ${social.color} transition-all hover:scale-110 transform bg-gray-800 p-2 rounded-full hover:bg-gray-700`}
                  aria-label={`Visit our ${social.icon.name} page`}
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-amber-400">Company</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link, index) => (
                <li key={index}>
                  <Link to={link.href} className="text-gray-400 hover:text-white transition-colors hover:translate-x-2 transform inline-block text-sm">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services Links */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-amber-400">Services</h3>
            <ul className="space-y-2">
              {footerLinks.services.map((link, index) => (
                <li key={index}>
                  <Link to={link.href} className="text-gray-400 hover:text-white transition-colors hover:translate-x-2 transform inline-block text-sm">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-amber-400">Support</h3>
            <ul className="space-y-2">
              {footerLinks.support.map((link, index) => (
                <li key={index}>
                  <Link to={link.href} className="text-gray-400 hover:text-white transition-colors hover:translate-x-2 transform inline-block text-sm">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-amber-400">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3 group">
                <MdLocationOn className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                <span className="text-gray-400 group-hover:text-white transition-colors text-sm">
                  123 Independence Avenue,<br />
                  Accra, Ghana
                </span>
              </li>
              <li className="flex items-center space-x-3 group">
                <MdPhone className="w-5 h-5 text-amber-400 flex-shrink-0 group-hover:scale-110 transition-transform" />
                <span className="text-gray-400 group-hover:text-white transition-colors text-sm">+233 55 123 4567</span>
              </li>
              <li className="flex items-center space-x-3 group">
                <MdEmail className="w-5 h-5 text-amber-400 flex-shrink-0 group-hover:scale-110 transition-transform" />
                <span className="text-gray-400 group-hover:text-white transition-colors text-sm">info@alveovita.com</span>
              </li>
              <li className="flex items-center space-x-3 group">
                <MdPublic className="w-5 h-5 text-amber-400 flex-shrink-0 group-hover:scale-110 transition-transform" />
                <span className="text-gray-400 group-hover:text-white transition-colors text-sm">www.alveovita.com</span>
              </li>
              <li className="flex items-center space-x-3 group">
                <MdAccessTime className="w-5 h-5 text-amber-400 flex-shrink-0 group-hover:scale-110 transition-transform" />
                <span className="text-gray-400 group-hover:text-white transition-colors text-sm">24/7 Available</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className={`border-t ${isDark ? 'border-gray-800' : 'border-gray-800'}`}>
        <div className="container-custom py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-400 text-sm">
              &copy; {currentYear} Alveovita Health & Wellness Tourism. All rights reserved.
            </p>
            <div className="flex items-center space-x-6 text-sm flex-wrap justify-center">
              {footerLinks.legal.map((link, index) => (
                <Link key={index} to={link.href} className="text-gray-400 hover:text-amber-400 transition-colors">
                  {link.name}
                </Link>
              ))}
              <span className="text-gray-400 flex items-center">
                Made with <FaHeart className="w-4 h-4 mx-1 text-red-500 animate-pulse" /> in Ghana
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer