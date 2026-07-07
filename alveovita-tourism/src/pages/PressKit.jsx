// src/pages/PressKit.jsx
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import Navbar from '../components/common/Navbar'
import Footer from '../components/common/Footer'
import { 
  FileText, Image, Video, Download, 
  Share2, Globe, Users, Award,
  ArrowRight, CheckCircle, Calendar,
  Sparkles, Crown, Gem, Rocket,
  Mail, Phone, MapPin, Clock,
  File, FolderOpen, Newspaper, Tv,
  Radio, Mic, Camera, BookOpen
} from 'lucide-react'

const PressKit = () => {
  const { isDark } = useTheme()

  const resources = [
    {
      title: 'Company Overview',
      description: 'Comprehensive overview of Alveovita Health & Wellness Tourism',
      type: 'PDF',
      size: '2.1 MB',
      icon: FileText,
      date: 'Jan 2025'
    },
    {
      title: 'Brand Assets',
      description: 'Logos, colors, fonts, and brand guidelines',
      type: 'ZIP',
      size: '15.4 MB',
      icon: FolderOpen,
      date: 'Dec 2024'
    },
    {
      title: 'Media Kit',
      description: 'Press releases, fact sheets, and media resources',
      type: 'PDF',
      size: '3.8 MB',
      icon: Newspaper,
      date: 'Jan 2025'
    },
    {
      title: 'Photo Gallery',
      description: 'High-resolution images of our facilities and experiences',
      type: 'ZIP',
      size: '45.2 MB',
      icon: Image,
      date: 'Dec 2024'
    },
    {
      title: 'Video Library',
      description: 'Promotional videos and client testimonials',
      type: 'ZIP',
      size: '128 MB',
      icon: Video,
      date: 'Jan 2025'
    },
    {
      title: 'Executive Bios',
      description: 'Biographies and photos of our leadership team',
      type: 'PDF',
      size: '1.2 MB',
      icon: Users,
      date: 'Dec 2024'
    }
  ]

  const pressReleases = [
    {
      title: 'Alveovita Announces Expansion into West African Markets',
      date: 'January 15, 2025',
      category: 'Expansion',
      excerpt: 'Leading wellness tourism company announces strategic expansion across West Africa.'
    },
    {
      title: 'Partnership with International Healthcare Providers',
      date: 'December 10, 2024',
      category: 'Partnership',
      excerpt: 'Alveovita partners with world-class healthcare providers to enhance medical tourism services.'
    },
    {
      title: 'Alveovita Wins Best Wellness Tourism Award 2024',
      date: 'November 20, 2024',
      category: 'Award',
      excerpt: 'Recognized as the leading wellness tourism provider in West Africa.'
    }
  ]

  const mediaContacts = [
    {
      name: 'David Appiah',
      role: 'Head of Communications',
      email: 'david.appiah@alveovita.com',
      phone: '+233 55 123 4567'
    },
    {
      name: 'Grace Asante',
      role: 'Public Relations Manager',
      email: 'grace.asante@alveovita.com',
      phone: '+233 55 123 4568'
    }
  ]

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-gray-950' : 'bg-white'}`}>
      <Navbar />

      {/* Hero Section */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920&q=80)'
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
              <Newspaper className="w-4 h-4" />
              Press Kit
            </span>
            <h1 className="text-5xl md:text-6xl font-display font-bold text-white mt-4 leading-tight">
              Media & <span className="text-amber-400">Press</span> Resources
            </h1>
            <p className="text-xl text-gray-300 mt-4 leading-relaxed">
              Access our comprehensive press kit, media resources, and brand assets. Everything you need to cover Alveovita.
            </p>
            <div className="flex flex-wrap gap-4 mt-8">
              <button className="px-8 py-3 bg-amber-500 text-white rounded-full font-medium hover:bg-amber-600 transition-all shadow-lg shadow-amber-500/30 hover:scale-105">
                Download Full Kit
              </button>
              <Link to="/contact">
                <button className="px-8 py-3 border-2 border-white/30 text-white rounded-full font-medium hover:bg-white/10 transition-all backdrop-blur-sm hover:scale-105">
                  Media Contact
                </button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Resources */}
      <section className={`py-24 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="container-custom">
          <h2 className={`text-3xl font-display font-bold text-center mb-12 ${isDark ? 'text-white' : 'text-gray-800'}`}>
            Resources
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resources.map((resource, index) => (
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
                  <resource.icon className="w-6 h-6 text-amber-500" />
                </div>
                <h3 className={`font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                  {resource.title}
                </h3>
                <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {resource.description}
                </p>
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200/20">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span className={`px-2 py-0.5 rounded-full ${
                      isDark ? 'bg-gray-700' : 'bg-gray-100'
                    }`}>
                      {resource.type}
                    </span>
                    <span>{resource.size}</span>
                  </div>
                  <button className={`px-3 py-1 rounded-lg text-xs font-medium transition-all hover:scale-105 ${
                    isDark ? 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30' : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                  }`}>
                    Download
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Press Releases */}
      <section className={`py-24 ${isDark ? 'bg-gray-950' : 'bg-white'}`}>
        <div className="container-custom">
          <h2 className={`text-3xl font-display font-bold text-center mb-12 ${isDark ? 'text-white' : 'text-gray-800'}`}>
            Press Releases
          </h2>

          <div className="max-w-4xl mx-auto space-y-6">
            {pressReleases.map((release, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-6 rounded-2xl transition-all duration-300 hover:scale-[1.02] ${
                  isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:shadow-xl'
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        release.category === 'Expansion' 
                          ? 'bg-blue-500/20 text-blue-400'
                          : release.category === 'Partnership'
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-amber-500/20 text-amber-400'
                      }`}>
                        {release.category}
                      </span>
                      <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {release.date}
                      </span>
                    </div>
                    <h3 className={`text-xl font-bold mt-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                      {release.title}
                    </h3>
                    <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {release.excerpt}
                    </p>
                  </div>
                  <button className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all hover:scale-105 flex-shrink-0 ${
                    isDark ? 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30' : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                  }`}>
                    Read More
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Media Contacts */}
      <section className={`py-24 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="container-custom">
          <h2 className={`text-3xl font-display font-bold text-center mb-12 ${isDark ? 'text-white' : 'text-gray-800'}`}>
            Media Contacts
          </h2>

          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {mediaContacts.map((contact, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-6 rounded-2xl text-center transition-all duration-300 hover:scale-105 ${
                  isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:shadow-2xl'
                }`}
              >
                <div className="w-14 h-14 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto mb-3">
                  <Users className="w-7 h-7 text-amber-500" />
                </div>
                <h4 className={`font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                  {contact.name}
                </h4>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {contact.role}
                </p>
                <div className="mt-3 space-y-2 text-sm">
                  <a href={`mailto:${contact.email}`} className="block text-amber-400 hover:text-amber-300 transition-colors">
                    {contact.email}
                  </a>
                  <a href={`tel:${contact.phone}`} className="block text-gray-400 hover:text-white transition-colors">
                    {contact.phone}
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default PressKit