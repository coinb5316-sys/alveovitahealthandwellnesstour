// src/pages/Help.jsx
import { useState } from 'react'
import { motion } from 'framer-motion'
import { useTheme } from '../context/ThemeContext'
import Navbar from '../components/common/Navbar'
import Footer from '../components/common/Footer'
import { Search, ChevronDown, ChevronUp, MessageCircle, Phone, Mail, Book, Video, Headphones } from 'lucide-react'

const Help = () => {
  const { isDark } = useTheme()
  const [expandedFaq, setExpandedFaq] = useState(null)

  const faqs = [
    {
      question: 'How do I book a tour?',
      answer: 'You can book a tour directly through our website by selecting your preferred tour, choosing dates, and completing the booking form. You can also contact us directly for personalized assistance.'
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards, bank transfers, mobile money (MoMo), and Paystack for secure online payments.'
    },
    {
      question: 'Can I cancel my booking?',
      answer: 'Yes, you can cancel your booking up to 7 days before the tour start date for a full refund. Cancellations within 7 days may incur a fee.'
    },
    {
      question: 'Do you offer group discounts?',
      answer: 'Yes, we offer special rates for groups of 10 or more. Please contact us directly for group booking inquiries.'
    },
    {
      question: 'What should I pack for a wellness retreat?',
      answer: 'We recommend comfortable clothing, swimwear, sunscreen, a hat, comfortable walking shoes, and any personal wellness items you may need.'
    },
    {
      question: 'Is travel insurance included?',
      answer: 'Travel insurance is not included but we strongly recommend purchasing travel insurance for your protection.'
    }
  ]

  const helpCategories = [
    { icon: Book, title: 'Documentation', description: 'Guides and manuals' },
    { icon: Video, title: 'Video Tutorials', description: 'Step-by-step videos' },
    { icon: Headphones, title: 'Live Support', description: '24/7 assistance' },
    { icon: MessageCircle, title: 'Community', description: 'Join our community' }
  ]

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-gray-950' : 'bg-white'}`}>
      <Navbar />

      <section className="relative py-20 overflow-hidden">
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
            className="max-w-3xl mx-auto text-center text-white"
          >
            <span className="text-amber-400 font-semibold text-sm uppercase tracking-wider">Help Center</span>
            <h1 className="text-4xl md:text-5xl font-display font-bold mt-4">How Can We Help?</h1>
            <p className="text-lg text-gray-300 mt-4">Find answers to common questions or reach out to our support team.</p>
            
            <div className="mt-8 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search for help..."
                className="w-full pl-12 pr-4 py-4 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400/50"
              />
            </div>
          </motion.div>
        </div>
      </section>

      <section className={`py-16 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="container-custom">
          <div className="grid md:grid-cols-4 gap-6">
            {helpCategories.map((category, index) => (
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
                  <category.icon className="w-7 h-7 text-amber-500" />
                </div>
                <h3 className={`font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>{category.title}</h3>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{category.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className={`py-24 ${isDark ? 'bg-gray-950' : 'bg-white'}`}>
        <div className="container-custom">
          <h2 className={`text-3xl font-display font-bold text-center mb-12 ${isDark ? 'text-white' : 'text-gray-800'}`}>
            Frequently Asked Questions
          </h2>

          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-6 rounded-2xl transition-all duration-300 cursor-pointer ${
                  isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:shadow-xl'
                }`}
                onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
              >
                <div className="flex items-center justify-between">
                  <h3 className={`font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                    {faq.question}
                  </h3>
                  {expandedFaq === index ? (
                    <ChevronUp className="w-5 h-5 text-amber-500" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-amber-500" />
                  )}
                </div>
                {expandedFaq === index && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-4 pt-4 border-t border-gray-200/20"
                  >
                    <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                      {faq.answer}
                    </p>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className={`py-16 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <h2 className={`text-2xl font-display font-bold text-center mb-8 ${isDark ? 'text-white' : 'text-gray-800'}`}>
              Still Need Help?
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className={`p-6 rounded-2xl text-center ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-4">
                  <Phone className="w-6 h-6 text-blue-500" />
                </div>
                <h3 className={`font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>Call Us</h3>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>+233 55 123 4567</p>
                <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>24/7 Available</p>
              </div>

              <div className={`p-6 rounded-2xl text-center ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-6 h-6 text-green-500" />
                </div>
                <h3 className={`font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>Email Us</h3>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>support@alveovita.com</p>
                <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Response within 24h</p>
              </div>

              <div className={`p-6 rounded-2xl text-center ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="w-6 h-6 text-amber-500" />
                </div>
                <h3 className={`font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>Live Chat</h3>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Chat with our team</p>
                <button className="mt-2 px-4 py-1.5 bg-amber-500 text-white rounded-full text-sm font-medium hover:bg-amber-600 transition-all">
                  Start Chat
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default Help