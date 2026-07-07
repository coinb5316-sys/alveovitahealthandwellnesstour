// src/pages/Services.jsx
import { useState } from 'react'
import { motion } from 'framer-motion'
import { useTheme } from '../context/ThemeContext'
import Navbar from '../components/common/Navbar'
import Footer from '../components/common/Footer'
import { 
  Stethoscope, Flower2, Briefcase, Gift, Heart, 
  Sun, Leaf, Coffee, TreePine, Users, Dumbbell,
  Utensils, BookOpen, Crown, Shield, Zap, Sparkles,
  CheckCircle, ArrowRight, Clock, MapPin, Star,
  Phone, Mail, Calendar, User, Globe // <-- Added Globe here
} from 'lucide-react'

const Services = () => {
  const { isDark } = useTheme()
  const [activeCategory, setActiveCategory] = useState('all')

  const serviceCategories = [
    {
      id: 'wellness',
      icon: Flower2,
      title: 'Wellness Retreats',
      color: 'from-emerald-500 to-teal-500',
      description: 'Rejuvenate your mind, body, and soul with our curated wellness experiences.',
      services: [
        {
          name: 'Stress Relief Getaways',
          description: 'Weekend escapes designed for busy professionals, healthcare workers, teachers, executives, and entrepreneurs.',
          icon: Sun,
          activities: ['Beach relaxation', 'Nature walks', 'Guided meditation', 'Spa experiences', 'Sunset therapy sessions', 'Wellness talks'],
          duration: '2-3 Days',
          price: '$499'
        },
        {
          name: 'Mental Wellness Retreats',
          description: 'Focused on emotional restoration and psychological well-being.',
          icon: Heart,
          activities: ['Mindfulness training', 'Guided reflection', 'Wellness coaching', 'Group support sessions', 'Nature therapy'],
          duration: '4-5 Days',
          price: '$899'
        },
        {
          name: 'Nature & Adventure Therapy',
          description: 'Using nature as a healing environment with activities in waterfalls, mountains, botanical gardens, and wildlife reserves.',
          icon: TreePine,
          activities: ['Hiking', 'Forest walks', 'Bird watching', 'Photography therapy', 'Outdoor relaxation'],
          duration: '3-4 Days',
          price: '$749'
        },
        {
          name: 'Spa & Therapeutic Treatments',
          description: 'Luxury relaxation and therapeutic treatments for complete rejuvenation.',
          icon: Coffee,
          activities: ['Massage therapy', 'Aromatherapy', 'Hydrotherapy', 'Facial treatments', 'Body scrubs'],
          duration: '1-2 Days',
          price: '$299'
        }
      ]
    },
    {
      id: 'medical',
      icon: Stethoscope,
      title: 'Medical Tourism',
      color: 'from-blue-500 to-cyan-500',
      description: 'World-class healthcare combined with the warmth of Ghanaian hospitality.',
      services: [
        {
          name: 'Executive Health Screening',
          description: 'Comprehensive health check-ups and preventive care for busy professionals.',
          icon: Shield,
          activities: ['Full body check-up', 'Cardiac assessment', 'Cancer screening', 'Nutritional assessment', 'Lifestyle coaching'],
          duration: '2-3 Days',
          price: '$1,299'
        },
        {
          name: 'Preventive Healthcare Programs',
          description: 'Holistic wellness programs focused on disease prevention and health optimization.',
          icon: Heart,
          activities: ['Health risk assessment', 'Personalized wellness plan', 'Health education', 'Follow-up care'],
          duration: '5-7 Days',
          price: '$1,899'
        },
        {
          name: 'Rehabilitation Services',
          description: 'Recovery and therapeutic care for various health conditions.',
          icon: Zap,
          activities: ['Physical therapy', 'Occupational therapy', 'Speech therapy', 'Pain management'],
          duration: '7-14 Days',
          price: '$2,499'
        },
        {
          name: 'Nutritional Counseling',
          description: 'Personalized nutrition planning for optimal health and wellness.',
          icon: Utensils,
          activities: ['Dietary assessment', 'Meal planning', 'Nutrition education', 'Healthy cooking classes'],
          duration: '3-5 Days',
          price: '$599'
        }
      ]
    },
    {
      id: 'corporate',
      icon: Briefcase,
      title: 'Corporate Wellness',
      color: 'from-purple-500 to-indigo-500',
      description: 'Employee well-being programs designed to boost productivity and satisfaction.',
      services: [
        {
          name: 'Corporate Wellness Retreats',
          description: 'Team building and leadership development in a wellness-focused environment.',
          icon: Users,
          activities: ['Team-building exercises', 'Leadership development', 'Stress management workshops', 'Recreational activities', 'Wellness screening'],
          duration: '3-5 Days',
          price: '$4,999'
        },
        {
          name: 'Stress Management Programs',
          description: 'Comprehensive programs to manage workplace stress and improve employee well-being.',
          icon: Shield,
          activities: ['Stress assessment', 'Coping strategies', 'Mindfulness training', 'Work-life balance coaching'],
          duration: '2-3 Days',
          price: '$2,499'
        },
        {
          name: 'Health Education Workshops',
          description: 'Workplace wellness workshops to promote healthy habits and lifestyles.',
          icon: BookOpen,
          activities: ['Health talks', 'Interactive sessions', 'Wellness challenges', 'Health screenings'],
          duration: '1-2 Days',
          price: '$1,499'
        },
        {
          name: 'Corporate Fitness Programs',
          description: 'Fitness initiatives designed for the corporate environment.',
          icon: Dumbbell,
          activities: ['Fitness assessments', 'Exercise programs', 'Personal training', 'Group fitness classes'],
          duration: 'Ongoing',
          price: '$999/month'
        }
      ]
    },
    {
      id: 'special',
      icon: Gift,
      title: 'Special Programs',
      color: 'from-amber-500 to-orange-500',
      description: 'Tailored wellness experiences for specific needs and demographics.',
      services: [
        {
          name: 'Senior Wellness Tourism',
          description: 'Specially designed programs for older adults focusing on gentle exercise and social engagement.',
          icon: Crown,
          activities: ['Gentle exercise', 'Health education', 'Social interaction', 'Recreational outings', 'Relaxation therapy'],
          duration: '5-7 Days',
          price: '$1,699'
        },
        {
          name: 'Student Wellness Programs',
          description: 'Helping students manage academic stress and burnout with engaging activities.',
          icon: BookOpen,
          activities: ['Recreational tours', 'Motivational sessions', 'Career coaching', 'Wellness workshops', 'Team-building activities'],
          duration: '3-5 Days',
          price: '$799'
        },
        {
          name: 'Family Wellness Experiences',
          description: 'Bonding and rejuvenation experiences for the whole family.',
          icon: Heart,
          activities: ['Family activities', 'Wellness workshops', 'Nature exploration', 'Cultural experiences'],
          duration: '4-6 Days',
          price: '$2,499'
        },
        {
          name: 'Cultural Immersion Programs',
          description: 'Experience Ghanaian heritage and traditions while focusing on wellness.',
          icon: Globe,
          activities: ['Cultural tours', 'Traditional ceremonies', 'Local cuisine', 'Arts and crafts', 'Music and dance'],
          duration: '5-7 Days',
          price: '$1,899'
        }
      ]
    }
  ]

  const filteredCategories = activeCategory === 'all' 
    ? serviceCategories 
    : serviceCategories.filter(cat => cat.id === activeCategory)

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-gray-950' : 'bg-white'}`}>
      <Navbar />

      {/* Hero Section */}
      <section className="relative py-32 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=1920&q=80)',
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
            <span className="text-amber-400 font-semibold text-sm uppercase tracking-wider">Our Services</span>
            <h1 className="text-5xl md:text-6xl font-display font-bold text-white mt-4 leading-tight">
              Comprehensive <span className="text-amber-400">Wellness</span> Solutions
            </h1>
            <p className="text-xl text-gray-300 mt-6 leading-relaxed">
              Discover our wide range of health and wellness services designed to transform your life.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Service Categories */}
      <section className={`py-16 transition-colors duration-300 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="container-custom">
          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-6 py-3 rounded-full font-medium transition-all hover:scale-105 ${
                activeCategory === 'all'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg'
                  : isDark
                    ? 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              All Services
            </button>
            {serviceCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`px-6 py-3 rounded-full font-medium transition-all hover:scale-105 flex items-center gap-2 ${
                  activeCategory === category.id
                    ? `bg-gradient-to-r ${category.color} text-white shadow-lg`
                    : isDark
                      ? 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                      : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
              >
                <category.icon className="w-4 h-4" />
                {category.title}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Services Grid */}
      {filteredCategories.map((category) => (
        <section key={category.id} className={`py-16 transition-colors duration-300 ${isDark ? 'bg-gray-950' : 'bg-white'}`}>
          <div className="container-custom">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-12"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-r ${category.color} flex items-center justify-center`}>
                  <category.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className={`text-3xl font-display font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                    {category.title}
                  </h2>
                  <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                    {category.description}
                  </p>
                </div>
              </div>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-6">
              {category.services.map((service, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  className={`p-6 rounded-2xl transition-all duration-300 ${
                    isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-50 hover:shadow-2xl'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${category.color} flex items-center justify-center flex-shrink-0`}>
                      <service.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                        {service.name}
                      </h3>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                        {service.description}
                      </p>
                      
                      <div className="mt-4 space-y-2">
                        <div className="flex flex-wrap gap-2">
                          {service.activities.slice(0, 4).map((activity, idx) => (
                            <span key={idx} className={`text-xs px-2 py-1 rounded-full ${
                              isDark ? 'bg-gray-700 text-gray-300' : 'bg-white text-gray-600'
                            }`}>
                              {activity}
                            </span>
                          ))}
                          {service.activities.length > 4 && (
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              isDark ? 'bg-gray-700 text-gray-300' : 'bg-white text-gray-600'
                            }`}>
                              +{service.activities.length - 4} more
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                          <div className="flex items-center gap-4 text-sm">
                            <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                              <Clock className="w-4 h-4 inline mr-1" />
                              {service.duration}
                            </span>
                            <span className="text-amber-500 font-bold">
                              {service.price}
                            </span>
                          </div>
                          <button className="px-4 py-2 bg-amber-500 text-white rounded-xl text-sm font-medium hover:bg-amber-600 transition-all hover:scale-105">
                            Learn More
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      ))}

      {/* Why Choose Us */}
      <section className={`py-24 transition-colors duration-300 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <span className="text-amber-500 font-semibold text-sm uppercase tracking-wider">Why Choose Us</span>
            <h2 className={`text-4xl font-display font-bold mt-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>
              Excellence in Every Experience
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Shield,
                title: 'Quality Assured',
                description: 'All our partners are carefully vetted to ensure the highest standards of care and service.'
              },
              {
                icon: Users,
                title: 'Personalized Care',
                description: 'Every program is tailored to your unique needs and preferences for optimal results.'
              },
              {
                icon: Star,
                title: 'Proven Results',
                description: 'Join thousands of satisfied clients who have experienced transformative wellness journeys.'
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-8 rounded-2xl text-center transition-all duration-300 hover:scale-105 ${
                  isDark ? 'bg-gray-800' : 'bg-white shadow-lg'
                }`}
              >
                <div className="w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-8 h-8 text-amber-500" />
                </div>
                <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                  {item.title}
                </h3>
                <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                  {item.description}
                </p>
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
            backgroundImage: 'url(https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=1920&q=80)',
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
              Ready to Begin Your <span className="text-amber-300">Transformation</span>?
            </h2>
            <p className="text-xl text-gray-200 mb-8">
              Contact us today to start planning your personalized wellness journey.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <button className="px-8 py-3 bg-white text-amber-700 rounded-full font-medium hover:bg-amber-50 transition-all shadow-xl hover:scale-105">
                Get Started
              </button>
              <button className="px-8 py-3 border-2 border-white/30 text-white rounded-full font-medium hover:bg-white/10 transition-all backdrop-blur-sm">
                Contact Us
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default Services