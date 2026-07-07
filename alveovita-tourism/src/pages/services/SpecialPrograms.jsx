// src/pages/services/SpecialPrograms.jsx
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useTheme } from '../../context/ThemeContext'
import Navbar from '../../components/common/Navbar'
import Footer from '../../components/common/Footer'
import { 
  Gift, Crown, BookOpen, Heart, Globe,
  CheckCircle, ArrowRight, Calendar, Star,
  Award, Shield, Sparkles, Users, TreePine,
  Sun, Moon, Music, Camera, Palette
} from 'lucide-react'

const SpecialPrograms = () => {
  const { isDark } = useTheme()

  const programs = [
    {
      title: 'Senior Wellness Tourism',
      description: 'Gentle exercise, social engagement, and wellness activities for seniors.',
      icon: Crown,
      image: 'https://images.unsplash.com/photo-1571260899304-425eee4c7efc?w=800&q=80',
      features: ['Gentle Yoga', 'Social Activities', 'Health Monitoring', 'Cultural Tours'],
      price: '$2,299'
    },
    {
      title: 'Student Wellness Programs',
      description: 'Academic stress management and wellness programs for students.',
      icon: BookOpen,
      image: 'https://images.unsplash.com/photo-1523050854058-8df90110c7f1?w=800&q=80',
      features: ['Stress Management', 'Study Skills', 'Mental Health Support', 'Physical Activities'],
      price: '$1,499'
    },
    {
      title: 'Family Wellness Experiences',
      description: 'Bonding and rejuvenation experiences for the whole family.',
      icon: Heart,
      image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&q=80',
      features: ['Family Activities', 'Wellness Workshops', 'Nature Excursions', 'Quality Time'],
      price: '$3,499'
    },
    {
      title: 'Cultural Immersion Programs',
      description: 'Experience Ghanaian heritage, traditions, and cultural practices.',
      icon: Globe,
      image: 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800&q=80',
      features: ['Cultural Tours', 'Traditional Workshops', 'Heritage Sites', 'Local Experiences'],
      price: '$2,799'
    }
  ]

  const testimonials = [
    {
      name: 'Margaret Osei',
      role: 'Senior Wellness Participant',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&q=80',
      text: 'The senior wellness program transformed my life. I feel more energetic and connected than ever before.'
    },
    {
      name: 'Dr. Kwame Asare',
      role: 'University Lecturer',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&q=80',
      text: 'Our students have benefited immensely from the wellness programs. Academic performance has improved significantly.'
    },
    {
      name: 'Sarah & Family',
      role: 'Family Wellness Participants',
      image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80',
      text: 'The family wellness experience brought us closer together. We created memories that will last a lifetime.'
    }
  ]

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-gray-950' : 'bg-white'}`}>
      <Navbar />

      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=1920&q=80)'
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
              <Gift className="w-4 h-4" />
              Special Programs
            </span>
            <h1 className="text-5xl md:text-6xl font-display font-bold text-white mt-4 leading-tight">
              Unique <span className="text-amber-400">Wellness</span> Experiences
            </h1>
            <p className="text-xl text-gray-300 mt-4 leading-relaxed">
              Discover our specialized wellness programs designed for specific groups and interests.
            </p>
            <div className="flex flex-wrap gap-4 mt-8">
              <Link to="/contact">
                <button className="px-8 py-3 bg-amber-500 text-white rounded-full font-medium hover:bg-amber-600 transition-all shadow-lg shadow-amber-500/30 hover:scale-105">
                  Book a Program
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

      {/* Programs Grid */}
      <section className={`py-24 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="container-custom">
          <h2 className={`text-3xl font-display font-bold text-center mb-12 ${isDark ? 'text-white' : 'text-gray-800'}`}>
            Our Special Programs
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
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
                <div className="relative aspect-[16/9]">
                  <img 
                    src={program.image} 
                    alt={program.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 bg-amber-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                    <program.icon className="w-4 h-4 inline mr-1" />
                    Special Program
                  </div>
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
                    <span className="text-amber-500 font-bold">{program.price}</span>
                    <button className="px-4 py-1.5 bg-amber-500 text-white rounded-full text-sm font-medium hover:bg-amber-600 transition-all hover:scale-105">
                      Learn More
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className={`py-24 ${isDark ? 'bg-gray-950' : 'bg-white'}`}>
        <div className="container-custom">
          <h2 className={`text-3xl font-display font-bold text-center mb-12 ${isDark ? 'text-white' : 'text-gray-800'}`}>
            What Our Participants Say
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-6 rounded-2xl transition-all duration-300 hover:scale-105 ${
                  isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:shadow-2xl'
                }`}
              >
                <div className="flex items-center gap-4 mb-4">
                  <img 
                    src={testimonial.image} 
                    alt={testimonial.name}
                    className="w-14 h-14 rounded-full object-cover"
                  />
                  <div>
                    <h4 className={`font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                      {testimonial.name}
                    </h4>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {testimonial.role}
                    </p>
                  </div>
                </div>
                <p className={`italic ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  "{testimonial.text}"
                </p>
                <div className="flex mt-3 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
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
            Find Your <span className="text-amber-300">Perfect</span> Program
          </h2>
          <p className="text-xl text-gray-200 mb-8 max-w-2xl mx-auto">
            Discover a program that speaks to your unique needs and interests.
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

export default SpecialPrograms