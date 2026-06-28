'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useDocentStore } from '@/stores/docentStore'
import type { Tone, Level } from '@/types'
import styles from './TonePage.module.scss'

const TONE_CARDS: { tone: Tone; label: string; sublabel: string; bg: string; bgPosition?: string }[] = [
  { tone: 'formal', label: '정식적·해설형', sublabel: 'Formal / Academic Tone', bg: 'url(/정식형.jpg)' },
  { tone: 'humorous', label: '유머러스·친근형', sublabel: 'Humorous / Conversational Tone', bg: 'url(/유머러스.jpg)' },
  { tone: 'child', label: '어린이 맞춤형', sublabel: 'Child-friendly Tone', bg: 'url(/어린이2.jpg)', bgPosition: 'center bottom' },
  { tone: 'reflective', label: '철학적·사색형', sublabel: 'Reflective / Meditative Tone', bg: 'url(/철학3.jpg)', bgPosition: 'center top' },
]

const LEVELS: { level: Level; label: string }[] = [
  { level: 'beginner', label: '입문자' },
  { level: 'normal', label: '일반' },
  { level: 'expert', label: '전문가' },
]

export default function TonePage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const { setTone, setLevel, resetSession } = useDocentStore()
  const [selectedTone, setSelectedTone] = useState<Tone | null>(null)
  const [levelIndex, setLevelIndex] = useState(1)

  const handleStart = () => {
    if (!selectedTone) return
    resetSession()
    setTone(selectedTone)
    setLevel(LEVELS[levelIndex].level)
    router.push(`/artwork/${id}`)
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <button onClick={() => router.back()} className={styles.backBtn}>‹</button>
      </header>

      <div className={styles.content}>
        <h1 className={styles.title}>
          톤앤매너
          <br />
          <span className={styles.subtitle}>(tone & manner)</span>
        </h1>

        <div className={styles.cards}>
          {TONE_CARDS.map(({ tone, label, sublabel, bg, bgPosition }) => (
            <button
              key={tone}
              className={`${styles.card} ${selectedTone === tone ? styles.selected : ''}`}
              onClick={() => setSelectedTone(tone)}
            >
              <div className={styles.cardBg} style={{ background: bg, backgroundSize: 'cover', backgroundPosition: bgPosition ?? 'center' }} />
              <div className={styles.cardOverlay} />
              <div className={styles.cardText}>
                <p className={styles.cardLabel}>{label}</p>
                <p className={styles.cardSublabel}>({sublabel})</p>
              </div>
            </button>
          ))}
        </div>

        <div className={styles.levelSection}>
          <p className={styles.levelTitle}>이해수준 선택</p>
          <div className={styles.sliderWrapper}>
            <input
              type="range"
              min={0}
              max={2}
              step={1}
              value={levelIndex}
              onChange={(e) => setLevelIndex(parseInt(e.target.value))}
              className={styles.slider}
            />
            <div className={styles.levelLabels}>
              {LEVELS.map(({ label }) => (
                <span key={label}>{label}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className={styles.footer}>
        <button
          className={`${styles.startBtn} ${selectedTone ? styles.active : ''}`}
          onClick={handleStart}
          disabled={!selectedTone}
        >
          도슨트 시작하기
        </button>
      </div>
    </div>
  )
}
