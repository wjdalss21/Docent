'use client'

import { useState } from 'react'
import { useArtworks } from '@/hooks/useArtworks'
import ArtworkCard from '@/components/ArtworkCard'
import styles from './ArtworkGrid.module.scss'

export default function ArtworkGrid() {
  const [query, setQuery] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const { data: artworks, isLoading, isError } = useArtworks()

  const filtered = artworks?.filter((artwork) => {
    const q = query.toLowerCase()
    return (
      artwork.title.toLowerCase().includes(q) ||
      (artwork.artists?.name ?? '').toLowerCase().includes(q)
    )
  }) ?? []

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.heading}>주요 작품</h1>
        <button
          className={styles.searchBtn}
          onClick={() => setShowSearch((prev) => !prev)}
          aria-label="검색"
        >
          🔍
        </button>
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

      {isLoading && (
        <div className={styles.status}>작품을 불러오는 중...</div>
      )}

      {isError && (
        <div className={styles.status}>작품을 불러오지 못했습니다.</div>
      )}

      {!isLoading && !isError && filtered.length === 0 && (
        <div className={styles.status}>검색 결과가 없습니다.</div>
      )}

      <div className={styles.list}>
        {filtered.map((artwork) => (
          <ArtworkCard key={artwork.id} artwork={artwork} />
        ))}
      </div>
    </div>
  )
}
