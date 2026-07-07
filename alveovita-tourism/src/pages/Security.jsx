// src/pages/Security.jsx
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import Navbar from '../components/common/Navbar'
import Footer from '../components/common/Footer'
import { 
  Shield, Lock, Eye, Key, Server,
  CheckCircle, ArrowRight, Calendar,
  Smartphone, Laptop, Database, Cloud,
  Fingerprint, ShieldCheck, AlertTriangle,
  Mail, Phone, MapPin, Clock
} from 'lucide-react'

const Security = () => {
  const { isDark } = useTheme()
  const lastUpdated = 'January 15, 2025'

  const securityFeatures = [
    {
      icon: Shield,
      title: 'Data Encryption',
      description: 'All data transmitted between your browser and our servers is encrypted using industry-standard SSL/TLS protocols.'
    },
    {
      icon: Fingerprint,
      title: 'Authentication Security',
      description: 'We implement multi-factor authentication and secure password hashing to protect your account.'
    },
    {
      icon: Lock,
      title: 'Payment Security',
      description: 'All payments are processed through PCI-compliant payment gateways with tokenization for sensitive data.'
    },
    {
      icon: Server,
      title: 'Infrastructure Security',
      description: 'Our servers are hosted in secure, ISO-certified data centers with 24/7 monitoring and protection.'
    },
    {
      icon: ShieldCheck,
      title: 'Regular Audits',
      description: 'We conduct regular security audits and penetration testing to identify and address vulnerabilities.'
    },
    {
      icon: Database,
      title: 'Data Protection',
      description: 'We implement robust access controls and data protection measures to safeguard your personal information.'
    }
  ]

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-gray-950' : 'bg-white'}`}>
      <Navbar />

      {/* Hero Section */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1920&q=80)'
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
              <Shield className="w-4 h-4" />
              Security
            </span>
            <h1 className="text-5xl md:text-6xl font-display font-bold text-white mt-4 leading-tight">
              Your <span className="text-amber-400">Security</span> is Our Priority
            </h1>
            <p className="text-xl text-gray-300 mt-4 leading-relaxed">
              Learn about the security measures we take to protect your data and ensure a safe experience.
            </p>
            <div className="flex flex-wrap gap-4 mt-6 text-gray-300 text-sm">
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-400" />
                Last Updated: {lastUpdated}
              </span>
              <span className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                ISO 27001 Compliant
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Security Features */}
      <section className={`py-24 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="container-custom">
          <h2 className={`text-3xl font-display font-bold text-center mb-12 ${isDark ? 'text-white' : 'text-gray-800'}`}>
            Our Security Measures
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {securityFeatures.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-6 rounded-2xl transition-all duration-300 hover:scale-105 ${
                  isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:shadow-2xl'
                }`}
              >
                <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-amber-500" />
                </div>
                <h3 className={`font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                  {feature.title}
                </h3>
                <p className={`text-sm mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Security Tips */}
      <section className={`py-24 ${isDark ? 'bg-gray-950' : 'bg-white'}`}>
        <div className="container-custom">
          <h2 className={`text-3xl font-display font-bold text-center mb-12 ${isDark ? 'text-white' : 'text-gray-800'}`}>
            Security Tips for Users
          </h2>

          <div className="max-w-4xl mx-auto space-y-4">
            <div className={`p-4 rounded-xl flex items-start gap-4 ${
              isDark ? 'bg-gray-800' : 'bg-gray-50'
            }`}>
              <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                <Lock className="w-4 h-4 text-blue-500" />
              </div>
              <div>
                <h4 className={`font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                  Use Strong Passwords
                </h4>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Create a strong, unique password for your account and update it regularly.
                </p>
              </div>
            </div>

            <div className={`p-4 rounded-xl flex items-start gap-4 ${
              isDark ? 'bg-gray-800' : 'bg-gray-50'
            }`}>
              <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                <Smartphone className="w-4 h-4 text-green-500" />
              </div>
              <div>
                <h4 className={`font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                  Enable Two-Factor Authentication
                </h4>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Add an extra layer of security to your account with two-factor authentication.
                </p>
              </div>
            </div>

            <div className={`p-4 rounded-xl flex items-start gap-4 ${
              isDark ? 'bg-gray-800' : 'bg-gray-50'
            }`}>
              <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
                <Eye className="w-4 h-4 text-yellow-500" />
              </div>
              <div>
                <h4 className={`font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                  Be Aware of Phishing
                </h4>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Never share your credentials via email or suspicious websites. We will never ask for your password.
                </p>
              </div>
            </div>

            <div className={`p-4 rounded-xl flex items-start gap-4 ${
              isDark ? 'bg-gray-800' : 'bg-gray-50'
            }`}>
              <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-4 h-4 text-red-500" />
              </div>
              <div>
                <h4 className={`font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                  Report Suspicious Activity
                </h4>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  If you notice any suspicious activity on your account, contact us immediately.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className={`py-16 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className={`text-2xl font-display font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
              Security Questions?
            </h2>
            <p className={`mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              If you have security concerns or need to report an issue, please contact our security team.
            </p>
            <div className="flex flex-wrap justify-center gap-4 mt-6">
              <Link to="/contact">
                <button className="px-6 py-3 bg-amber-500 text-white rounded-xl font-medium hover:bg-amber-600 transition-all hover:scale-105 shadow-lg shadow-amber-500/30">
                  Contact Security Team
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

export default Security