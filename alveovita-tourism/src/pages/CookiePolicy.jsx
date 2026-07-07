// src/pages/CookiePolicy.jsx
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import Navbar from '../components/common/Navbar'
import Footer from '../components/common/Footer'
import { 
  Cookie, Settings, Shield, Users, Database,
  CheckCircle, ArrowRight, Calendar,
  Lock, Eye, Smartphone, Laptop,
  FileText, Server, Cloud, Key,
  Mail // <-- Add Mail here
} from 'lucide-react'

const CookiePolicy = () => {
  const { isDark } = useTheme()
  const lastUpdated = 'January 15, 2025'

  const cookieTypes = [
    {
      id: 'necessary',
      name: 'Necessary Cookies',
      icon: Shield,
      description: 'Essential for the website to function properly. These cannot be disabled.',
      examples: ['Session management', 'Authentication', 'Security', 'Load balancing'],
      duration: 'Session'
    },
    {
      id: 'functional',
      name: 'Functional Cookies',
      icon: Settings,
      description: 'Enable enhanced functionality and personalization.',
      examples: ['Language preferences', 'Region selection', 'User preferences', 'Customized content'],
      duration: '1 year'
    },
    {
      id: 'analytics',
      name: 'Analytics Cookies',
      icon: Database,
      description: 'Help us understand how you interact with our website.',
      examples: ['Page visits', 'Click tracking', 'User behavior', 'Performance metrics'],
      duration: '2 years'
    },
    {
      id: 'marketing',
      name: 'Marketing Cookies',
      icon: Users,
      description: 'Used to deliver personalized advertisements and content.',
      examples: ['Ad targeting', 'Campaign tracking', 'Social media integration', 'Retargeting'],
      duration: '2 years'
    }
  ]

  const thirdPartyCookies = [
    {
      name: 'Google Analytics',
      purpose: 'Website analytics and user behavior tracking',
      provider: 'Google LLC',
      privacyPolicy: 'https://policies.google.com/privacy'
    },
    {
      name: 'Paystack',
      purpose: 'Secure payment processing',
      provider: 'Paystack Limited',
      privacyPolicy: 'https://paystack.com/terms'
    },
    {
      name: 'Cloudflare',
      purpose: 'Content delivery and security',
      provider: 'Cloudflare Inc.',
      privacyPolicy: 'https://www.cloudflare.com/privacypolicy/'
    },
    {
      name: 'Google Fonts',
      purpose: 'Website typography and design',
      provider: 'Google LLC',
      privacyPolicy: 'https://policies.google.com/privacy'
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
              <Cookie className="w-4 h-4" />
              Cookie Policy
            </span>
            <h1 className="text-5xl md:text-6xl font-display font-bold text-white mt-4 leading-tight">
              Understanding Our <span className="text-amber-400">Cookie</span> Use
            </h1>
            <p className="text-xl text-gray-300 mt-4 leading-relaxed">
              We use cookies to enhance your browsing experience, analyze site traffic, and serve personalized content.
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
              This Cookie Policy explains how Alveovita Health & Wellness Tourism uses cookies and similar 
              technologies to recognize you when you visit our website. It explains what these technologies 
              are and why we use them, as well as your rights to control our use of them.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-green-400">
              <CheckCircle className="w-5 h-5" />
              <span>GDPR Compliant</span>
              <span className="text-gray-600">•</span>
              <CheckCircle className="w-5 h-5" />
              <span>ePrivacy Directive</span>
              <span className="text-gray-600">•</span>
              <CheckCircle className="w-5 h-5" />
              <span>CCPA Ready</span>
            </div>
          </div>
        </div>
      </section>

      {/* Cookie Types */}
      <section className={`py-24 ${isDark ? 'bg-gray-950' : 'bg-white'}`}>
        <div className="container-custom">
          <h2 className={`text-3xl font-display font-bold text-center mb-12 ${isDark ? 'text-white' : 'text-gray-800'}`}>
            Types of Cookies We Use
          </h2>

          <div className="max-w-4xl mx-auto space-y-6">
            {cookieTypes.map((type, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-6 rounded-2xl transition-all duration-300 hover:scale-[1.01] ${
                  isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:shadow-xl'
                } border ${isDark ? 'border-gray-700' : 'border-gray-100'}`}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                    <type.icon className="w-6 h-6 text-amber-500" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center flex-wrap gap-3">
                      <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                        {type.name}
                      </h3>
                      {type.id === 'necessary' && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-semibold">
                          Required
                        </span>
                      )}
                      <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        Duration: {type.duration}
                      </span>
                    </div>
                    <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {type.description}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {type.examples.map((example, i) => (
                        <span key={i} className={`text-xs px-2 py-0.5 rounded-full ${
                          isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {example}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Third Party Cookies */}
      <section className={`py-24 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="container-custom">
          <h2 className={`text-3xl font-display font-bold text-center mb-12 ${isDark ? 'text-white' : 'text-gray-800'}`}>
            Third-Party Cookies
          </h2>

          <div className="max-w-4xl mx-auto">
            <div className="overflow-x-auto">
              <table className={`w-full rounded-2xl overflow-hidden ${
                isDark ? 'bg-gray-800' : 'bg-white'
              } shadow-lg`}>
                <thead className={isDark ? 'bg-gray-700' : 'bg-gray-50'}>
                  <tr>
                    <th className={`px-6 py-4 text-left text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                      Provider
                    </th>
                    <th className={`px-6 py-4 text-left text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                      Purpose
                    </th>
                    <th className={`px-6 py-4 text-left text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                      Privacy Policy
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200/20">
                  {thirdPartyCookies.map((cookie, index) => (
                    <tr key={index} className={isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                      <td className={`px-6 py-4 text-sm ${isDark ? 'text-white' : 'text-gray-800'}`}>
                        <div className="flex items-center gap-2">
                          <Database className="w-4 h-4 text-amber-400" />
                          {cookie.name}
                        </div>
                      </td>
                      <td className={`px-6 py-4 text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        {cookie.purpose}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <a 
                          href={cookie.privacyPolicy}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-amber-400 hover:text-amber-300 transition-colors hover:underline"
                        >
                          View Policy
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* How to Control Cookies */}
      <section className={`py-24 ${isDark ? 'bg-gray-950' : 'bg-white'}`}>
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <h2 className={`text-3xl font-display font-bold text-center mb-8 ${isDark ? 'text-white' : 'text-gray-800'}`}>
              How to Control Cookies
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className={`p-6 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg hover:scale-105 transition-all`}>
                <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-4">
                  <Settings className="w-6 h-6 text-blue-500" />
                </div>
                <h4 className={`font-bold text-center ${isDark ? 'text-white' : 'text-gray-800'}`}>
                  Cookie Banner
                </h4>
                <p className={`text-sm text-center mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Use our cookie consent banner to accept or reject cookies when you first visit our site.
                </p>
              </div>

              <div className={`p-6 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg hover:scale-105 transition-all`}>
                <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                  <Smartphone className="w-6 h-6 text-green-500" />
                </div>
                <h4 className={`font-bold text-center ${isDark ? 'text-white' : 'text-gray-800'}`}>
                  Browser Settings
                </h4>
                <p className={`text-sm text-center mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Most browsers allow you to manage cookie preferences through their settings.
                </p>
              </div>

              <div className={`p-6 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg hover:scale-105 transition-all`}>
                <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-6 h-6 text-amber-500" />
                </div>
                <h4 className={`font-bold text-center ${isDark ? 'text-white' : 'text-gray-800'}`}>
                  Privacy Settings
                </h4>
                <p className={`text-sm text-center mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Adjust your privacy preferences in your account settings at any time.
                </p>
              </div>
            </div>

            <div className={`mt-8 p-6 rounded-2xl ${isDark ? 'bg-amber-500/10' : 'bg-amber-50'} border border-amber-500/20`}>
              <p className={`text-sm ${isDark ? 'text-amber-300' : 'text-amber-700'}`}>
                <strong>Note:</strong> Disabling certain cookies may affect the functionality of our website 
                and your user experience. Essential cookies cannot be disabled as they are necessary for 
                the website to function properly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className={`py-24 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <h2 className={`text-3xl font-display font-bold text-center mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>
              Cookie Questions?
            </h2>
            <p className={`text-center mb-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              If you have questions about our cookie policy, please contact us.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/contact">
                <button className="px-6 py-3 bg-amber-500 text-white rounded-xl font-medium hover:bg-amber-600 transition-all hover:scale-105 shadow-lg shadow-amber-500/30 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Contact Us
                </button>
              </Link>
              <Link to="/privacy">
                <button className={`px-6 py-3 rounded-xl font-medium transition-all hover:scale-105 ${
                  isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                } flex items-center gap-2`}>
                  <Shield className="w-4 h-4" />
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

export default CookiePolicy