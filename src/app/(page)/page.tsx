'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import Intro from '@/components/Intro'
import ArtworkGrid from '@/components/ArtworkGrid'

function HomeContent() {
  const searchParams = useSearchParams()
  const [showIntro, setShowIntro] = useState(() => searchParams.get('qr') !== '1')

  return (
    <>
      <AnimatePresence>
        {showIntro && <Intro onDismiss={() => setShowIntro(false)} />}
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

export default function HomePage() {
  return (
    <Suspense>
      <HomeContent />
    </Suspense>
  )
}
