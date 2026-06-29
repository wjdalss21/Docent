'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { useThemeStore } from '@/stores/themeStore'
import styles from './Intro.module.scss'

const LOGO_SRC = {
  light: '/muse_logo_horizontal.svg',
  dark: '/muse_logo_horizontal_white.svg',
}

interface Props {
  onDismiss: () => void
}

export default function Intro({ onDismiss }: Props) {
  const { theme, toggleTheme } = useThemeStore()

  return (
    <motion.div
      className={styles.container}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.5 }}
      onClick={onDismiss}
    >
      <motion.div
        className={styles.content}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
      >
        <Image src={LOGO_SRC[theme]} alt="MUSE" width={140} height={50} priority />
        <p className={styles.label}>AI 도슨트</p>
        <h1 className={styles.title}>
          작품 앞에서<br />
          새로운 시선을<br />
          만나다
        </h1>
        <p className={styles.description}>
          원하는 관점과 톤으로<br />
          나만의 해설을 경험하세요
        </p>
      </motion.div>

      <motion.div
        className={styles.themeToggleWrapper}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.6 }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className={styles.themeToggle}
          onClick={toggleTheme}
          aria-label="테마 전환"
        >
          <span className={`${styles.toggleOption} ${theme === 'light' ? styles.active : ''}`}>
            Light
          </span>
          <span className={`${styles.toggleOption} ${theme === 'dark' ? styles.active : ''}`}>
            Dark
          </span>
          <span
            className={styles.toggleThumb}
            style={{ transform: theme === 'dark' ? 'translateX(100%)' : 'translateX(0)' }}
          />
        </button>
      </motion.div>

      <motion.p
        className={styles.hint}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.6 }}
      >
        화면을 터치하여 시작
      </motion.p>
    </motion.div>
  )
}
