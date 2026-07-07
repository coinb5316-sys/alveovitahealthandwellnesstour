// src/pages/PrivacyPolicy.jsx
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import Navbar from '../components/common/Navbar'
import Footer from '../components/common/Footer'
import { 
  Shield, Lock, Eye, Users, Database, 
  CheckCircle, ArrowRight, Calendar, 
  Mail, Phone, MapPin, Globe,
  FileText, Server, Cloud, Key,
  Smartphone, Laptop, Tablet
} from 'lucide-react'

const PrivacyPolicy = () => {
  const { isDark } = useTheme()
  const lastUpdated = 'January 15, 2025'

  const sections = [
    {
      icon: Shield,
      title: 'Information We Collect',
      content: `
        We collect information you provide directly to us, such as when you create an account, book a tour, or contact us. 
        This may include:
        • Name and contact information (email, phone, address)
        • Payment information (processed securely through Paystack)
        • Travel preferences and requirements
        • Health information relevant to wellness programs
        • Communications with our team
      `
    },
    {
      icon: Database,
      title: 'How We Use Your Information',
      content: `
        We use your information to:
        • Process bookings and payments
        • Provide personalized wellness recommendations
        • Communicate about your bookings and updates
        • Improve our services and user experience
        • Send promotional materials (with your consent)
        • Comply with legal obligations
      `
    },
    {
      icon: Lock,
      title: 'Data Security',
      content: `
        We implement appropriate technical and organizational measures to protect your personal data:
        • SSL encryption for all data transmission
        • Secure payment processing through Paystack
        • Regular security audits and updates
        • Limited access to personal data
        • Data anonymization where possible
        • Staff training on data protection
      `
    },
    {
      icon: Eye,
      title: 'Data Sharing & Disclosure',
      content: `
        We may share your information with:
        • Service providers (payment processors, travel partners)
        • Healthcare providers (with your explicit consent)
        • Legal authorities (when required by law)
        • Business partners (for service delivery)
        
        We never sell your personal data to third parties.
      `
    },
    {
      icon: Users,
      title: 'Your Rights',
      content: `
        You have the right to:
        • Access your personal data
        • Correct inaccurate data
        • Request data deletion
        • Withdraw consent at any time
        • Object to data processing
        • Data portability
        • Lodge a complaint with data protection authorities
      `
    },
    {
      icon: Server,
      title: 'Data Retention',
      content: `
        We retain your personal data for as long as necessary to:
        • Provide our services
        • Comply with legal obligations
        • Resolve disputes
        • Enforce our agreements
        
        You may request deletion of your data at any time.
      `
    },
    {
      icon: Smartphone,
      title: 'Cookies & Tracking',
      content: `
        We use cookies and similar technologies to:
        • Improve website functionality
        • Analyze site usage
        • Personalize content
        • Remember preferences
        
        You can manage cookie preferences through our cookie consent banner.
      `
    },
    {
      icon: Globe,
      title: 'International Data Transfers',
      content: `
        As a global wellness tourism company, we may transfer your data to:
        • Partner facilities in Ghana and other countries
        • International payment processors
        • Cloud service providers
        
        We ensure appropriate safeguards for international data transfers.
      `
    }
  ]

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-gray-950' : 'bg-white'}`}>
      <Navbar />

      {/* Hero Section */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1920&q=80)'
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
              Privacy Policy
            </span>
            <h1 className="text-5xl md:text-6xl font-display font-bold text-white mt-4 leading-tight">
              Your <span className="text-amber-400">Privacy</span> Matters
            </h1>
            <p className="text-xl text-gray-300 mt-4 leading-relaxed">
              We are committed to protecting your personal data and being transparent about how we use it.
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

      {/* Introduction */}
      <section className={`py-12 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="container-custom">
          <div className={`p-8 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg max-w-4xl mx-auto`}>
            <p className={`text-lg leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              At Alveovita Health & Wellness Tourism, we take your privacy seriously. This Privacy Policy explains 
              how we collect, use, disclose, and safeguard your information when you visit our website or use our services.
            </p>
            <div className="mt-4 flex items-center gap-3 text-sm text-green-400">
              <CheckCircle className="w-5 h-5" />
              <span>GDPR Compliant</span>
              <span className="text-gray-600">•</span>
              <CheckCircle className="w-5 h-5" />
              <span>CCPA Ready</span>
            </div>
          </div>
        </div>
      </section>

      {/* Policy Sections */}
      <section className={`py-24 ${isDark ? 'bg-gray-950' : 'bg-white'}`}>
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
                  <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                    <section.icon className="w-6 h-6 text-amber-500" />
                  </div>
                  <div>
                    <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                      {section.title}
                    </h3>
                    <div className={`mt-2 whitespace-pre-line ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      {section.content}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className={`py-24 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <h2 className={`text-3xl font-display font-bold text-center mb-8 ${isDark ? 'text-white' : 'text-gray-800'}`}>
              Privacy Questions?
            </h2>
            <p className={`text-center mb-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              If you have questions about our privacy practices or would like to exercise your data rights,
              please contact our Data Protection Officer.
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              <div className={`p-6 rounded-2xl text-center ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-6 h-6 text-blue-500" />
                </div>
                <h4 className={`font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>Email</h4>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>privacy@alveovita.com</p>
              </div>

              <div className={`p-6 rounded-2xl text-center ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                  <Phone className="w-6 h-6 text-green-500" />
                </div>
                <h4 className={`font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>Phone</h4>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>+233 55 123 4567</p>
              </div>

              <div className={`p-6 rounded-2xl text-center ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-6 h-6 text-amber-500" />
                </div>
                <h4 className={`font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>Address</h4>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>123 Independence Avenue, Accra, Ghana</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default PrivacyPolicy