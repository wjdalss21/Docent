'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import ReactMarkdown from 'react-markdown'
import { useDocentStore } from '@/stores/docentStore'
import { ATTRIBUTE_DISPLAY } from '@/lib/prompts'
import type { Artwork, Attribute } from '@/types'
import styles from './ArtworkDetail.module.scss'

interface Props {
  artwork: Artwork
}

const ATTRIBUTE_TABS: { attr: Attribute; label: string }[] = [
  { attr: 'background', label: '작품 배경' },
  { attr: 'meaning', label: '작품 의미·상징' },
  { attr: 'relation', label: '작품 관계성' },
]

interface ChatMsg {
  role: 'user' | 'assistant'
  content: string
}

export default function ArtworkDetailClient({ artwork }: Props) {
  const router = useRouter()
  const { attribute, tone, level, setAttribute, resetSession } = useDocentStore()

  const [docentContent, setDocentContent] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [chatMessages, setChatMessages] = useState<ChatMsg[]>([])
  const [chatInput, setChatInput] = useState('')
  const [isChatLoading, setIsChatLoading] = useState(false)

  const abortRef = useRef<AbortController | null>(null)
  const chatAbortRef = useRef<AbortController | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  // tone 미선택 시 톤 선택 페이지로 리다이렉트
  useEffect(() => {
    if (tone === null) {
      router.replace(`/artwork/${artwork.id}/tone`)
    }
  }, [tone, router, artwork.id])

  // 채팅 메시지 추가될 때 스크롤
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages, docentContent])

  const fetchDocent = useCallback(
    async (attr: Attribute) => {
      abortRef.current?.abort()
      const controller = new AbortController()
      abortRef.current = controller

      setDocentContent('')
      setIsStreaming(true)
      setChatMessages([])

      try {
        const res = await fetch('/api/docent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ artwork_id: artwork.id, attribute: attr, tone, level }),
          signal: controller.signal,
        })

        if (!res.ok) throw new Error('fetch failed')
        if (!res.body) throw new Error('no body')

        const reader = res.body.getReader()
        const decoder = new TextDecoder()
        let full = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          full += decoder.decode(value, { stream: true })
          setDocentContent(full)
        }
      } catch (e) {
        if ((e as Error).name !== 'AbortError') {
          setDocentContent('해설을 불러오는 중 오류가 발생했습니다.')
        }
      } finally {
        if (abortRef.current === controller) {
          setIsStreaming(false)
        }
      }
    },
    [artwork.id, tone, level],
  )

  const handleAttributeSelect = (attr: Attribute) => {
    if (attr === attribute && docentContent) return
    chatAbortRef.current?.abort()
    setIsChatLoading(false)
    setAttribute(attr)
    fetchDocent(attr)
  }

  const handleChatSubmit = async () => {
    const question = chatInput.trim()
    if (!question || !attribute || !tone || isChatLoading) return

    chatAbortRef.current?.abort()
    const controller = new AbortController()
    chatAbortRef.current = controller

    setChatInput('')
    setChatMessages((prev) => [...prev, { role: 'user', content: question }])
    setIsChatLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          artworkTitle: artwork.title,
          artistName: artwork.artists?.name ?? '알 수 없음',
          description: artwork.description ?? '',
          attribute,
          tone,
          level,
          docentContent,
          chatHistory: chatMessages,
          question,
        }),
        signal: controller.signal,
      })

      if (!res.ok) throw new Error('chat fetch failed')
      if (!res.body) throw new Error('no body')

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let answer = ''

      setChatMessages((prev) => [...prev, { role: 'assistant', content: '' }])

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        answer += decoder.decode(value, { stream: true })
        setChatMessages((prev) => {
          const updated = [...prev]
          updated[updated.length - 1] = { role: 'assistant', content: answer }
          return updated
        })
      }
    } catch (e) {
      if ((e as Error).name !== 'AbortError') {
        setChatMessages((prev) => [...prev, { role: 'assistant', content: '오류가 발생했습니다.' }])
      }
    } finally {
      if (chatAbortRef.current === controller) {
        setIsChatLoading(false)
      }
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleChatSubmit()
    }
  }

  const artistName = artwork.artists?.name ?? '작가 미상'

  return (
    <div className={styles.page}>
      {/* 헤더 */}
      <header className={styles.header}>
        <Link
          href="/"
          className={styles.logoLink}
          onClick={() => resetSession()}
          aria-label="홈으로"
        >
          <Image src="/muse_logo_horizontal.svg" alt="MUSE" width={72} height={26} priority />
        </Link>
        <button
          onClick={() => {
            resetSession()
            router.push('/')
          }}
          className={styles.consultBtn}
        >
          다른 상담하기
        </button>
      </header>

      {/* 스크롤 영역 */}
      <div className={styles.scrollContent}>
        {/* 작품 정보 */}
        <div className={styles.artworkInfo}>
          <h1 className={styles.artworkTitle}>
            {artwork.title} <span>{artistName}</span>
          </h1>
        </div>

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

        {/* 도슨트 영역 */}
        <div className={styles.docentSection}>
          {!attribute ? (
            <div className={styles.docentPrompt}>
              <span className={styles.botIcon}>💬</span>
              <p className={styles.promptText}>
                원하시는 설명 속성을<br />선택해주세요
              </p>
            </div>
          ) : (
            <div className={styles.docentResult}>
              <div className={styles.attributeTitle}>
                <span className={styles.botIcon}>💬</span>
                <h2>{ATTRIBUTE_DISPLAY[attribute]}</h2>
              </div>
              <div className={styles.divider} />
              <div className={styles.content}>
                {docentContent ? (
                  <ReactMarkdown>{docentContent}</ReactMarkdown>
                ) : isStreaming ? (
                  <span className={styles.cursor} />
                ) : null}
              </div>
            </div>
          )}

          {/* 채팅 메시지 */}
          {chatMessages.length > 0 && (
            <div className={styles.chatMessages}>
              {chatMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`${styles.chatBubble} ${msg.role === 'user' ? styles.user : styles.assistant}`}
                >
                  {msg.content || (isChatLoading && msg.role === 'assistant' ? '...' : '')}
                </div>
              ))}
            </div>
          )}
        </div>

        <div ref={bottomRef} />
      </div>

      {/* 하단 고정 영역 */}
      <div className={styles.bottomBar}>
        {/* 속성 탭 */}
        <div className={styles.attributeTabs}>
          {ATTRIBUTE_TABS.map(({ attr, label }) => (
            <button
              key={attr}
              className={`${styles.tabBtn} ${attribute === attr ? styles.active : ''}`}
              onClick={() => handleAttributeSelect(attr)}
            >
              {label}
            </button>
          ))}
        </div>

        {/* 채팅 입력 */}
        <div className={styles.chatInputArea}>
          <input
            className={styles.chatInput}
            type="text"
            placeholder="메시지를 입력하세요."
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={!attribute || isStreaming}
          />
          <button
            className={styles.submitBtn}
            onClick={handleChatSubmit}
            disabled={!chatInput.trim() || !attribute || isStreaming || isChatLoading}
            aria-label="전송"
          >
            💬
          </button>
        </div>
      </div>
    </div>
  )
}
