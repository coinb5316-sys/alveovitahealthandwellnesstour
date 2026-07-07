// src/components/auth/AuthBackground.jsx
import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

const AuthBackground = () => {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let animationFrameId
    let particles = []
    let mouseX = null
    let mouseY = null

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    window.addEventListener('resize', resizeCanvas)
    resizeCanvas()

    // Mouse tracking for interactive particles
    const handleMouseMove = (e) => {
      mouseX = e.clientX
      mouseY = e.clientY
    }
    window.addEventListener('mousemove', handleMouseMove)

    // Particle class with enhanced features
    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width
        this.y = Math.random() * canvas.height
        this.size = Math.random() * 4 + 1
        this.speedX = (Math.random() - 0.5) * 0.8
        this.speedY = (Math.random() - 0.5) * 0.8
        this.opacity = Math.random() * 0.6 + 0.1
        this.color = `hsla(${Math.random() * 40 + 30}, 90%, 60%, `
        this.rotation = Math.random() * 360
        this.rotationSpeed = (Math.random() - 0.5) * 0.02
        this.pulse = Math.random() * Math.PI * 2
        this.pulseSpeed = 0.02 + Math.random() * 0.02
      }

      update() {
        this.x += this.speedX
        this.y += this.speedY
        this.rotation += this.rotationSpeed
        this.pulse += this.pulseSpeed

        // Mouse interaction
        if (mouseX !== null && mouseY !== null) {
          const dx = this.x - mouseX
          const dy = this.y - mouseY
          const distance = Math.sqrt(dx * dx + dy * dy)
          if (distance < 150) {
            const force = (150 - distance) / 150 * 0.5
            this.x += (dx / distance) * force
            this.y += (dy / distance) * force
          }
        }

        // Wrap around edges
        if (this.x > canvas.width) this.x = 0
        if (this.x < 0) this.x = canvas.width
        if (this.y > canvas.height) this.y = 0
        if (this.y < 0) this.y = canvas.height
      }

      draw(ctx) {
        const opacity = this.opacity * (0.8 + 0.2 * Math.sin(this.pulse))
        ctx.save()
        ctx.translate(this.x, this.y)
        ctx.rotate(this.rotation)

        // Glow effect
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.size * 3)
        gradient.addColorStop(0, this.color + opacity + ')')
        gradient.addColorStop(0.5, this.color + (opacity * 0.5) + ')')
        gradient.addColorStop(1, this.color + '0)')
        
        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(0, 0, this.size * 3, 0, Math.PI * 2)
        ctx.fill()

        // Core circle
        ctx.fillStyle = this.color + opacity + ')'
        ctx.beginPath()
        ctx.arc(0, 0, this.size, 0, Math.PI * 2)
        ctx.fill()

        ctx.restore()
      }
    }

    // Create particles with enhanced count
    const particleCount = Math.min(120, Math.floor((canvas.width * canvas.height) / 12000))
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle())
    }

    // Draw connecting lines with glow effect
    const drawLines = () => {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < 200) {
            const opacity = 0.15 * (1 - distance / 200)
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            
            // Gradient line
            const gradient = ctx.createLinearGradient(
              particles[i].x, particles[i].y,
              particles[j].x, particles[j].y
            )
            gradient.addColorStop(0, `rgba(251, 191, 36, ${opacity})`)
            gradient.addColorStop(0.5, `rgba(245, 158, 11, ${opacity * 1.5})`)
            gradient.addColorStop(1, `rgba(251, 191, 36, ${opacity})`)
            
            ctx.strokeStyle = gradient
            ctx.lineWidth = 0.8
            ctx.stroke()
          }
        }
      }
    }

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Animated gradient background
      const time = Date.now() * 0.0001
      const gradient = ctx.createRadialGradient(
        canvas.width * (0.5 + 0.3 * Math.sin(time)),
        canvas.height * (0.5 + 0.3 * Math.cos(time * 0.8)),
        0,
        canvas.width / 2,
        canvas.height / 2,
        Math.max(canvas.width, canvas.height) * 0.7
      )
      gradient.addColorStop(0, 'rgba(251, 191, 36, 0.12)')
      gradient.addColorStop(0.3, 'rgba(245, 158, 11, 0.08)')
      gradient.addColorStop(0.6, 'rgba(251, 191, 36, 0.04)')
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Update and draw particles
      particles.forEach(particle => {
        particle.update()
        particle.draw(ctx)
      })

      // Draw connecting lines
      drawLines()

      animationFrameId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      window.removeEventListener('mousemove', handleMouseMove)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return (
    <>
      {/* Floating Gradient Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-40 -right-40 w-96 h-96 bg-amber-400/20 rounded-full blur-3xl"
          animate={{
            x: [0, 60, -30, 0],
            y: [0, -40, 20, 0],
            scale: [1, 1.1, 0.9, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-96 h-96 bg-orange-400/20 rounded-full blur-3xl"
          animate={{
            x: [0, -50, 30, 0],
            y: [0, 40, -20, 0],
            scale: [1, 1.2, 0.8, 1],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-400/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 0.8, 1],
            x: ['-50%', '-40%', '-60%', '-50%'],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute top-1/4 right-1/4 w-64 h-64 bg-pink-400/10 rounded-full blur-3xl"
          animate={{
            x: [0, 40, -20, 0],
            y: [0, -30, 20, 0],
          }}
          transition={{
            duration: 35,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      {/* Animated Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50/40 via-white/20 to-amber-50/30 dark:from-gray-950/40 dark:via-gray-900/20 dark:to-amber-950/30 pointer-events-none" />

      {/* Particle Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />

      {/* Subtle Grid Pattern */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.02] dark:opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }}
      />
    </>
  )
}

export default AuthBackground