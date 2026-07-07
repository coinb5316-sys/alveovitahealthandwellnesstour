// src/pages/Investors.jsx
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import Navbar from '../components/common/Navbar'
import Footer from '../components/common/Footer'
import { 
  TrendingUp, Award, Shield, Users, Globe,
  ArrowRight, CheckCircle, Calendar, DollarSign,
  BarChart, PieChart, LineChart, Activity,
  Building2, Briefcase, FileText, Phone,
  Mail, MapPin, Clock, Sparkles,
  Crown, Gem, Rocket, Infinity
} from 'lucide-react'

const Investors = () => {
  const { isDark } = useTheme()

  const metrics = [
    { label: 'Revenue Growth', value: '156%', change: '+32% YoY', icon: TrendingUp },
    { label: 'Client Base', value: '15,000+', change: '+45% YoY', icon: Users },
    { label: 'Market Reach', value: '50+', change: 'Countries', icon: Globe },
    { label: 'Satisfaction Rate', value: '98%', change: '+2% YoY', icon: Award }
  ]

  const opportunities = [
    {
      title: 'Market Expansion',
      description: 'Expanding wellness tourism services across West Africa and beyond.',
      icon: Globe,
      status: 'Active',
      progress: 75
    },
    {
      title: 'Technology Integration',
      description: 'Developing digital platforms for seamless wellness experiences.',
      icon: Activity,
      status: 'In Progress',
      progress: 60
    },
    {
      title: 'Partnership Development',
      description: 'Building strategic partnerships with healthcare and tourism providers.',
      icon: Briefcase,
      status: 'Active',
      progress: 85
    },
    {
      title: 'Sustainability Initiatives',
      description: 'Investing in sustainable and eco-friendly wellness practices.',
      icon: Shield,
      status: 'Planning',
      progress: 30
    }
  ]

  const documents = [
    { name: 'Annual Report 2024', size: '2.4 MB', date: 'Jan 2025', icon: FileText },
    { name: 'Investor Presentation', size: '4.1 MB', date: 'Dec 2024', icon: BarChart },
    { name: 'Financial Statements Q4 2024', size: '1.8 MB', date: 'Jan 2025', icon: PieChart },
    { name: 'Business Plan 2025', size: '3.2 MB', date: 'Nov 2024', icon: LineChart }
  ]

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-gray-950' : 'bg-white'}`}>
      <Navbar />

      {/* Hero Section */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1920&q=80)'
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
              <TrendingUp className="w-4 h-4" />
              Investors
            </span>
            <h1 className="text-5xl md:text-6xl font-display font-bold text-white mt-4 leading-tight">
              Invest in the Future of <span className="text-amber-400">Wellness Tourism</span>
            </h1>
            <p className="text-xl text-gray-300 mt-4 leading-relaxed">
              Join us in transforming the wellness tourism industry. We're building the future of health and travel in Africa.
            </p>
            <div className="flex flex-wrap gap-4 mt-8">
              <button className="px-8 py-3 bg-amber-500 text-white rounded-full font-medium hover:bg-amber-600 transition-all shadow-lg shadow-amber-500/30 hover:scale-105">
                Contact IR Team
              </button>
              <Link to="/contact">
                <button className="px-8 py-3 border-2 border-white/30 text-white rounded-full font-medium hover:bg-white/10 transition-all backdrop-blur-sm hover:scale-105">
                  Get in Touch
                </button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Metrics */}
      <section className={`py-16 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="container-custom">
          <div className="grid md:grid-cols-4 gap-6">
            {metrics.map((metric, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-6 rounded-2xl text-center transition-all duration-300 hover:scale-105 ${
                  isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:shadow-2xl'
                }`}
              >
                <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto mb-3">
                  <metric.icon className="w-6 h-6 text-amber-500" />
                </div>
                <div className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                  {metric.value}
                </div>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {metric.label}
                </div>
                <div className={`text-xs mt-1 ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                  {metric.change}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Investment Opportunities */}
      <section className={`py-24 ${isDark ? 'bg-gray-950' : 'bg-white'}`}>
        <div className="container-custom">
          <h2 className={`text-3xl font-display font-bold text-center mb-12 ${isDark ? 'text-white' : 'text-gray-800'}`}>
            Investment Opportunities
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            {opportunities.map((opp, index) => (
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
                    <opp.icon className="w-6 h-6 text-amber-500" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className={`font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                        {opp.title}
                      </h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        opp.status === 'Active' 
                          ? 'bg-green-500/20 text-green-400'
                          : opp.status === 'In Progress'
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : 'bg-blue-500/20 text-blue-400'
                      }`}>
                        {opp.status}
                      </span>
                    </div>
                    <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {opp.description}
                    </p>
                    <div className="mt-3">
                      <div className={`w-full h-1.5 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                        <div 
                          className="h-1.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500"
                          style={{ width: `${opp.progress}%` }}
                        />
                      </div>
                      <div className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {opp.progress}% Complete
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Documents */}
      <section className={`py-24 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="container-custom">
          <h2 className={`text-3xl font-display font-bold text-center mb-12 ${isDark ? 'text-white' : 'text-gray-800'}`}>
            Investor Documents
          </h2>

          <div className="max-w-3xl mx-auto space-y-4">
            {documents.map((doc, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-4 rounded-xl flex items-center justify-between transition-all duration-300 hover:scale-[1.02] ${
                  isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:shadow-xl'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                    <doc.icon className="w-5 h-5 text-amber-500" />
                  </div>
                  <div>
                    <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                      {doc.name}
                    </h4>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span>{doc.size}</span>
                      <span>•</span>
                      <span>{doc.date}</span>
                    </div>
                  </div>
                </div>
                <button className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all hover:scale-105 ${
                  isDark ? 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30' : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                }`}>
                  Download
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1920&q=80)'
        }}>
          <div className="absolute inset-0 bg-gradient-to-r from-amber-900/95 to-orange-800/95" />
        </div>
        <div className="container-custom relative z-10 text-center text-white">
          <h2 className="text-4xl font-display font-bold mb-4">
            Partner with <span className="text-amber-300">Us</span>
          </h2>
          <p className="text-xl text-gray-200 mb-8 max-w-2xl mx-auto">
            Join us in shaping the future of wellness tourism. Contact our Investor Relations team today.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button className="px-8 py-3 bg-white text-amber-700 rounded-full font-medium hover:bg-amber-50 transition-all shadow-xl hover:scale-105">
              Contact IR Team
            </button>
            <Link to="/contact">
              <button className="px-8 py-3 border-2 border-white/30 text-white rounded-full font-medium hover:bg-white/10 transition-all backdrop-blur-sm hover:scale-105">
                Get in Touch
              </button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default Investors