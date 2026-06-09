import { motion } from 'framer-motion'

// Transition/loading animation: the Incident IRA logo assembling itself — the
// report document draws in first, then the amber warning triangle pops in. Loops
// while loading. Pure SVG + framer-motion (no raster assets).
const DUR = 2.4
const DOC_TIMES = [0, 0.16, 0.86, 0.94, 1]
const TRI_TIMES = [0, 0.34, 0.52, 0.94, 1]

export default function IncidentLoader({ size = 160 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" role="img" aria-label="Loading">
      {/* Document — appears first */}
      <motion.g
        style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: [0, 1, 1, 1, 0], scale: [0.8, 1, 1, 1, 0.96] }}
        transition={{ duration: DUR, times: DOC_TIMES, repeat: Infinity, repeatDelay: 0.2, ease: 'easeInOut' }}
      >
        <path
          d="M12 6 H27 L34 13 V39 A3 3 0 0 1 31 42 H12 A3 3 0 0 1 9 39 V9 A3 3 0 0 1 12 6 Z"
          fill="#f5efe6" stroke="#5d4037" strokeWidth="2.4" strokeLinejoin="round"
        />
        <path d="M27 6 V13 H34" fill="none" stroke="#5d4037" strokeWidth="2.4" strokeLinejoin="round" />
        <rect x="13.3" y="17.4" width="3.6" height="3.6" rx="0.9" fill="#f4b740" />
        <rect x="19" y="18" width="9.5" height="2.2" rx="1.1" fill="#5d4037" />
        <rect x="13.3" y="23.4" width="3.6" height="3.6" rx="0.9" fill="#c0492f" />
        <rect x="19" y="24" width="9.5" height="2.2" rx="1.1" fill="#5d4037" />
        <rect x="13.3" y="29.8" width="11" height="2.2" rx="1.1" fill="#5d4037" />
      </motion.g>

      {/* Warning triangle — pops in after the document, with a slight overshoot */}
      <motion.g
        style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
        initial={{ opacity: 0, scale: 0.3 }}
        animate={{ opacity: [0, 0, 1, 1, 0], scale: [0.3, 0.3, 1, 1, 0.92] }}
        transition={{ duration: DUR, times: TRI_TIMES, repeat: Infinity, repeatDelay: 0.2, ease: [0.34, 1.56, 0.64, 1] }}
      >
        <path
          d="M33 23.6 L44 41.4 A1.8 1.8 0 0 1 42.4 44 H23.6 A1.8 1.8 0 0 1 22 41.4 Z"
          fill="#f4a93a" stroke="#5d4037" strokeWidth="2.4" strokeLinejoin="round"
        />
        <rect x="31.7" y="30.4" width="2.6" height="6.2" rx="1.3" fill="#4e342e" />
        <circle cx="33" cy="40.2" r="1.55" fill="#4e342e" />
      </motion.g>
    </svg>
  )
}
