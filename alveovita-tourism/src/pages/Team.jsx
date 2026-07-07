// src/pages/Team.jsx
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import Navbar from '../components/common/Navbar'
import Footer from '../components/common/Footer'
import { Users, Award, Target, Mail } from 'lucide-react'

// Custom social icons (lucide-react doesn't export these)
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

const Team = () => {
  const { isDark } = useTheme()

  const teamMembers = [
    {
      name: 'Dr. Kwame Nkrumah',
      role: 'Founder & CEO',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
      bio: 'Visionary leader with 15+ years in healthcare and wellness tourism.',
      expertise: ['Healthcare Management', 'Wellness Tourism', 'Strategic Planning'],
      social: { linkedin: '#', twitter: '#' }
    },
    {
      name: 'Maya Williams',
      role: 'Head of Wellness Programs',
      image: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&q=80',
      bio: 'Expert in holistic wellness with a background in psychology and therapeutic practices.',
      expertise: ['Holistic Health', 'Program Design', 'Mental Wellness'],
      social: { linkedin: '#', twitter: '#' }
    },
    {
      name: 'James Osei',
      role: 'Operations Director',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
      bio: 'Operations expert ensuring seamless travel and healthcare coordination.',
      expertise: ['Operations Management', 'Travel Logistics', 'Client Relations'],
      social: { linkedin: '#', twitter: '#' }
    },
    {
      name: 'Dr. Sarah Mensah',
      role: 'Medical Director',
      image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&q=80',
      bio: 'Leading medical excellence with a focus on preventive healthcare.',
      expertise: ['Preventive Medicine', 'Health Screening', 'Medical Tourism'],
      social: { linkedin: '#', twitter: '#' }
    },
    {
      name: 'David Appiah',
      role: 'Marketing Director',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80',
      bio: 'Creative marketing professional driving brand awareness and growth.',
      expertise: ['Digital Marketing', 'Brand Strategy', 'Content Creation'],
      social: { linkedin: '#', twitter: '#' }
    },
    {
      name: 'Grace Asante',
      role: 'Customer Experience Manager',
      image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&q=80',
      bio: 'Passionate about delivering exceptional customer experiences.',
      expertise: ['Customer Service', 'Client Relations', 'Experience Design'],
      social: { linkedin: '#', twitter: '#' }
    }
  ]

  const advisors = [
    {
      name: 'Prof. John Doe',
      role: 'Medical Advisor',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
      bio: 'Professor of Public Health with expertise in global health systems.'
    },
    {
      name: 'Dr. Jane Smith',
      role: 'Wellness Advisor',
      image: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&q=80',
      bio: 'Wellness expert specializing in holistic health and integrative medicine.'
    }
  ]

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-gray-950' : 'bg-white'}`}>
      <Navbar />

      {/* Hero Section */}
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
            <span className="text-amber-400 font-semibold text-sm uppercase tracking-wider">Our Team</span>
            <h1 className="text-5xl md:text-6xl font-display font-bold text-white mt-4 leading-tight">
              Meet the <span className="text-amber-400">Experts</span>
            </h1>
            <p className="text-xl text-gray-300 mt-4 leading-relaxed">
              Passionate professionals dedicated to transforming lives through wellness tourism.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Team Grid */}
      <section className={`py-24 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className={`text-3xl font-display font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
              Leadership Team
            </h2>
            <p className={`mt-2 max-w-2xl mx-auto ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Our team brings together diverse expertise to deliver exceptional wellness experiences.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-6 rounded-2xl transition-all duration-300 hover:scale-105 ${
                  isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:shadow-2xl'
                }`}
              >
                <div className="relative w-32 h-32 mx-auto mb-4">
                  <img 
                    src={member.image} 
                    alt={member.name}
                    className="w-full h-full rounded-full object-cover ring-4 ring-amber-400/30"
                  />
                </div>
                <h3 className={`text-xl font-bold text-center ${isDark ? 'text-white' : 'text-gray-800'}`}>
                  {member.name}
                </h3>
                <p className="text-amber-500 text-center font-medium">{member.role}</p>
                <p className={`text-sm text-center mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {member.bio}
                </p>
                <div className="flex flex-wrap justify-center gap-2 mt-3">
                  {member.expertise.map((skill, i) => (
                    <span key={i} className={`text-xs px-2 py-1 rounded-full ${
                      isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {skill}
                    </span>
                  ))}
                </div>
                <div className="flex justify-center gap-2 mt-4">
                  <a 
                    href={member.social.linkedin} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-amber-500 hover:text-white transition-all hover:scale-110"
                    aria-label={`${member.name} LinkedIn`}
                  >
                    <LinkedInIcon className="w-4 h-4" />
                  </a>
                  <a 
                    href={member.social.twitter} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-amber-500 hover:text-white transition-all hover:scale-110"
                    aria-label={`${member.name} Twitter`}
                  >
                    <TwitterIcon className="w-4 h-4" />
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Advisors Section */}
      <section className={`py-24 ${isDark ? 'bg-gray-950' : 'bg-white'}`}>
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className={`text-3xl font-display font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
              Our Advisors
            </h2>
            <p className={`mt-2 max-w-2xl mx-auto ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Guiding our vision with expertise and experience.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {advisors.map((advisor, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-6 rounded-2xl text-center transition-all duration-300 hover:scale-105 ${
                  isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:shadow-2xl'
                }`}
              >
                <div className="relative w-24 h-24 mx-auto mb-4">
                  <img 
                    src={advisor.image} 
                    alt={advisor.name}
                    className="w-full h-full rounded-full object-cover ring-4 ring-amber-400/20"
                  />
                </div>
                <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                  {advisor.name}
                </h3>
                <p className="text-amber-500 font-medium">{advisor.role}</p>
                <p className={`text-sm mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {advisor.bio}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Join Us CTA */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1920&q=80)'
        }}>
          <div className="absolute inset-0 bg-gradient-to-r from-amber-900/95 to-orange-800/95" />
        </div>
        <div className="container-custom relative z-10 text-center text-white">
          <h2 className="text-4xl font-display font-bold mb-4">
            Join Our <span className="text-amber-300">Team</span>
          </h2>
          <p className="text-xl text-gray-200 mb-8 max-w-2xl mx-auto">
            Be part of a mission to transform lives through wellness tourism.
          </p>
          <Link to="/careers">
            <button className="px-8 py-3 bg-white text-amber-700 rounded-full font-medium hover:bg-amber-50 transition-all shadow-xl hover:scale-105">
              View Careers
            </button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default Team