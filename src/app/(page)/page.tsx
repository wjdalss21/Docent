'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Intro from '@/components/Intro'
import ArtworkGrid from '@/components/ArtworkGrid'

export default function HomePage() {
  const [showIntro, setShowIntro] = useState(true)

  return (
    <>
      <AnimatePresence>
        {showIntro && (
          <Intro onDismiss={() => setShowIntro(false)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {!showIntro && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <ArtworkGrid />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
