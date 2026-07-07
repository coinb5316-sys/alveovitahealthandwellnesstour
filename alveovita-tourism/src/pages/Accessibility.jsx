// src/pages/Accessibility.jsx
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import Navbar from '../components/common/Navbar'
import Footer from '../components/common/Footer'
import { 
  Accessibility as AccessibilityIcon, // Rename the import to avoid conflict
  Eye, Type, Keyboard,
  CheckCircle, ArrowRight, Calendar,
  Users, Heart, Hand, Globe,
  Mail, Phone, MapPin, Clock,
  Speaker, ZoomIn, ZoomOut, Contrast
} from 'lucide-react'

const AccessibilityPage = () => { // Rename the component
  const { isDark } = useTheme()
  const lastUpdated = 'January 15, 2025'

  const accessibilityFeatures = [
    {
      icon: Eye,
      title: 'Visual Accessibility',
      description: 'We support screen readers, high contrast modes, and adjustable text sizes for visually impaired users.'
    },
    {
      icon: Keyboard,
      title: 'Keyboard Navigation',
      description: 'Our website is fully navigable using keyboard shortcuts for users with motor impairments.'
    },
    {
      icon: Type,
      title: 'Readable Content',
      description: 'We use clear, simple language and provide alternative text for images and media.'
    },
    {
      icon: Speaker,
      title: 'Audio Support',
      description: 'We provide audio descriptions and captions for multimedia content.'
    },
    {
      icon: ZoomIn,
      title: 'Text Scaling',
      description: 'Our responsive design allows text to scale up to 200% without breaking the layout.'
    },
    {
      icon: Contrast,
      title: 'Color Contrast',
      description: 'We maintain WCAG 2.1 AA compliance for color contrast ratios.'
    }
  ]

  const commitments = [
    'WCAG 2.1 AA Compliance',
    'Screen Reader Compatible',
    'Keyboard Navigable',
    'Responsive Design',
    'Clear Visual Hierarchy',
    'Descriptive Link Text'
  ]

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-gray-950' : 'bg-white'}`}>
      <Navbar />

      {/* Hero Section */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1571260899304-425eee4c7efc?w=1920&q=80)'
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
              <AccessibilityIcon className="w-4 h-4" />
              Accessibility
            </span>
            <h1 className="text-5xl md:text-6xl font-display font-bold text-white mt-4 leading-tight">
              Everyone is <span className="text-amber-400">Welcome</span>
            </h1>
            <p className="text-xl text-gray-300 mt-4 leading-relaxed">
              We are committed to making our website accessible to everyone, regardless of ability or technology.
            </p>
            <div className="flex flex-wrap gap-4 mt-6 text-gray-300 text-sm">
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-400" />
                Last Updated: {lastUpdated}
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-amber-400" />
                WCAG 2.1 AA Compliant
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Accessibility Features */}
      <section className={`py-24 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="container-custom">
          <h2 className={`text-3xl font-display font-bold text-center mb-12 ${isDark ? 'text-white' : 'text-gray-800'}`}>
            Accessibility Features
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {accessibilityFeatures.map((feature, index) => (
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

      {/* Commitments */}
      <section className={`py-24 ${isDark ? 'bg-gray-950' : 'bg-white'}`}>
        <div className="container-custom">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className={`text-3xl font-display font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                Our <span className="text-amber-400">Commitment</span>
              </h2>
              <p className={`mt-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                We are dedicated to ensuring that our website is accessible to all users. We actively work to identify and remove barriers to accessibility.
              </p>
              <ul className="mt-6 space-y-3">
                {commitments.map((commitment, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-amber-400 flex-shrink-0" />
                    <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                      {commitment}
                    </span>
                  </li>
                ))}
              </ul>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <img 
                src="https://images.unsplash.com/photo-1571260899304-425eee4c7efc?w=800&q=80"
                alt="Accessibility"
                className="rounded-2xl shadow-2xl"
              />
              <div className="absolute -bottom-6 -right-6 p-6 bg-amber-500 rounded-2xl shadow-xl">
                <div className="text-white">
                  <div className="text-3xl font-bold">WCAG 2.1</div>
                  <div className="text-sm">AA Compliant</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Feedback Section */}
      <section className={`py-24 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center">
            <div className="w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-amber-500" />
            </div>
            <h2 className={`text-3xl font-display font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
              Help Us Improve
            </h2>
            <p className={`mt-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              We welcome feedback on accessibility. If you encounter any barriers or have suggestions for improvement, please let us know.
            </p>
            <div className="flex flex-wrap justify-center gap-4 mt-8">
              <Link to="/feedback">
                <button className="px-6 py-3 bg-amber-500 text-white rounded-xl font-medium hover:bg-amber-600 transition-all hover:scale-105 shadow-lg shadow-amber-500/30">
                  Give Feedback
                </button>
              </Link>
              <Link to="/contact">
                <button className={`px-6 py-3 rounded-xl font-medium transition-all hover:scale-105 ${
                  isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}>
                  Contact Us
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

export default AccessibilityPage