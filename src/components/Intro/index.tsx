'use client'

import { motion } from 'framer-motion'
import styles from './Intro.module.scss'

interface Props {
  onDismiss: () => void
}

export default function Intro({ onDismiss }: Props) {
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
