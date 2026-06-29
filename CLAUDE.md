# CLAUDE.md — AI 도슨트 플랫폼

## 프로젝트 개요
관람객이 작품 앞에서 원하는 **속성(attribute)**과 **톤(tone)**을 선택하면 Gemini AI가 개인화된 해설을 생성하는 모바일 퍼스트 웹 서비스. 국립현대미술관 소장 작품 108개 기반. 기업 포트폴리오 제출용.

---

## 기술 스택
| 역할 | 기술 |
|------|------|
| 프레임워크 | Next.js 15 (App Router) |
| 언어 | TypeScript |
| 스타일 | SCSS Modules |
| 전역 상태 | Zustand |
| 서버 상태 | TanStack Query v5 |
| AI 스트리밍 | Vercel AI SDK (`ai` 패키지) |
| 애니메이션 | Framer Motion |
| DB / Storage | Supabase (PostgreSQL + Storage) |
| AI 모델 | Gemini 1.5 Flash |
| 배포 | Vercel |

---

## 환경변수 (.env.local)
```
NEXT_PUBLIC_SUPABASE_URL=https://afnmhrgbsqaaoclzflnn.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=
GEMINI_API_KEY=
```
`GEMINI_API_KEY`는 반드시 서버사이드(Route Handler)에서만 사용. 클라이언트 노출 금지.

---

## 페이지 구조
```
/                  → 작품 목록 (홈)
/artwork/[id]      → 작품 상세 + AI 도슨트
```

---

## DB 스키마 (Supabase)

### artists
```sql
id                uuid PK
name              text NOT NULL
profile_image_url text
created_at        timestamptz
```

### artworks
```sql
id          uuid PK
mmca_id     text UNIQUE NOT NULL
title       text NOT NULL
artist_id   uuid FK → artists.id
description text        -- Gemini 프롬프트 컨텍스트
image_url   text        -- Unsplash 대체 이미지 URL
source_url  text
created_at  timestamptz
```

### docent_cache
```sql
id          uuid PK
artwork_id  uuid FK → artworks.id ON DELETE CASCADE
attribute   text CHECK IN ('background','meaning','relation')
tone        text CHECK IN ('formal','humorous','child','reflective')
level       text CHECK IN ('beginner','normal','expert') NOT NULL DEFAULT 'normal'
content     text NOT NULL
created_at  timestamptz
UNIQUE (artwork_id, attribute, tone, level)
```

---

## 핵심 비즈니스 로직

### AI 해설 생성 흐름 (POST /api/docent)
```
1. (artwork_id, attribute, tone) 수신
2. docent_cache 조회
   - HIT  → content 즉시 반환 (Gemini 미호출)
   - MISS → artworks.description 조회
          → 프롬프트 구성
          → Gemini 스트리밍 호출
          → docent_cache에 저장
          → 클라이언트에 스트리밍 반환
```

### 속성 (attribute)
| 값 | 한국어 | 프롬프트 핵심 |
|----|--------|-------------|
| `background` | 작품 배경 | 시대적 맥락, 작가 생애, 사조 |
| `meaning` | 작품 의미·상징 | 제목 어원, 색채·구도의 상징 |
| `relation` | 작품 관계성 | 동시대 작가, 미술사적 위치 |

### 톤 (tone)
| 값 | 한국어 | 문체 |
|----|--------|------|
| `formal` | 정식적·해설형 | 존댓말, 학술적 어휘 |
| `humorous` | 유머러스·친근형 | 반말체 가능, 비유·농담 |
| `child` | 어린이 맞춤형 | 쉬운 단어, 짧은 문장 |
| `reflective` | 철학적·사색형 | 질문형 문장, 여백 있는 표현 |

---

## Gemini 프롬프트 템플릿
```
당신은 국립현대미술관의 AI 도슨트입니다.

[작품 정보]
- 작품명: {title}
- 작가: {artist_name}
- 작품 해설: {description}

[설명 속성]: {attribute_label}
[톤앤매너]: {tone_label}

아래 조건을 반드시 지켜 해설을 작성하세요:
- 분량: 200~300자 (한국어 기준)
- 관람객이 작품 앞에 서 있는 상황을 상상하며 작성
- 마지막 문장은 관람객이 더 궁금해질 만한 여운으로 마무리
- 전문 용어는 쉬운 말로 풀어서 설명
```

---

## TypeScript 타입
```typescript
interface Artist {
  id: string
  name: string
  profile_image_url: string | null
  created_at: string
}

interface Artwork {
  id: string
  mmca_id: string
  title: string
  artist_id: string
  description: string | null
  image_url: string | null
  source_url: string | null
  created_at: string
  artists?: Artist
}

type Attribute = 'background' | 'meaning' | 'relation'
type Tone = 'formal' | 'humorous' | 'child' | 'reflective'
```

---

## Zustand Store
```typescript
interface DocentStore {
  attribute: Attribute | null
  tone: Tone
  chatHistory: { role: 'user' | 'assistant'; content: string }[]
  setAttribute: (attr: Attribute) => void
  setTone: (tone: Tone) => void
  addChat: (msg: { role: 'user' | 'assistant'; content: string }) => void
  resetChat: () => void
}
```

---

## 디렉토리 구조
```
src/
├── app/
│   ├── page.tsx                  # 홈 — 작품 목록
│   ├── artwork/[id]/page.tsx     # 작품 상세 + AI 도슨트
│   └── api/docent/route.ts       # Gemini Route Handler
├── components/
│   ├── ArtworkCard/              # 홈 카드
│   ├── AttributeTabs/            # 속성 탭
│   ├── ToneSelector/             # 톤 선택 UI
│   ├── DocentContent/            # AI 해설 출력
│   └── ChatInput/                # 추가 질문 입력
├── stores/docentStore.ts
├── lib/
│   ├── supabase.ts
│   └── prompts.ts
├── types/index.ts
└── styles/
    ├── _variables.scss
    └── globals.scss
```

---

## 코딩 컨벤션
- 컴포넌트: PascalCase, 폴더 단위 (`ArtworkCard/index.tsx` + `ArtworkCard.module.scss`)
- Supabase 클라이언트: `lib/supabase.ts` 싱글턴으로 export
- Route Handler는 `app/api/`에만 위치
- 클라이언트에서 Gemini 직접 호출 금지

---

## 모바일 퍼스트
- 기준 너비: 375px
- 터치 영역: 최소 44×44px
- 하단 탭 바: `position: fixed; bottom: 0`

---

## MVP 체크리스트
- [ ] 홈 — 작품 카드 그리드 + 검색
- [ ] 작품 상세 — 이미지 + 속성 3탭
- [ ] Gemini 해설 스트리밍 출력
- [ ] 톤앤매너 4종 선택 + 재생성
- [ ] docent_cache 캐싱 로직
- [ ] 모바일 반응형 (375px)

## v2
- [ ] 멀티턴 채팅
- [ ] QR 직접 진입 (`/artwork/[id]?from=qr`)
