import type { Metadata } from 'next'
import '@/styles/globals.scss'
import QueryProvider from '@/components/QueryProvider'
import ThemeProvider from '@/components/ThemeProvider'

export const metadata: Metadata = {
  title: 'MUSE - AI 도슨트 플랫폼',
  description: '국립현대미술관 작품을 AI가 개인화된 해설로 안내합니다',
  icons: {
    icon: '/muse_logo_symbol.svg',
    apple: '/muse_logo_symbol.svg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body>
        <QueryProvider>
          <ThemeProvider>{children}</ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  )
}
