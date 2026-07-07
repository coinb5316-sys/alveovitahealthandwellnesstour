// src/pages/TermsOfService.jsx
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import Navbar from '../components/common/Navbar'
import Footer from '../components/common/Footer'
import { 
  FileText, Shield, CheckCircle, AlertCircle,
  ArrowRight, Calendar, Scale, BookOpen,
  Lock, Eye, Users, Database, Server,
  Cloud, Key, Smartphone, Laptop,
  Mail, Phone, MapPin, Clock
} from 'lucide-react'

const TermsOfService = () => {
  const { isDark } = useTheme()
  const lastUpdated = 'January 15, 2025'

  const sections = [
    {
      title: 'Acceptance of Terms',
      content: 'By using our website and services, you agree to comply with and be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.'
    },
    {
      title: 'Services Description',
      content: 'Alveovita provides health and wellness tourism services including medical tourism, wellness retreats, corporate wellness programs, and cultural experiences. We connect clients with quality healthcare and wellness providers.'
    },
    {
      title: 'User Accounts',
      content: 'You may need to create an account to access certain features. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.'
    },
    {
      title: 'Bookings and Payments',
      content: 'All bookings are subject to availability and confirmation. Prices are quoted in USD unless otherwise stated. Payment must be made in full at the time of booking unless alternative arrangements have been made.'
    },
    {
      title: 'Cancellation Policy',
      content: 'Cancellations made 7 or more days before the scheduled service will receive a full refund. Cancellations within 7 days may be subject to a cancellation fee. Specific cancellation terms may vary by service.'
    },
    {
      title: 'Intellectual Property',
      content: 'All content on this website, including text, images, logos, and trademarks, is the property of Alveovita and is protected by copyright and intellectual property laws.'
    },
    {
      title: 'User Conduct',
      content: 'You agree to use our services in a responsible manner. You may not use our services for any unlawful purpose or in any way that could damage our reputation or services.'
    },
    {
      title: 'Disclaimer of Warranties',
      content: 'Our services are provided "as is" without any warranties, express or implied. We do not guarantee that our services will be uninterrupted or error-free.'
    },
    {
      title: 'Limitation of Liability',
      content: 'Alveovita shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of our services.'
    },
    {
      title: 'Governing Law',
      content: 'These Terms of Service shall be governed by and construed in accordance with the laws of Ghana. Any disputes shall be resolved in the courts of Ghana.'
    }
  ]

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-gray-950' : 'bg-white'}`}>
      <Navbar />

      {/* Hero Section */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1920&q=80)'
        }}>
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-transparent" />
        </div>
        <div className="container-custom relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl"
          >
            <span className="text-amber-400 font-semibold text-sm uppercase tracking-wider flex items-center gap-2">
              <Scale className="w-4 h-4" />
              Terms of Service
            </span>
            <h1 className="text-5xl md:text-6xl font-display font-bold text-white mt-4 leading-tight">
              Our <span className="text-amber-400">Terms</span> of Service
            </h1>
            <p className="text-xl text-gray-300 mt-4 leading-relaxed">
              Please read these terms carefully before using our services. By using our services, you agree to these terms.
            </p>
            <div className="flex flex-wrap gap-4 mt-6 text-gray-300 text-sm">
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-400" />
                Last Updated: {lastUpdated}
              </span>
              <span className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-400" />
                Version 2.0
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Terms Sections */}
      <section className={`py-24 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="container-custom">
          <div className="max-w-4xl mx-auto space-y-6">
            {sections.map((section, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`p-6 rounded-2xl transition-all duration-300 hover:scale-[1.01] ${
                  isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:shadow-xl'
                } border ${isDark ? 'border-gray-700' : 'border-gray-100'}`}
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-5 h-5 text-amber-500" />
                  </div>
                  <div>
                    <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                      {section.title}
                    </h3>
                    <p className={`mt-2 leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      {section.content}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className={`py-16 ${isDark ? 'bg-gray-950' : 'bg-white'}`}>
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className={`text-2xl font-display font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
              Questions About Our Terms?
            </h2>
            <p className={`mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              If you have any questions about our Terms of Service, please contact us.
            </p>
            <div className="flex flex-wrap justify-center gap-4 mt-6">
              <Link to="/contact">
                <button className="px-6 py-3 bg-amber-500 text-white rounded-xl font-medium hover:bg-amber-600 transition-all hover:scale-105 shadow-lg shadow-amber-500/30">
                  Contact Us
                </button>
              </Link>
              <Link to="/privacy">
                <button className={`px-6 py-3 rounded-xl font-medium transition-all hover:scale-105 ${
                  isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}>
                  Privacy Policy
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default TermsOfService