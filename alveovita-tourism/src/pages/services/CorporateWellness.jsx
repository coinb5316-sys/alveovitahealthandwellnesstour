// src/pages/services/CorporateWellness.jsx
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useTheme } from '../../context/ThemeContext'
import Navbar from '../../components/common/Navbar'
import Footer from '../../components/common/Footer'
import { 
  Briefcase, Users, Mountain, Book, Dumbbell,
  CheckCircle, ArrowRight, Calendar, Star,
  Award, Shield, Sparkles, Gift, Crown
} from 'lucide-react'

const CorporateWellness = () => {
  const { isDark } = useTheme()

  const programs = [
    {
      title: 'Team Building Retreats',
      description: 'Strengthen team bonds and improve collaboration through wellness activities.',
      image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80',
      duration: '3 Days',
      price: '$5,999',
      features: ['Team Exercises', 'Communication Workshops', 'Trust Building', 'Group Challenges']
    },
    {
      title: 'Stress Management Programs',
      description: 'Help employees manage stress and improve workplace well-being.',
      image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&q=80',
      duration: '2 Days',
      price: '$3,999',
      features: ['Stress Reduction Techniques', 'Mindfulness Training', 'Work-Life Balance', 'Relaxation Sessions']
    },
    {
      title: 'Health Education Workshops',
      description: 'Interactive workshops on health, nutrition, and wellness topics.',
      image: 'https://images.unsplash.com/photo-1571260899304-425eee4c7efc?w=800&q=80',
      duration: '1 Day',
      price: '$2,499',
      features: ['Health Education', 'Nutrition Workshops', 'Preventive Care', 'Wellness Resources']
    },
    {
      title: 'Corporate Fitness Programs',
      description: 'Fitness initiatives designed to improve employee health and productivity.',
      image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80',
      duration: 'Ongoing',
      price: 'Custom',
      features: ['Group Fitness', 'Personal Training', 'Wellness Challenges', 'Health Tracking']
    }
  ]

  const benefits = [
    'Increased Employee Productivity',
    'Reduced Healthcare Costs',
    'Improved Employee Retention',
    'Enhanced Company Culture',
    'Better Work-Life Balance',
    'Positive Brand Image'
  ]

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-gray-950' : 'bg-white'}`}>
      <Navbar />

      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1920&q=80)'
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
              <Briefcase className="w-4 h-4" />
              Corporate Wellness
            </span>
            <h1 className="text-5xl md:text-6xl font-display font-bold text-white mt-4 leading-tight">
              Transform Your <span className="text-amber-400">Workplace</span>
            </h1>
            <p className="text-xl text-gray-300 mt-4 leading-relaxed">
              Invest in your employees' well-being and create a healthier, more productive workplace.
            </p>
            <div className="flex flex-wrap gap-4 mt-8">
              <Link to="/contact">
                <button className="px-8 py-3 bg-amber-500 text-white rounded-full font-medium hover:bg-amber-600 transition-all shadow-lg shadow-amber-500/30 hover:scale-105">
                  Get a Quote
                </button>
              </Link>
              <Link to="/services">
                <button className="px-8 py-3 border-2 border-white/30 text-white rounded-full font-medium hover:bg-white/10 transition-all backdrop-blur-sm hover:scale-105">
                  View All Services
                </button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Programs */}
      <section className={`py-24 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="container-custom">
          <h2 className={`text-3xl font-display font-bold text-center mb-12 ${isDark ? 'text-white' : 'text-gray-800'}`}>
            Our Corporate Programs
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            {programs.map((program, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`rounded-2xl overflow-hidden transition-all duration-300 hover:scale-105 ${
                  isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white shadow-lg hover:shadow-2xl'
                }`}
              >
                <div className="aspect-[16/9]">
                  <img 
                    src={program.image} 
                    alt={program.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                    {program.title}
                  </h3>
                  <p className={`text-sm mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {program.description}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-3">
                    {program.features.map((feature, i) => (
                      <span key={i} className={`text-xs px-2 py-1 rounded-full ${
                        isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {feature}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200/20">
                    <div>
                      <span className="text-amber-500 font-bold">{program.price}</span>
                      <span className={`text-xs ml-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        / {program.duration}
                      </span>
                    </div>
                    <button className="px-4 py-1.5 bg-amber-500 text-white rounded-full text-sm font-medium hover:bg-amber-600 transition-all hover:scale-105">
                      Inquire Now
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className={`py-24 ${isDark ? 'bg-gray-950' : 'bg-white'}`}>
        <div className="container-custom">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className={`text-3xl font-display font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                Why Invest in <span className="text-amber-400">Corporate Wellness</span>?
              </h2>
              <p className={`mt-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                A healthy workforce is a productive workforce. Our corporate wellness programs deliver measurable results.
              </p>
              <ul className="mt-6 space-y-3">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                      {benefit}
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
                src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&q=80"
                alt="Corporate Wellness"
                className="rounded-2xl shadow-2xl"
              />
              <div className="absolute -bottom-6 -right-6 p-6 bg-amber-500 rounded-2xl shadow-xl">
                <div className="text-white">
                  <div className="text-3xl font-bold">200+</div>
                  <div className="text-sm">Corporate Clients</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1920&q=80)'
        }}>
          <div className="absolute inset-0 bg-gradient-to-r from-amber-900/95 to-orange-800/95" />
        </div>
        <div className="container-custom relative z-10 text-center text-white">
          <h2 className="text-4xl font-display font-bold mb-4">
            Ready to <span className="text-amber-300">Transform</span> Your Workplace?
          </h2>
          <p className="text-xl text-gray-200 mb-8 max-w-2xl mx-auto">
            Contact us today to create a customized wellness program for your organization.
          </p>
          <Link to="/contact">
            <button className="px-8 py-3 bg-white text-amber-700 rounded-full font-medium hover:bg-amber-50 transition-all shadow-xl hover:scale-105">
              Get Started
            </button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default CorporateWellness