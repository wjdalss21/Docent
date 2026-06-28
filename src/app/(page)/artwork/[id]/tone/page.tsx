'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useDocentStore } from '@/stores/docentStore'
import type { Tone, Level } from '@/types'
import styles from './TonePage.module.scss'

const TONE_CARDS: { tone: Tone; label: string; sublabel: string; example: string }[] = [
  {
    tone: 'formal',
    label: '정식적·해설형',
    sublabel: 'Formal / Academic Tone',
    example:
      '"이 작품은 작가의 내면적 기억을 시각 언어로 재구성한 결과물로, 색채와 구도의 대비를 통해 시간의 흐름을 표현하고 있습니다."',
  },
  {
    tone: 'humorous',
    label: '유머러스·친근형',
    sublabel: 'Humorous / Conversational Tone',
    example:
      '"솔직히 처음엔 그냥 낙서인가 싶었는데 알고 보니 엄청난 의미가 숨어있더라고. 작가 은근 깊은 사람이에요!"',
  },
  {
    tone: 'child',
    label: '어린이 맞춤형',
    sublabel: 'Child-friendly Tone',
    example: '"이 그림 속엔 작가 아저씨의 소중한 추억이 숨어있대! 마치 기억들을 별에 담아둔 것처럼 말이야!"',
  },
  {
    tone: 'reflective',
    label: '철학적·사색형',
    sublabel: 'Reflective / Meditative Tone',
    example: '"우리는 얼마나 많은 기억을 지나쳐 왔을까요? 작가는 그 물음을 색채로 조용히 건넵니다."',
  },
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
          {TONE_CARDS.map(({ tone, label, sublabel, example }) => (
            <button
              key={tone}
              className={`${styles.card} ${selectedTone === tone ? styles.selected : ''}`}
              onClick={() => setSelectedTone(tone)}
            >
              <p className={styles.cardLabel}>{label}</p>
              <p className={styles.cardSublabel}>({sublabel})</p>
              <p className={styles.cardExample}>{example}</p>
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
