import type { Metadata } from 'next'
import '@/styles/globals.scss'
import QueryProvider from '@/components/QueryProvider'

export const metadata: Metadata = {
  title: 'AI 도슨트',
  description: '국립현대미술관 작품을 AI가 개인화된 해설로 안내합니다',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  )
}
