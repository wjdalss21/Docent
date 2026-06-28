'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'
import type QrScannerType from 'qr-scanner'
import styles from './QrScannerModal.module.scss'

interface Props {
  onClose: () => void
}

export default function QrScannerModal({ onClose }: Props) {
  const router = useRouter()
  const videoRef = useRef<HTMLVideoElement>(null)
  const scannerRef = useRef<InstanceType<typeof QrScannerType> | null>(null)
  const [cameraError, setCameraError] = useState<string | null>(null)

  const handleResult = useCallback(
    (data: string) => {
      try {
        const url = new URL(data)
        const match = url.pathname.match(/\/artwork\/([^/]+)/)
        if (match) {
          scannerRef.current?.stop()
          onClose()
          router.push(`/artwork/${match[1]}/qr`)
        }
      } catch {
        // QR 코드가 유효한 작품 URL이 아닌 경우 무시
      }
    },
    [router, onClose],
  )

  useEffect(() => {
    if (!videoRef.current) return

    import('qr-scanner').then(({ default: QrScanner }) => {
      if (!videoRef.current) return

      QrScanner.WORKER_PATH = '/qr-scanner-worker.min.js'

      const scanner = new QrScanner(
        videoRef.current,
        (result) => handleResult(result.data),
        {
          highlightScanRegion: true,
          highlightCodeOutline: true,
          preferredCamera: 'environment',
        },
      )

      scanner.start().catch(() => {
        setCameraError('카메라에 접근할 수 없습니다. 권한을 확인해주세요.')
      })
      scannerRef.current = scanner
    })

    return () => {
      scannerRef.current?.destroy()
    }
  }, [handleResult])

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose} aria-label="닫기">
          ✕
        </button>
        <p className={styles.instruction}>작품 옆 QR 코드를 스캔하세요</p>
        {cameraError ? (
          <div className={styles.errorWrapper}>
            <p className={styles.errorMsg}>{cameraError}</p>
            <button className={styles.retryBtn} onClick={onClose}>닫기</button>
          </div>
        ) : (
          <div className={styles.videoWrapper}>
            <video ref={videoRef} className={styles.video} />
          </div>
        )}
        {!cameraError && <p className={styles.hint}>카메라를 QR 코드에 가까이 대주세요</p>}
      </div>
    </div>
  )
}
