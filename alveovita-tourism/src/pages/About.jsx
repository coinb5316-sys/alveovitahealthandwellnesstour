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
  Calendar, MessageCircle
} from 'lucide-react'

// Custom social media icons since lucide-react doesn't export them
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
      social: { linkedin: 'https://linkedin.com/in/kwamenkrumah', twitter: 'https://twitter.com/kwamenkrumah' }
    },
    {
      name: 'Maya Williams',
      role: 'Head of Wellness Programs',
      image: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&q=80',
      bio: 'Expert in holistic wellness and therapeutic program design.',
      social: { linkedin: 'https://linkedin.com/in/mayawilliams', twitter: 'https://twitter.com/mayawilliams' }
    },
    {
      name: 'James Osei',
      role: 'Operations Director',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
      bio: 'Ensuring seamless travel and healthcare coordination.',
      social: { linkedin: 'https://linkedin.com/in/jamesosei', twitter: 'https://twitter.com/jamesosei' }
    },
    {
      name: 'Dr. Sarah Mensah',
      role: 'Medical Director',
      image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&q=80',
      bio: 'Leading medical excellence and quality care standards.',
      social: { linkedin: 'https://linkedin.com/in/sarahmensah', twitter: 'https://twitter.com/sarahmensah' }
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

  // Navigation handlers
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
      <section className="relative py-32 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1920&q=80)',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-transparent" />
        </div>
        <div className="container-custom relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl"
          >
            <span className="text-amber-400 font-semibold text-sm uppercase tracking-wider">About Us</span>
            <h1 className="text-5xl md:text-6xl font-display font-bold text-white mt-4 leading-tight">
              Transforming Lives Through <span className="text-amber-400">Wellness</span> Tourism
            </h1>
            <p className="text-xl text-gray-300 mt-6 leading-relaxed">
              Alveovita Health & Wellness Tourism is a premier health tourism company dedicated to connecting 
              individuals, families, and organizations with world-class healthcare, wellness, rehabilitation, 
              and tourism experiences.
            </p>
            <div className="flex flex-wrap gap-4 mt-8">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleServices}
                className="px-8 py-3 bg-amber-500 text-white rounded-full font-medium hover:bg-amber-600 transition-all shadow-lg shadow-amber-500/30"
              >
                Our Services
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleContact}
                className="px-8 py-3 border-2 border-white/30 text-white rounded-full font-medium hover:bg-white/10 transition-all backdrop-blur-sm"
              >
                Contact Us
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Our Story */}
      <section className={`py-24 transition-colors duration-300 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="text-amber-500 font-semibold text-sm uppercase tracking-wider">Our Story</span>
              <h2 className={`text-4xl font-display font-bold mt-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                A Journey of <span className="text-amber-400">Healing</span> and Discovery
              </h2>
              <div className={`mt-6 space-y-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
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
                <p>
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
                className="rounded-2xl shadow-2xl"
              />
              <div className="absolute -bottom-6 -right-6 p-6 bg-amber-500 rounded-2xl shadow-xl">
                <div className="text-white">
                  <div className="text-3xl font-bold">5+</div>
                  <div className="text-sm">Years of Excellence</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className={`py-24 transition-colors duration-300 ${isDark ? 'bg-gray-950' : 'bg-white'}`}>
        <div className="container-custom">
          <div className="grid md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className={`p-8 rounded-3xl ${isDark ? 'bg-gray-800' : 'bg-amber-50'} border ${isDark ? 'border-gray-700' : 'border-amber-200'}`}
            >
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center mb-4">
                <Target className="w-7 h-7 text-white" />
              </div>
              <h3 className={`text-2xl font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                Our Mission
              </h3>
              <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                To provide exceptional health and wellness tourism services by connecting clients to 
                quality healthcare, wellness programs, rehabilitation services, and unique travel 
                experiences through professionalism, innovation, and compassionate care.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className={`p-8 rounded-3xl ${isDark ? 'bg-gray-800' : 'bg-blue-50'} border ${isDark ? 'border-gray-700' : 'border-blue-200'}`}
            >
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center mb-4">
                <Lightbulb className="w-7 h-7 text-white" />
              </div>
              <h3 className={`text-2xl font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                Our Vision
              </h3>
              <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                To improve quality of life by providing wellness-centered tourism experiences that 
                promote relaxation, mental rejuvenation, stress reduction, physical wellness, and 
                personal growth.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className={`py-24 transition-colors duration-300 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <span className="text-amber-500 font-semibold text-sm uppercase tracking-wider">Core Values</span>
            <h2 className={`text-4xl font-display font-bold mt-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>
              What Drives Us
            </h2>
            <p className={`max-w-2xl mx-auto mt-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Our values guide every decision we make and every experience we create.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-6 rounded-2xl text-center transition-all duration-300 hover:scale-105 ${
                  isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:shadow-2xl'
                }`}
              >
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 flex items-center justify-center mx-auto mb-4">
                  <value.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                  {value.title}
                </h3>
                <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className={`py-24 transition-colors duration-300 ${isDark ? 'bg-gray-950' : 'bg-white'}`}>
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <span className="text-amber-500 font-semibold text-sm uppercase tracking-wider">Our Journey</span>
            <h2 className={`text-4xl font-display font-bold mt-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>
              Milestones
            </h2>
          </motion.div>

          <div className="relative">
            <div className={`absolute left-1/2 transform -translate-x-1/2 w-1 h-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`} />
            
            {milestones.map((milestone, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`flex items-center mb-8 ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}
              >
                <div className={`w-5/12 ${index % 2 === 0 ? 'text-right pr-8' : 'text-left pl-8'}`}>
                  <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                    <div className="text-2xl font-bold text-amber-500">{milestone.year}</div>
                    <h4 className={`font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                      {milestone.title}
                    </h4>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {milestone.description}
                    </p>
                  </div>
                </div>
                <div className="relative z-10">
                  <div className="w-8 h-8 rounded-full bg-amber-500 border-4 border-white dark:border-gray-900" />
                </div>
                <div className="w-5/12" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className={`py-24 transition-colors duration-300 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <span className="text-amber-500 font-semibold text-sm uppercase tracking-wider">Our Team</span>
            <h2 className={`text-4xl font-display font-bold mt-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>
              Meet the Experts
            </h2>
            <p className={`max-w-2xl mx-auto mt-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Passionate professionals dedicated to your wellness journey.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className={`group p-6 rounded-2xl text-center transition-all duration-300 hover:scale-105 ${
                  isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:shadow-2xl'
                }`}
              >
                <div className="relative w-32 h-32 mx-auto mb-4">
                  <img 
                    src={member.image} 
                    alt={member.name}
                    className="w-full h-full rounded-full object-cover ring-4 ring-amber-400/30 group-hover:ring-amber-400/50 transition-all"
                  />
                </div>
                <h4 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                  {member.name}
                </h4>
                <p className="text-amber-500 font-medium text-sm">{member.role}</p>
                <p className={`text-sm mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {member.bio}
                </p>
                <div className="flex justify-center gap-2 mt-4">
                  <button
                    onClick={() => handleSocialClick(member.social.linkedin, 'LinkedIn')}
                    className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-amber-500 hover:text-white transition-all"
                    aria-label={`${member.name} LinkedIn`}
                  >
                    <LinkedInIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleSocialClick(member.social.twitter, 'Twitter')}
                    className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-amber-500 hover:text-white transition-all"
                    aria-label={`${member.name} Twitter`}
                  >
                    <TwitterIcon className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className={`py-24 transition-colors duration-300 ${isDark ? 'bg-gray-950' : 'bg-white'}`}>
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
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
                className={`p-6 rounded-2xl text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}
              >
                <stat.icon className="w-8 h-8 text-amber-500 mx-auto mb-3" />
                <div className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                  {stat.value}
                </div>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-24 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=1920&q=80)',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-amber-900/95 to-orange-800/95" />
        </div>
        <div className="container-custom relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center text-white"
          >
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">
              Ready to Start Your <span className="text-amber-300">Wellness</span> Journey?
            </h2>
            <p className="text-xl text-gray-200 mb-8">
              Join thousands of satisfied clients who have transformed their lives through our wellness programs.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={handleBookConsultation}
                className="px-8 py-3 bg-white text-amber-700 rounded-full font-medium hover:bg-amber-50 transition-all shadow-xl hover:scale-105 flex items-center gap-2"
              >
                <Calendar className="w-5 h-5" />
                Book a Consultation
              </button>
              <button
                onClick={handleLearnMore}
                className="px-8 py-3 border-2 border-white/30 text-white rounded-full font-medium hover:bg-white/10 transition-all backdrop-blur-sm flex items-center gap-2"
              >
                <ArrowRight className="w-5 h-5" />
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