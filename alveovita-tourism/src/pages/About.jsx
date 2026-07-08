// src/pages/About.jsx
import { motion } from 'framer-motion'
import { useNavigate, Link } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../hooks/useToast'
import Navbar from '../components/common/Navbar'
import Footer from '../components/common/Footer'
import { 
  Heart, Users, Award, Globe, Shield, Target, 
  Lightbulb, Star, CheckCircle, ArrowRight,
  Building2, Stethoscope, Flower2, Briefcase,
  MapPin, Phone, Mail, Clock, Quote,
  Calendar, MessageCircle, Sparkles, Compass,
  Leaf, Sun, Moon, Cloud, Wind, Droplets,
  TreePine, Mountain, Coffee, Utensils,
  Gift, Crown, Gem, Zap, TrendingUp,
  BadgeCheck, Clock as ClockIcon, UserPlus,
  LogIn, ChevronRight, Play, Video,
  Camera, Music, Palette, Wand2
} from 'lucide-react'

// Custom social media icons
const LinkedInIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
)

const TwitterIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
)

const InstagramIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
  </svg>
)

const About = () => {
  const navigate = useNavigate()
  const { isDark } = useTheme()
  const { user } = useAuth()
  const { showToast } = useToast()

  const team = [
    {
      name: 'Dr. Kwame Nkrumah',
      role: 'Founder & CEO',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
      bio: 'Passionate about transforming healthcare through wellness tourism.',
      social: { linkedin: '#', twitter: '#' }
    },
    {
      name: 'Maya Williams',
      role: 'Head of Wellness Programs',
      image: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&q=80',
      bio: 'Expert in holistic wellness and therapeutic program design.',
      social: { linkedin: '#', twitter: '#' }
    },
    {
      name: 'James Osei',
      role: 'Operations Director',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
      bio: 'Ensuring seamless travel and healthcare coordination.',
      social: { linkedin: '#', twitter: '#' }
    },
    {
      name: 'Dr. Sarah Mensah',
      role: 'Medical Director',
      image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&q=80',
      bio: 'Leading medical excellence and quality care standards.',
      social: { linkedin: '#', twitter: '#' }
    }
  ]

  const values = [
    {
      icon: Heart,
      title: 'Compassionate Care',
      description: 'We treat every client with genuine care and empathy.'
    },
    {
      icon: Award,
      title: 'Excellence',
      description: 'We strive for the highest standards in everything we do.'
    },
    {
      icon: Shield,
      title: 'Trust & Integrity',
      description: 'We build lasting relationships through honesty and transparency.'
    },
    {
      icon: Target,
      title: 'Innovation',
      description: 'We continuously evolve to provide cutting-edge wellness solutions.'
    }
  ]

  const milestones = [
    { year: '2020', title: 'Founded', description: 'Alveovita was established with a vision to transform wellness tourism.' },
    { year: '2021', title: 'First Partnership', description: 'Partnered with 10 leading healthcare facilities in Ghana.' },
    { year: '2022', title: 'Expansion', description: 'Expanded services to include corporate wellness programs.' },
    { year: '2023', title: 'Award Winning', description: 'Recognized as the leading wellness tourism provider in West Africa.' },
    { year: '2024', title: 'Global Reach', description: 'Serving clients from over 50 countries worldwide.' }
  ]

  const services = [
    { icon: Stethoscope, title: 'Medical Tourism', description: 'World-class healthcare services' },
    { icon: Flower2, title: 'Wellness Retreats', description: 'Rejuvenate your mind and body' },
    { icon: Briefcase, title: 'Corporate Wellness', description: 'Employee well-being programs' },
    { icon: Globe, title: 'Cultural Immersion', description: 'Experience local traditions' },
    { icon: Users, title: 'Group Wellness', description: 'Wellness for families & groups' },
    { icon: Award, title: 'Special Programs', description: 'Customized wellness journeys' }
  ]

  const handleBookConsultation = () => {
    if (user) {
      navigate('/dashboard/bookings')
    } else {
      showToast('Please login to book a consultation', 'info')
      navigate('/login', { state: { from: '/about' } })
    }
  }

  const handleServices = () => {
    navigate('/services')
  }

  const handleContact = () => {
    navigate('/contact')
  }

  const handleLearnMore = () => {
    navigate('/services')
  }

  const handleSocialClick = (url, platform) => {
    window.open(url, '_blank')
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-gray-950' : 'bg-white'}`}>
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-[60vh] md:min-h-[70vh] flex items-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1920&q=80)',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black/40" />
        </div>
        <div className="container-custom relative z-10 px-4 sm:px-6 py-16 sm:py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl mx-auto text-center"
          >
            <span className="inline-flex items-center gap-2 text-amber-400 font-semibold text-xs sm:text-sm uppercase tracking-wider bg-amber-500/10 px-4 py-2 rounded-full border border-amber-500/20">
              <Sparkles className="w-4 h-4" />
              About Us
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-bold text-white mt-4 leading-tight">
              Transforming Lives Through <br className="hidden sm:inline" />
              <span className="text-amber-400">Wellness</span> Tourism
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-300 mt-4 md:mt-6 leading-relaxed max-w-2xl mx-auto">
              Alveovita Health & Wellness Tourism is a premier health tourism company dedicated to connecting 
              individuals, families, and organizations with world-class healthcare, wellness, rehabilitation, 
              and tourism experiences.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 mt-6 md:mt-8">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleServices}
                className="px-6 sm:px-8 py-2.5 sm:py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full font-medium hover:shadow-lg hover:shadow-amber-500/30 transition-all text-sm sm:text-base"
              >
                Our Services
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleContact}
                className="px-6 sm:px-8 py-2.5 sm:py-3 border-2 border-white/30 text-white rounded-full font-medium hover:bg-white/10 transition-all backdrop-blur-sm text-sm sm:text-base"
              >
                Contact Us
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Our Story */}
      <section className={`py-12 sm:py-16 md:py-24 transition-colors duration-300 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="container-custom px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="text-amber-500 font-semibold text-xs sm:text-sm uppercase tracking-wider">Our Story</span>
              <h2 className={`text-2xl sm:text-3xl md:text-4xl font-display font-bold mt-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                A Journey of <span className="text-amber-400">Healing</span> and Discovery
              </h2>
              <div className={`mt-4 md:mt-6 space-y-3 md:space-y-4 text-sm sm:text-base ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                <p>
                  Alveovita Health & Wellness Tourism was born from a simple yet profound belief: 
                  that sometimes the best medicine is a change of environment. A peaceful beach, 
                  a quiet mountain, a walk through nature, meaningful conversations, laughter, 
                  and moments of reflection can significantly improve health and well-being.
                </p>
                <p>
                  In today's fast-paced world, many individuals experience stress, burnout, anxiety, 
                  depression, fatigue, and emotional exhaustion due to demanding careers, academic pressures, 
                  business responsibilities, and personal challenges. Alveovita provides carefully curated 
                  wellness journeys that allow individuals to disconnect from stress and reconnect with 
                  themselves through nature, relaxation, recreation, culture, and healthy living.
                </p>
                <p className="hidden md:block">
                  We specialize in coordinating seamless healthcare journeys for local and international 
                  clients seeking preventive, diagnostic, therapeutic, wellness, and recovery services 
                  while experiencing the rich culture, hospitality, and attractions of Ghana and other 
                  global destinations.
                </p>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <img 
                src="https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800&q=80"
                alt="Our Story"
                className="rounded-2xl shadow-2xl w-full h-auto"
              />
              <div className="absolute -bottom-3 -right-3 sm:-bottom-6 sm:-right-6 p-4 sm:p-6 bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl shadow-xl">
                <div className="text-white">
                  <div className="text-xl sm:text-3xl font-bold">5+</div>
                  <div className="text-xs sm:text-sm">Years of Excellence</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className={`py-12 sm:py-16 md:py-24 transition-colors duration-300 ${isDark ? 'bg-gray-950' : 'bg-white'}`}>
        <div className="container-custom px-4 sm:px-6">
          <div className="grid sm:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className={`p-6 sm:p-8 rounded-3xl ${isDark ? 'bg-gray-800' : 'bg-amber-50'} border ${isDark ? 'border-gray-700' : 'border-amber-200'}`}
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center mb-3 sm:mb-4">
                <Target className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
              <h3 className={`text-xl sm:text-2xl font-bold mb-2 sm:mb-3 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                Our Mission
              </h3>
              <p className={`text-sm sm:text-base ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                To provide exceptional health and wellness tourism services by connecting clients to 
                quality healthcare, wellness programs, rehabilitation services, and unique travel 
                experiences through professionalism, innovation, and compassionate care.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className={`p-6 sm:p-8 rounded-3xl ${isDark ? 'bg-gray-800' : 'bg-blue-50'} border ${isDark ? 'border-gray-700' : 'border-blue-200'}`}
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center mb-3 sm:mb-4">
                <Lightbulb className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
              <h3 className={`text-xl sm:text-2xl font-bold mb-2 sm:mb-3 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                Our Vision
              </h3>
              <p className={`text-sm sm:text-base ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                To improve quality of life by providing wellness-centered tourism experiences that 
                promote relaxation, mental rejuvenation, stress reduction, physical wellness, and 
                personal growth.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className={`py-12 sm:py-16 md:py-24 transition-colors duration-300 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="container-custom px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8 md:mb-12"
          >
            <span className="text-amber-500 font-semibold text-xs sm:text-sm uppercase tracking-wider">Core Values</span>
            <h2 className={`text-2xl sm:text-3xl md:text-4xl font-display font-bold mt-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>
              What Drives Us
            </h2>
            <p className={`max-w-2xl mx-auto mt-3 md:mt-4 text-sm sm:text-base ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Our values guide every decision we make and every experience we create.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-6 sm:p-8 rounded-2xl text-center transition-all duration-300 hover:scale-105 ${
                  isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:shadow-2xl'
                }`}
              >
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <value.icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                </div>
                <h3 className={`text-lg sm:text-xl font-bold mb-1 sm:mb-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                  {value.title}
                </h3>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Services Preview */}
      <section className={`py-12 sm:py-16 md:py-24 transition-colors duration-300 ${isDark ? 'bg-gray-950' : 'bg-white'}`}>
        <div className="container-custom px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8 md:mb-12"
          >
            <span className="text-amber-500 font-semibold text-xs sm:text-sm uppercase tracking-wider">What We Offer</span>
            <h2 className={`text-2xl sm:text-3xl md:text-4xl font-display font-bold mt-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>
              Our <span className="text-amber-400">Services</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {services.map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-6 sm:p-8 rounded-2xl transition-all duration-300 hover:scale-105 ${
                  isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-50 hover:shadow-xl'
                }`}
              >
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 flex items-center justify-center mb-3 sm:mb-4">
                  <service.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <h3 className={`text-lg sm:text-xl font-bold mb-1 sm:mb-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                  {service.title}
                </h3>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {service.description}
                </p>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-8 md:mt-12">
            <button
              onClick={handleServices}
              className="inline-flex items-center gap-2 px-6 sm:px-8 py-2.5 sm:py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full font-medium hover:shadow-lg hover:shadow-amber-500/30 transition-all hover:scale-105 text-sm sm:text-base"
            >
              View All Services
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className={`py-12 sm:py-16 md:py-24 transition-colors duration-300 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="container-custom px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8 md:mb-12"
          >
            <span className="text-amber-500 font-semibold text-xs sm:text-sm uppercase tracking-wider">Our Journey</span>
            <h2 className={`text-2xl sm:text-3xl md:text-4xl font-display font-bold mt-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>
              Milestones
            </h2>
          </motion.div>

          <div className="relative max-w-3xl mx-auto">
            <div className={`hidden sm:block absolute left-1/2 transform -translate-x-1/2 w-0.5 h-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`} />
            
            {milestones.map((milestone, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`flex flex-col sm:flex-row items-start sm:items-center mb-6 sm:mb-8 ${index % 2 === 0 ? 'sm:flex-row' : 'sm:flex-row-reverse'}`}
              >
                <div className={`sm:w-5/12 w-full ${index % 2 === 0 ? 'sm:text-right sm:pr-8' : 'sm:text-left sm:pl-8'}`}>
                  <div className={`p-4 sm:p-5 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                    <div className="text-xl sm:text-2xl font-bold text-amber-500">{milestone.year}</div>
                    <h4 className={`font-bold text-base sm:text-lg ${isDark ? 'text-white' : 'text-gray-800'}`}>
                      {milestone.title}
                    </h4>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {milestone.description}
                    </p>
                  </div>
                </div>
                <div className="hidden sm:flex relative z-10">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 border-4 border-white dark:border-gray-900 flex-shrink-0" />
                </div>
                <div className="sm:w-5/12 hidden sm:block" />
                {/* Mobile timeline dot */}
                <div className="sm:hidden flex items-center gap-3 mt-2">
                  <div className="w-4 h-4 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 border-2 border-white dark:border-gray-900 flex-shrink-0" />
                  <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Step {index + 1}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className={`py-12 sm:py-16 md:py-24 transition-colors duration-300 ${isDark ? 'bg-gray-950' : 'bg-white'}`}>
        <div className="container-custom px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8 md:mb-12"
          >
            <span className="text-amber-500 font-semibold text-xs sm:text-sm uppercase tracking-wider">Our Team</span>
            <h2 className={`text-2xl sm:text-3xl md:text-4xl font-display font-bold mt-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>
              Meet the <span className="text-amber-400">Experts</span>
            </h2>
            <p className={`max-w-2xl mx-auto mt-3 md:mt-4 text-sm sm:text-base ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Passionate professionals dedicated to your wellness journey.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {team.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className={`group p-6 sm:p-8 rounded-2xl text-center transition-all duration-300 hover:scale-105 ${
                  isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-50 hover:shadow-2xl'
                }`}
              >
                <div className="relative w-24 h-24 sm:w-32 sm:h-32 mx-auto mb-3 sm:mb-4">
                  <img 
                    src={member.image} 
                    alt={member.name}
                    className="w-full h-full rounded-full object-cover ring-4 ring-amber-400/30 group-hover:ring-amber-400/50 transition-all"
                  />
                </div>
                <h4 className={`text-lg sm:text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                  {member.name}
                </h4>
                <p className="text-amber-500 font-medium text-xs sm:text-sm">{member.role}</p>
                <p className={`text-sm mt-1 sm:mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {member.bio}
                </p>
                <div className="flex justify-center gap-2 mt-3 sm:mt-4">
                  <button
                    onClick={() => handleSocialClick(member.social.linkedin, 'LinkedIn')}
                    className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-amber-500 hover:text-white transition-all"
                    aria-label={`${member.name} LinkedIn`}
                  >
                    <LinkedInIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                  </button>
                  <button
                    onClick={() => handleSocialClick(member.social.twitter, 'Twitter')}
                    className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-amber-500 hover:text-white transition-all"
                    aria-label={`${member.name} Twitter`}
                  >
                    <TwitterIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className={`py-12 sm:py-16 md:py-24 transition-colors duration-300 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="container-custom px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            {[
              { value: '15,000+', label: 'Happy Clients', icon: Users },
              { value: '50+', label: 'Partner Facilities', icon: Building2 },
              { value: '200+', label: 'Wellness Programs', icon: Flower2 },
              { value: '98%', label: 'Satisfaction Rate', icon: Star },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-4 sm:p-6 rounded-2xl text-center ${isDark ? 'bg-gray-800' : 'bg-white shadow-lg'}`}
              >
                <stat.icon className="w-6 h-6 sm:w-8 sm:h-8 text-amber-500 mx-auto mb-2 sm:mb-3" />
                <div className={`text-xl sm:text-2xl md:text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                  {stat.value}
                </div>
                <div className={`text-xs sm:text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-16 sm:py-24 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=1920&q=80)',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-amber-900/95 to-orange-800/95" />
        </div>
        <div className="container-custom relative z-10 px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center text-white"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-display font-bold mb-3 md:mb-4">
              Ready to Start Your <span className="text-amber-300">Wellness</span> Journey?
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-200 mb-6 md:mb-8">
              Join thousands of satisfied clients who have transformed their lives through our wellness programs.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
              <button
                onClick={handleBookConsultation}
                className="px-6 sm:px-8 py-2.5 sm:py-3 bg-white text-amber-700 rounded-full font-medium hover:bg-amber-50 transition-all shadow-xl hover:scale-105 flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
                Book a Consultation
              </button>
              <button
                onClick={handleLearnMore}
                className="px-6 sm:px-8 py-2.5 sm:py-3 border-2 border-white/30 text-white rounded-full font-medium hover:bg-white/10 transition-all backdrop-blur-sm flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                Learn More
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default About