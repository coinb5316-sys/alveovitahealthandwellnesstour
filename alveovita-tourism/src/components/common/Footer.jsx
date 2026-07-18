// src/components/common/Footer.jsx - Updated with Blue-Black Theme
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
      <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-blue-500/30">
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
    { icon: FaTwitter, href: '#', color: 'hover:text-cyan-400' },
    { icon: FaInstagram, href: '#', color: 'hover:text-pink-500' },
    { icon: FaLinkedin, href: '#', color: 'hover:text-blue-600' },
    { icon: FaYoutube, href: '#', color: 'hover:text-red-500' },
    { icon: FaWhatsapp, href: '#', color: 'hover:text-green-500' },
    { icon: FaTiktok, href: '#', color: 'hover:text-gray-400' },
    { icon: FaPinterest, href: '#', color: 'hover:text-red-600' },
  ]

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: 'easeOut' },
    },
  }

  return (
    <footer className={`${isDark ? 'bg-gray-950' : 'bg-gray-900'} text-white transition-colors duration-300 border-t ${isDark ? 'border-blue-900/30' : 'border-blue-900/30'}`}>
      {/* Top Gradient Bar - Blue Theme */}
      <div className="h-0.5 w-full bg-gradient-to-r from-blue-400/50 via-indigo-400 to-blue-400/50" />

      {/* Newsletter Section - Blue Theme */}
      <div className={`border-b ${isDark ? 'border-blue-900/20' : 'border-blue-900/20'}`}>
        <div className="container-custom py-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="grid md:grid-cols-2 gap-8 items-center"
          >
            <div>
              <h3 className="text-2xl font-bold text-blue-400">Subscribe to Our Newsletter</h3>
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
                } border focus:border-blue-400 transition-colors focus:ring-2 focus:ring-blue-400/20`}
              />
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-medium hover:shadow-lg hover:shadow-blue-500/30 transition-all shadow-lg shadow-blue-500/20"
              >
                Subscribe
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Footer */}
      <motion.div 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={containerVariants}
        className="container-custom py-16"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Company Info - Blue Theme */}
          <motion.div variants={itemVariants} className="lg:col-span-1">
            <div className="flex items-center space-x-3 mb-4">
              <LogoSection />
              <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                Alveovita
              </span>
            </div>
            <p className="text-gray-400 mb-6 leading-relaxed text-sm">
              Bridging the gap between healthcare and travel with transformative wellness experiences in Ghana.
            </p>
            <div className="flex flex-wrap gap-2">
              {socialLinks.map((social, index) => (
                <motion.a
                  key={index}
                  href={social.href}
                  whileHover={{ scale: 1.15, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className={`text-gray-400 ${social.color} transition-all bg-gray-800 p-2.5 rounded-full hover:bg-gray-700 hover:shadow-lg hover:shadow-blue-500/10`}
                  aria-label={`Visit our ${social.icon.name} page`}
                >
                  <social.icon className="w-4 h-4" />
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Company Links - Blue Theme */}
          <motion.div variants={itemVariants}>
            <h3 className="text-lg font-bold mb-4 text-blue-400">Company</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link, index) => (
                <li key={index}>
                  <Link 
                    to={link.href} 
                    className="text-gray-400 hover:text-white transition-all hover:translate-x-2 transform inline-block text-sm group"
                  >
                    <span className="group-hover:text-blue-400 transition-colors">{link.name}</span>
                    <span className="inline-block w-0 group-hover:w-2 h-0.5 bg-blue-400 ml-1 transition-all duration-300"></span>
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Services Links - Blue Theme */}
          <motion.div variants={itemVariants}>
            <h3 className="text-lg font-bold mb-4 text-blue-400">Services</h3>
            <ul className="space-y-2">
              {footerLinks.services.map((link, index) => (
                <li key={index}>
                  <Link 
                    to={link.href} 
                    className="text-gray-400 hover:text-white transition-all hover:translate-x-2 transform inline-block text-sm group"
                  >
                    <span className="group-hover:text-blue-400 transition-colors">{link.name}</span>
                    <span className="inline-block w-0 group-hover:w-2 h-0.5 bg-blue-400 ml-1 transition-all duration-300"></span>
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Support Links - Blue Theme */}
          <motion.div variants={itemVariants}>
            <h3 className="text-lg font-bold mb-4 text-blue-400">Support</h3>
            <ul className="space-y-2">
              {footerLinks.support.map((link, index) => (
                <li key={index}>
                  <Link 
                    to={link.href} 
                    className="text-gray-400 hover:text-white transition-all hover:translate-x-2 transform inline-block text-sm group"
                  >
                    <span className="group-hover:text-blue-400 transition-colors">{link.name}</span>
                    <span className="inline-block w-0 group-hover:w-2 h-0.5 bg-blue-400 ml-1 transition-all duration-300"></span>
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Contact Info - Blue Theme */}
          <motion.div variants={itemVariants}>
            <h3 className="text-lg font-bold mb-4 text-blue-400">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3 group">
                <MdLocationOn className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                <span className="text-gray-400 group-hover:text-white transition-colors text-sm">
                  123 Independence Avenue,<br />
                  Accra, Ghana
                </span>
              </li>
              <li className="flex items-center space-x-3 group">
                <MdPhone className="w-5 h-5 text-blue-400 flex-shrink-0 group-hover:scale-110 transition-transform" />
                <span className="text-gray-400 group-hover:text-white transition-colors text-sm">+233 55 123 4567</span>
              </li>
              <li className="flex items-center space-x-3 group">
                <MdEmail className="w-5 h-5 text-blue-400 flex-shrink-0 group-hover:scale-110 transition-transform" />
                <span className="text-gray-400 group-hover:text-white transition-colors text-sm">info@alveovita.com</span>
              </li>
              <li className="flex items-center space-x-3 group">
                <MdPublic className="w-5 h-5 text-blue-400 flex-shrink-0 group-hover:scale-110 transition-transform" />
                <span className="text-gray-400 group-hover:text-white transition-colors text-sm">www.alveovita.com</span>
              </li>
              <li className="flex items-center space-x-3 group">
                <MdAccessTime className="w-5 h-5 text-blue-400 flex-shrink-0 group-hover:scale-110 transition-transform" />
                <span className="text-gray-400 group-hover:text-white transition-colors text-sm">24/7 Available</span>
              </li>
            </ul>
          </motion.div>
        </div>
      </motion.div>

      {/* Bottom Bar - Blue Theme */}
      <div className={`border-t ${isDark ? 'border-blue-900/20' : 'border-blue-900/20'}`}>
        <div className="container-custom py-6">
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            viewport={{ once: true }}
            className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0"
          >
            <p className="text-gray-400 text-sm">
              &copy; {currentYear} Alveovita Health & Wellness Tourism. All rights reserved.
            </p>
            <div className="flex items-center space-x-6 text-sm flex-wrap justify-center">
              {footerLinks.legal.map((link, index) => (
                <Link 
                  key={index} 
                  to={link.href} 
                  className="text-gray-400 hover:text-blue-400 transition-colors hover:scale-105 transform"
                >
                  {link.name}
                </Link>
              ))}
              <span className="text-gray-400 flex items-center">
                Made with <FaHeart className="w-4 h-4 mx-1 text-red-500 animate-pulse" /> in Ghana
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </footer>
  )
}

export default Footer