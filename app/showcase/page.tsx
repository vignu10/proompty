'use client'

import Scene from '@/app/components/r3f/Scene'
import Section, { AnimatedText } from '@/app/components/Section'
import Link from 'next/link'
import { motion } from 'framer-motion'

export default function ShowcasePage() {
  return (
    <main className="relative w-full bg-[#0a0a0a]">
      {/* 3D Scene Background */}
      <Scene />

      {/* Hero Section */}
      <Section className="h-screen">
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="mb-6"
          >
            <span className="inline-block px-4 py-2 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-300 text-sm font-medium tracking-wider uppercase">
              Welcome to the future
            </span>
          </motion.div>
          <motion.h1
            className="text-6xl md:text-8xl font-bold text-white mb-6 tracking-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.7 }}
          >
            Scroll to Explore
          </motion.h1>
          <motion.p
            className="text-xl text-gray-400 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.9 }}
          >
            An immersive experience blending WebGL 3D with smooth scroll interactions
          </motion.p>
        </div>
      </Section>

      {/* About Section */}
      <Section className="bg-gradient-to-b from-transparent to-black/50">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="text-center"
          >
            <h2 className="text-5xl md:text-7xl font-bold text-white mb-8">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
                Creative Technology
              </span>
            </h2>
            <p className="text-xl text-gray-300 leading-relaxed mb-12">
              We push the boundaries of web experiences, combining cutting-edge 3D graphics
              with performant, accessible interfaces. Every scroll reveals something new.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
              {[
                { title: '3D Experiences', desc: 'Immersive WebGL environments' },
                { title: 'Smooth Motion', desc: 'Buttery scroll animations' },
                { title: 'Performance', desc: '60fps guaranteed' },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                  className="p-6 rounded-2xl border border-purple-500/20 bg-purple-500/5 backdrop-blur-sm"
                >
                  <h3 className="text-2xl font-bold text-white mb-3">{item.title}</h3>
                  <p className="text-gray-400">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </Section>

      {/* Features Section */}
      <Section>
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Built for the Modern Web
            </h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                title: 'React Three Fiber',
                desc: 'Declarative 3D in React',
                icon: '🎨',
              },
              {
                title: 'GSAP Animation',
                desc: 'Industry-standard motion',
                icon: '⚡',
              },
              {
                title: 'Lenis Scroll',
                desc: 'Smooth inertial scrolling',
                icon: '📜',
              },
              {
                title: 'Next.js 14',
                desc: 'React framework for production',
                icon: '⚛️',
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: i % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: i * 0.1 }}
                className="group p-8 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md hover:border-purple-500/50 transition-all duration-300 hover:bg-white/10"
              >
                <div className="text-5xl mb-4">{item.icon}</div>
                <h3 className="text-2xl font-bold text-white mb-2">{item.title}</h3>
                <p className="text-gray-400">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* CTA Section */}
      <Section className="bg-gradient-to-t from-purple-900/20 to-transparent">
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-5xl md:text-7xl font-bold text-white mb-8">
              Ready to Create?
            </h2>
            <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
              Let's build something extraordinary together
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-full hover:from-purple-700 hover:to-pink-700 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/25"
            >
              Get Started
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </motion.div>
        </div>
      </Section>

      {/* Floating Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity, delay: 1 }}
        className="fixed bottom-8 left-1/2 -translate-x-1/2 z-20"
      >
        <div className="w-6 h-10 rounded-full border-2 border-white/30 flex items-start justify-center p-2">
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-1.5 h-1.5 bg-white rounded-full"
          />
        </div>
      </motion.div>
    </main>
  )
}
