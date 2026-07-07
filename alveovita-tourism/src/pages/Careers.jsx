// src/pages/Careers.jsx
import { motion } from 'framer-motion'
import { useTheme } from '../context/ThemeContext'
import Navbar from '../components/common/Navbar'
import Footer from '../components/common/Footer'
import { Briefcase, MapPin, Clock, DollarSign, CheckCircle } from 'lucide-react'

const Careers = () => {
  const { isDark } = useTheme()

  const openPositions = [
    {
      title: 'Wellness Program Coordinator',
      department: 'Programs',
      location: 'Accra, Ghana',
      type: 'Full-time',
      salary: 'Competitive',
      description: 'Coordinate wellness programs and ensure exceptional client experiences.'
    },
    {
      title: 'Medical Tourism Specialist',
      department: 'Medical',
      location: 'Accra, Ghana',
      type: 'Full-time',
      salary: 'Competitive',
      description: 'Manage medical tourism services and client healthcare journeys.'
    },
    {
      title: 'Marketing Manager',
      department: 'Marketing',
      location: 'Remote',
      type: 'Full-time',
      salary: 'Competitive',
      description: 'Lead marketing initiatives and brand growth strategies.'
    },
    {
      title: 'Customer Experience Associate',
      department: 'Customer Service',
      location: 'Accra, Ghana',
      type: 'Full-time',
      salary: 'Competitive',
      description: 'Deliver exceptional customer service and support.'
    }
  ]

  const benefits = [
    'Competitive Salary',
    'Health Insurance',
    'Flexible Work Hours',
    'Professional Development',
    'Wellness Programs',
    'Travel Opportunities'
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
            <span className="text-amber-400 font-semibold text-sm uppercase tracking-wider">Careers</span>
            <h1 className="text-5xl md:text-6xl font-display font-bold text-white mt-4 leading-tight">
              Join Our <span className="text-amber-400">Mission</span>
            </h1>
            <p className="text-xl text-gray-300 mt-4 leading-relaxed">
              Help us transform lives through wellness tourism. We're looking for passionate individuals to join our team.
            </p>
          </motion.div>
        </div>
      </section>

      <section className={`py-24 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="container-custom">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <h2 className={`text-2xl font-display font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                Open Positions
              </h2>
              <div className="space-y-4">
                {openPositions.map((position, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-6 rounded-2xl transition-all duration-300 hover:scale-105 ${
                      isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:shadow-2xl'
                    }`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                          {position.title}
                        </h3>
                        <p className="text-amber-500 font-medium">{position.department}</p>
                        <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {position.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {position.type}
                          </span>
                          <span className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4" />
                            {position.salary}
                          </span>
                        </div>
                        <p className={`mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          {position.description}
                        </p>
                      </div>
                      <button className="px-6 py-2 bg-amber-500 text-white rounded-xl font-medium hover:bg-amber-600 transition-all hover:scale-105 whitespace-nowrap">
                        Apply Now
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div>
              <div className={`p-6 rounded-2xl sticky top-24 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-xl`}>
                <h3 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                  Why Join Us?
                </h3>
                <ul className="space-y-3">
                  {benefits.map((benefit, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>{benefit}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-6 pt-6 border-t border-gray-200/20">
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Don't see a position that fits?
                  </p>
                  <button className="mt-2 text-amber-500 hover:text-amber-600 transition-colors font-medium">
                    Send us your CV →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default Careers