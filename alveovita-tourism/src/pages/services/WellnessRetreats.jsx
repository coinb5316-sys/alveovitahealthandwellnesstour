// src/pages/services/WellnessRetreats.jsx
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useTheme } from '../../context/ThemeContext'
import Navbar from '../../components/common/Navbar'
import Footer from '../../components/common/Footer'
import { 
  Flower2, Sun, Heart, TreePine, Coffee, 
  Sparkles, CheckCircle, ArrowRight, Users,
  Calendar, Star, MapPin, Clock, Award,
  Shield, Gift, Crown, Gem, Rocket
} from 'lucide-react'

const WellnessRetreats = () => {
  const { isDark } = useTheme()

  const retreats = [
    {
      title: 'Stress Relief Getaway',
      description: 'Weekend escapes for busy professionals looking to recharge and reset.',
      image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80',
      duration: '3 Days, 2 Nights',
      price: '$1,299',
      rating: 4.9,
      reviews: 128,
      badge: 'Most Popular',
      features: ['Meditation Sessions', 'Spa Treatments', 'Nature Walks', 'Wellness Coaching']
    },
    {
      title: 'Mental Wellness Retreat',
      description: 'Emotional restoration and mindfulness practices for inner peace.',
      image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&q=80',
      duration: '5 Days, 4 Nights',
      price: '$2,499',
      rating: 4.8,
      reviews: 96,
      badge: 'Best Seller',
      features: ['Mindfulness Training', 'Yoga Sessions', 'Art Therapy', 'Group Support']
    },
    {
      title: 'Nature & Adventure Therapy',
      description: 'Healing through immersive nature experiences and adventure activities.',
      image: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=800&q=80',
      duration: '7 Days, 6 Nights',
      price: '$3,299',
      rating: 4.9,
      reviews: 156,
      badge: 'Adventure',
      features: ['Hiking Expeditions', 'Water Sports', 'Forest Bathing', 'Campfire Sessions']
    },
    {
      title: 'Luxury Spa & Wellness',
      description: 'Premium relaxation and rejuvenation with world-class spa treatments.',
      image: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=800&q=80',
      duration: '4 Days, 3 Nights',
      price: '$2,999',
      rating: 4.9,
      reviews: 203,
      badge: 'Luxury',
      features: ['Daily Spa Treatments', 'Personal Concierge', 'Gourmet Cuisine', 'Private Pool Access']
    }
  ]

  const benefits = [
    {
      icon: Heart,
      title: 'Personalized Care',
      description: 'Tailored wellness programs designed for your specific needs.'
    },
    {
      icon: Sparkles,
      title: 'Expert Guidance',
      description: 'Led by certified wellness professionals and therapists.'
    },
    {
      icon: Shield,
      title: 'Safe Environment',
      description: 'Secure and nurturing spaces for deep healing and transformation.'
    },
    {
      icon: Award,
      title: 'Proven Results',
      description: 'Thousands of clients have transformed their lives with us.'
    }
  ]

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-gray-950' : 'bg-white'}`}>
      <Navbar />

      {/* Hero Section */}
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
              <Flower2 className="w-4 h-4" />
              Wellness Retreats
            </span>
            <h1 className="text-5xl md:text-6xl font-display font-bold text-white mt-4 leading-tight">
              Rejuvenate Your <span className="text-amber-400">Mind & Body</span>
            </h1>
            <p className="text-xl text-gray-300 mt-4 leading-relaxed">
              Escape the stress of daily life and embark on a transformative wellness journey. 
              Our retreats combine relaxation, healing, and personal growth in stunning locations.
            </p>
            <div className="flex flex-wrap gap-4 mt-8">
              <Link to="/contact">
                <button className="px-8 py-3 bg-amber-500 text-white rounded-full font-medium hover:bg-amber-600 transition-all shadow-lg shadow-amber-500/30 hover:scale-105">
                  Book a Retreat
                </button>
              </Link>
              <Link to="/tours">
                <button className="px-8 py-3 border-2 border-white/30 text-white rounded-full font-medium hover:bg-white/10 transition-all backdrop-blur-sm hover:scale-105">
                  View All Tours
                </button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className={`py-24 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className={`text-3xl font-display font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
              Why Choose Our Retreats?
            </h2>
            <p className={`mt-2 max-w-2xl mx-auto ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Experience the perfect blend of relaxation, healing, and personal growth.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-6 rounded-2xl text-center transition-all duration-300 hover:scale-105 ${
                  isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:shadow-2xl'
                }`}
              >
                <div className="w-14 h-14 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto mb-4">
                  <benefit.icon className="w-7 h-7 text-amber-500" />
                </div>
                <h3 className={`font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                  {benefit.title}
                </h3>
                <p className={`text-sm mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {benefit.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Retreats Grid */}
      <section className={`py-24 ${isDark ? 'bg-gray-950' : 'bg-white'}`}>
        <div className="container-custom">
          <h2 className={`text-3xl font-display font-bold text-center mb-12 ${isDark ? 'text-white' : 'text-gray-800'}`}>
            Our Wellness Retreats
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            {retreats.map((retreat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`group rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.02] ${
                  isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white shadow-lg hover:shadow-2xl'
                }`}
              >
                <div className="relative aspect-[16/9] overflow-hidden">
                  <img 
                    src={retreat.image} 
                    alt={retreat.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  {retreat.badge && (
                    <span className="absolute top-3 left-3 bg-amber-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                      {retreat.badge}
                    </span>
                  )}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                    <div className="flex items-center space-x-1 text-white bg-black/50 px-3 py-1 rounded-full">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      <span className="text-sm font-medium">{retreat.rating}</span>
                      <span className="text-xs text-gray-300">({retreat.reviews})</span>
                    </div>
                    <span className="text-white bg-black/50 px-3 py-1 rounded-full text-sm font-bold">
                      {retreat.price}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                    {retreat.title}
                  </h3>
                  <p className={`text-sm mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {retreat.description}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {retreat.features.map((feature, i) => (
                      <span key={i} className={`text-xs px-2 py-1 rounded-full ${
                        isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {feature}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200/20">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Clock className="w-4 h-4" />
                      {retreat.duration}
                    </div>
                    <Link to={`/tour/${index + 1}`}>
                      <button className="px-6 py-2 bg-amber-500 text-white rounded-full text-sm font-medium hover:bg-amber-600 transition-all hover:scale-105">
                        Book Now
                      </button>
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1920&q=80)'
        }}>
          <div className="absolute inset-0 bg-gradient-to-r from-amber-900/95 to-orange-800/95" />
        </div>
        <div className="container-custom relative z-10 text-center text-white">
          <h2 className="text-4xl font-display font-bold mb-4">
            Ready to <span className="text-amber-300">Transform</span> Your Life?
          </h2>
          <p className="text-xl text-gray-200 mb-8 max-w-2xl mx-auto">
            Book your wellness retreat today and start your journey to a healthier, happier you.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/contact">
              <button className="px-8 py-3 bg-white text-amber-700 rounded-full font-medium hover:bg-amber-50 transition-all shadow-xl hover:scale-105">
                Contact Us
              </button>
            </Link>
            <Link to="/tours">
              <button className="px-8 py-3 border-2 border-white/30 text-white rounded-full font-medium hover:bg-white/10 transition-all backdrop-blur-sm hover:scale-105">
                Browse All Tours
              </button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default WellnessRetreats