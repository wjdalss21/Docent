'use client'

import Link from 'next/link'
import type { Artwork } from '@/types'
import styles from './ArtworkCard.module.scss'

interface Props {
  artwork: Artwork
}

export default function ArtworkCard({ artwork }: Props) {
  return (
    <Link href={`/artwork/${artwork.id}/tone`} className={styles.card}>
      <div className={styles.imageWrapper}>
        <div className={styles.placeholder} />
      </div>
      <div className={styles.info}>
        <p className={styles.title}>{artwork.title}</p>
        <p className={styles.artist}>{artwork.artists?.name ?? '작가 미상'}</p>
        <p className={styles.badge}>AI 도슨트</p>
      </div>
    </Link>
  )
}
