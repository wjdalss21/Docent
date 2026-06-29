'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import Intro from '@/components/Intro'
import ArtworkGrid from '@/components/ArtworkGrid'

function HomeContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [showIntro, setShowIntro] = useState(() => searchParams.get('qr') !== '1')

  const handleLogoClick = () => {
    setShowIntro(true)
    router.replace('/')
  }

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
            <ArtworkGrid onLogoClick={handleLogoClick} />
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
