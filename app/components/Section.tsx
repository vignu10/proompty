'use client'

import { useRef, useEffect } from 'react'
import { useInView } from 'framer-motion'
import { motion } from 'framer-motion'

interface SectionProps {
  children: React.ReactNode
  className?: string
  id?: string
}

const variants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0 },
}

export default function Section({ children, className = '', id }: SectionProps) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { amount: 0.3, once: true })

  return (
    <motion.section
      ref={ref}
      id={id}
      className={`relative z-10 min-h-screen flex items-center justify-center px-6 ${className}`}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={variants}
      transition={{ duration: 0.8, ease: [0.25, 0.4, 0.25, 1] }}
    >
      {children}
    </motion.section>
  )
}

export function AnimatedText({
  text,
  className = '',
  delay = 0,
}: {
  text: string
  className?: string
  delay?: number
}) {
  const words = text.split(' ')

  return (
    <div className={`flex flex-wrap ${className}`}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          className="mr-3 inline-block"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{
            duration: 0.6,
            delay: delay + i * 0.05,
            ease: [0.25, 0.4, 0.25, 1],
          }}
        >
          {word}
        </motion.span>
      ))}
    </div>
  )
}
