// src/pages/services/CulturalTourism.jsx
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useTheme } from '../../context/ThemeContext'
import Navbar from '../../components/common/Navbar'
import Footer from '../../components/common/Footer'
import { 
  Compass, Camera, Music, Palette, Wand2,
  CheckCircle, ArrowRight, Calendar, Star,
  Award, Shield, Sparkles, Gift, Crown,
  MapPin, Clock, Users, Globe
} from 'lucide-react'

const CulturalTourism = () => {
  const { isDark } = useTheme()

  const experiences = [
    {
      title: 'Traditional Art & Craft Workshops',
      description: 'Learn traditional Ghanaian art forms from master artisans.',
      image: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=800&q=80',
      duration: 'Half Day',
      price: '$85',
      features: ['Bead Making', 'Kente Weaving', 'Pottery', 'Drum Making']
    },
    {
      title: 'Ghanaian Culinary Experience',
      description: 'Discover the rich flavors of Ghanaian cuisine through hands-on cooking classes.',
      image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80',
      duration: 'Full Day',
      price: '$120',
      features: ['Cooking Classes', 'Local Market Tours', 'Tasting Sessions', 'Recipe Book']
    },
    {
      title: 'Heritage & History Tours',
      description: 'Explore Ghana\'s rich history and cultural heritage sites.',
      image: 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800&q=80',
      duration: '3 Days',
      price: '$450',
      features: ['Castle Tours', 'Museum Visits', 'Historical Sites', 'Cultural Talks']
    },
    {
      title: 'Festival & Celebration Experiences',
      description: 'Participate in vibrant Ghanaian festivals and celebrations.',
      image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&q=80',
      duration: '2 Days',
      price: '$350',
      features: ['Festival Attendance', 'Traditional Dances', 'Ceremonial Participation', 'Cultural Immersion']
    }
  ]

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-gray-950' : 'bg-white'}`}>
      <Navbar />

      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=1920&q=80)'
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
              <Compass className="w-4 h-4" />
              Cultural Tourism
            </span>
            <h1 className="text-5xl md:text-6xl font-display font-bold text-white mt-4 leading-tight">
              Experience Ghana's <span className="text-amber-400">Rich Culture</span>
            </h1>
            <p className="text-xl text-gray-300 mt-4 leading-relaxed">
              Immerse yourself in Ghana's vibrant culture, traditions, and heritage through authentic experiences.
            </p>
            <div className="flex flex-wrap gap-4 mt-8">
              <Link to="/contact">
                <button className="px-8 py-3 bg-amber-500 text-white rounded-full font-medium hover:bg-amber-600 transition-all shadow-lg shadow-amber-500/30 hover:scale-105">
                  Book Experience
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

      <section className={`py-24 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="container-custom">
          <h2 className={`text-3xl font-display font-bold text-center mb-12 ${isDark ? 'text-white' : 'text-gray-800'}`}>
            Cultural Experiences
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            {experiences.map((exp, index) => (
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
                    src={exp.image} 
                    alt={exp.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                    {exp.title}
                  </h3>
                  <p className={`text-sm mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {exp.description}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-3">
                    {exp.features.map((feature, i) => (
                      <span key={i} className={`text-xs px-2 py-1 rounded-full ${
                        isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {feature}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200/20">
                    <div>
                      <span className="text-amber-500 font-bold">{exp.price}</span>
                      <span className={`text-xs ml-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        / {exp.duration}
                      </span>
                    </div>
                    <button className="px-4 py-1.5 bg-amber-500 text-white rounded-full text-sm font-medium hover:bg-amber-600 transition-all hover:scale-105">
                      Book Now
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=1920&q=80)'
        }}>
          <div className="absolute inset-0 bg-gradient-to-r from-amber-900/95 to-orange-800/95" />
        </div>
        <div className="container-custom relative z-10 text-center text-white">
          <h2 className="text-4xl font-display font-bold mb-4">
            Immerse Yourself in <span className="text-amber-300">Ghanaian Culture</span>
          </h2>
          <p className="text-xl text-gray-200 mb-8 max-w-2xl mx-auto">
            Book your cultural experience today and discover the heart of Ghana.
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

export default CulturalTourism