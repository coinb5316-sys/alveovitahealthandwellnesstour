// src/pages/services/MedicalTourism.jsx
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useTheme } from '../../context/ThemeContext'
import Navbar from '../../components/common/Navbar'
import Footer from '../../components/common/Footer'
import { 
  Stethoscope, Shield, Heart, Zap, Utensils,
  CheckCircle, ArrowRight, Users, Calendar,
  Star, MapPin, Clock, Award, Building2,
  Phone, Mail, Globe, Sparkles, Crown
} from 'lucide-react'

const MedicalTourism = () => {
  const { isDark } = useTheme()

  const services = [
    {
      title: 'Executive Health Screening',
      description: 'Comprehensive health check-ups with detailed analysis and personalized recommendations.',
      icon: Shield,
      features: ['Complete Blood Work', 'Cardiac Assessment', 'Cancer Screening', 'Nutritional Evaluation'],
      price: '$1,999'
    },
    {
      title: 'Wellness Programs',
      description: 'Preventive healthcare and holistic wellness programs for optimal health.',
      icon: Heart,
      features: ['Health Coaching', 'Lifestyle Assessment', 'Stress Management', 'Wellness Planning'],
      price: '$2,499'
    },
    {
      title: 'Rehabilitation Services',
      description: 'Recovery and therapeutic care for physical and mental well-being.',
      icon: Zap,
      features: ['Physical Therapy', 'Occupational Therapy', 'Speech Therapy', 'Mental Health Support'],
      price: '$1,499'
    },
    {
      title: 'Nutritional Counseling',
      description: 'Personalized nutrition planning for optimal health and wellness.',
      icon: Utensils,
      features: ['Diet Assessment', 'Meal Planning', 'Nutrition Education', 'Supplement Guidance'],
      price: '$899'
    }
  ]

  const facilities = [
    {
      name: 'Kempinski Hospital',
      location: 'Accra, Ghana',
      image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80',
      rating: 4.9,
      specialties: ['Cardiology', 'Oncology', 'Neurology']
    },
    {
      name: 'Wellness Medical Center',
      location: 'Kumasi, Ghana',
      image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&q=80',
      rating: 4.8,
      specialties: ['Preventive Medicine', 'Nutrition', 'Mental Health']
    },
    {
      name: 'Coastal Health Resort',
      location: 'Cape Coast, Ghana',
      image: 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800&q=80',
      rating: 4.7,
      specialties: ['Rehabilitation', 'Physical Therapy', 'Wellness Programs']
    }
  ]

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-gray-950' : 'bg-white'}`}>
      <Navbar />

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
              <Stethoscope className="w-4 h-4" />
              Medical Tourism
            </span>
            <h1 className="text-5xl md:text-6xl font-display font-bold text-white mt-4 leading-tight">
              World-Class <span className="text-amber-400">Healthcare</span> in Ghana
            </h1>
            <p className="text-xl text-gray-300 mt-4 leading-relaxed">
              Combine world-class medical care with a relaxing vacation. Experience the best of 
              healthcare and hospitality in Ghana.
            </p>
            <div className="flex flex-wrap gap-4 mt-8">
              <Link to="/contact">
                <button className="px-8 py-3 bg-amber-500 text-white rounded-full font-medium hover:bg-amber-600 transition-all shadow-lg shadow-amber-500/30 hover:scale-105">
                  Book Consultation
                </button>
              </Link>
              <Link to="/tours">
                <button className="px-8 py-3 border-2 border-white/30 text-white rounded-full font-medium hover:bg-white/10 transition-all backdrop-blur-sm hover:scale-105">
                  Explore Tours
                </button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Services Grid */}
      <section className={`py-24 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className={`text-3xl font-display font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
              Our Medical Services
            </h2>
            <p className={`mt-2 max-w-2xl mx-auto ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Comprehensive healthcare services delivered by experienced professionals.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {services.map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-6 rounded-2xl transition-all duration-300 hover:scale-105 ${
                  isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:shadow-2xl'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                    <service.icon className="w-6 h-6 text-amber-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                      {service.title}
                    </h3>
                    <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {service.description}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-3">
                      {service.features.map((feature, i) => (
                        <span key={i} className={`text-xs px-2 py-1 rounded-full ${
                          isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {feature}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200/20">
                      <span className="text-amber-500 font-bold">{service.price}</span>
                      <button className="px-4 py-1.5 bg-amber-500 text-white rounded-full text-sm font-medium hover:bg-amber-600 transition-all hover:scale-105">
                        Learn More
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Facilities Section */}
      <section className={`py-24 ${isDark ? 'bg-gray-950' : 'bg-white'}`}>
        <div className="container-custom">
          <h2 className={`text-3xl font-display font-bold text-center mb-12 ${isDark ? 'text-white' : 'text-gray-800'}`}>
            Partner Facilities
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            {facilities.map((facility, index) => (
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
                    src={facility.image} 
                    alt={facility.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-5">
                  <h3 className={`font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                    {facility.name}
                  </h3>
                  <div className="flex items-center text-sm text-gray-500 mt-1">
                    <MapPin className="w-4 h-4 mr-1" />
                    {facility.location}
                  </div>
                  <div className="flex items-center mt-2 text-amber-400">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="ml-1 font-medium">{facility.rating}</span>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {facility.specialties.map((specialty, i) => (
                      <span key={i} className={`text-xs px-2 py-0.5 rounded-full ${
                        isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1920&q=80)'
        }}>
          <div className="absolute inset-0 bg-gradient-to-r from-amber-900/95 to-orange-800/95" />
        </div>
        <div className="container-custom relative z-10 text-center text-white">
          <h2 className="text-4xl font-display font-bold mb-4">
            Start Your <span className="text-amber-300">Health Journey</span> Today
          </h2>
          <p className="text-xl text-gray-200 mb-8 max-w-2xl mx-auto">
            Experience world-class healthcare in the heart of Ghana.
          </p>
          <Link to="/contact">
            <button className="px-8 py-3 bg-white text-amber-700 rounded-full font-medium hover:bg-amber-50 transition-all shadow-xl hover:scale-105">
              Contact Us
            </button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default MedicalTourism