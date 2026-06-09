import { motion } from 'framer-motion'

/**
 * Themed full-screen loader: a shield emblem with a sweeping "radar" scan and
 * concentric pulse rings — an animated SVG (no raster assets), matching the
 * app's interactive-visual style.
 */
export default function IncidentLoader({ size = 160 }) {
  const c = size / 2
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" role="img" aria-label="Loading">
      <defs>
        <linearGradient id="il-shield" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#a1887f" />
          <stop offset="1" stopColor="#6d4c41" />
        </linearGradient>
        <radialGradient id="il-sweep" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#795548" stopOpacity="0.45" />
          <stop offset="1" stopColor="#795548" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* concentric pulse rings */}
      {[0, 1, 2].map((i) => (
        <motion.circle
          key={i}
          cx={c} cy={c} r="20"
          fill="none" stroke="#795548" strokeWidth="1.5"
          initial={{ scale: 0.4, opacity: 0.6 }}
          animate={{ scale: 2.1, opacity: 0 }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeOut', delay: i * 0.8 }}
          style={{ transformOrigin: '50px 50px' }}
        />
      ))}

      {/* rotating radar sweep */}
      <motion.g
        style={{ transformOrigin: '50px 50px' }}
        animate={{ rotate: 360 }}
        transition={{ duration: 2.2, repeat: Infinity, ease: 'linear' }}
      >
        <path d="M50 50 L50 8 A42 42 0 0 1 86 30 Z" fill="url(#il-sweep)" />
      </motion.g>

      {/* shield emblem */}
      <motion.g
        initial={{ scale: 0.9, opacity: 0.85 }}
        animate={{ scale: [0.92, 1, 0.92] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        style={{ transformOrigin: '50px 50px' }}
      >
        <path d="M50 30 L66 36 V52 c0 11-7 17-16 21 -9-4-16-10-16-21 V36 Z" fill="url(#il-shield)" />
        <path d="M43 51 l5 5 9-10" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      </motion.g>
    </svg>
  )
}
