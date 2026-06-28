'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import type { Artwork } from '@/types'
import styles from './QrConfirm.module.scss'

interface Props {
  artwork: Artwork
}

export default function QrConfirmClient({ artwork }: Props) {
  const router = useRouter()
  const artistName = artwork.artists?.name ?? '작가 미상'

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <button onClick={() => router.push('/?qr=1')} className={styles.backBtn}>
          ‹
        </button>
      </header>

      <div className={styles.content}>
        {artwork.image_url && (
          <div className={styles.imageWrapper}>
            <Image
              src={artwork.image_url}
              alt={artwork.title}
              fill
              sizes="430px"
              className={styles.image}
              priority
            />
          </div>
        )}

        <div className={styles.info}>
          <h1 className={styles.title}>{artwork.title}</h1>
          <p className={styles.artist}>{artistName}</p>
        </div>

        <p className={styles.question}>이 작품이 맞으세요?</p>

        <div className={styles.actions}>
          <button
            className={styles.confirmBtn}
            onClick={() => router.push(`/artwork/${artwork.id}/tone`)}
          >
            확인
          </button>
          <button
            className={styles.rescanBtn}
            onClick={() => router.push('/?qr=1')}
          >
            다시 찍기
          </button>
          <button
            className={styles.cancelBtn}
            onClick={() => router.push('/')}
          >
            취소하기
          </button>
        </div>
      </div>
    </div>
  )
}
