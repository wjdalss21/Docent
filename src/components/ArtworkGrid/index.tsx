'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'
import { useArtworks } from '@/hooks/useArtworks'
import ArtworkCard from '@/components/ArtworkCard'
import QrScannerModal from '@/components/QrScannerModal'
import styles from './ArtworkGrid.module.scss'

export default function ArtworkGrid() {
  const [query, setQuery] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [showQr, setShowQr] = useState(false)
  const searchParams = useSearchParams()

  useEffect(() => {
    if (searchParams.get('qr') === '1') {
      setShowQr(true)
    }
  }, [searchParams])
  const { data: artworks, isLoading, isError } = useArtworks()

  const filtered =
    artworks?.filter((artwork) => {
      const q = query.toLowerCase()
      return (
        artwork.title.toLowerCase().includes(q) ||
        (artwork.artists?.name ?? '').toLowerCase().includes(q)
      )
    }) ?? []

  return (
    <div className={styles.container}>
      {/* 로고 */}
      <div className={styles.logoWrapper}>
        <Image
          src="/muse_logo_horizontal.svg"
          alt="뮤즈"
          width={100}
          height={36}
          priority
        />
      </div>

      {/* 헤더 */}
      <header className={styles.header}>
        <h1 className={styles.heading}>주요 작품</h1>
        <div className={styles.actions}>
          <button
            className={styles.iconBtn}
            onClick={() => setShowQr(true)}
            aria-label="QR 스캔"
          >
            <QrIcon />
          </button>
          <button
            className={styles.iconBtn}
            onClick={() => setShowSearch((prev) => !prev)}
            aria-label="검색"
          >
            🔍
          </button>
        </div>
      </header>

      {showSearch && (
        <input
          className={styles.search}
          type="text"
          placeholder="작품명 또는 작가명 검색"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />
      )}

      {isLoading && <div className={styles.status}>작품을 불러오는 중...</div>}
      {isError && <div className={styles.status}>작품을 불러오지 못했습니다.</div>}
      {!isLoading && !isError && filtered.length === 0 && (
        <div className={styles.status}>검색 결과가 없습니다.</div>
      )}

      <div className={styles.list}>
        {filtered.map((artwork) => (
          <ArtworkCard key={artwork.id} artwork={artwork} />
        ))}
      </div>

      {showQr && <QrScannerModal onClose={() => setShowQr(false)} />}
    </div>
  )
}

function QrIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="5" y="5" width="3" height="3" fill="currentColor" stroke="none" />
      <rect x="16" y="5" width="3" height="3" fill="currentColor" stroke="none" />
      <rect x="5" y="16" width="3" height="3" fill="currentColor" stroke="none" />
      <path d="M14 14h2v2h-2z M18 14h3 M18 18h3 M14 18v3" />
    </svg>
  )
}
