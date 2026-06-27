# AI 도슨트 플랫폼 — ERD & 기술스택 정의서

> 작성일: 2026-06-27
> 작성자: 박정민
> 프로젝트: BERTopic 기반 속성 맞춤형 AI 도슨트 플랫폼

---

## 1. ERD (Entity Relationship Diagram)

### 1-1. 테이블 목록

| 테이블명 | 역할 |
|---------|------|
| `artists` | 작가 정보 |
| `artworks` | 작품 정보 |
| `docent_cache` | AI 해설 캐싱 (API 비용 절감) |

### 1-2. 테이블 상세

#### artists
| 컬럼명 | 타입 | 제약 | 설명 |
|--------|------|------|------|
| `id` | uuid | PK, DEFAULT gen_random_uuid() | 고유 식별자 |
| `name` | text | NOT NULL | 작가명 (ex. 이중섭) |
| `profile_image_url` | text | - | 작가 사진 URL (Supabase Storage, 수동 업로드) |
| `created_at` | timestamptz | DEFAULT now() | 생성일시 |

> 작가 소개(bio)는 `artworks.description` 앞부분에 이미 포함되어 있어 별도 저장 불필요. Gemini 프롬프트 구성 시 `description`만 컨텍스트로 사용.

#### artworks
| 컬럼명 | 타입 | 제약 | 설명 |
|--------|------|------|------|
| `id` | uuid | PK, DEFAULT gen_random_uuid() | 고유 식별자 |
| `mmca_id` | text | UNIQUE | 국립현대미술관 wrkMngNo (ex. 08447) |
| `title` | text | NOT NULL | 작품명 |
| `artist_id` | uuid | FK → artists.id | 작가 참조 |
| `description` | text | - | 작품 해설 원문 — Gemini 프롬프트 컨텍스트로 사용 |
| `image_url` | text | - | 작품 이미지 URL (Supabase Storage, 수동 업로드) |
| `source_url` | text | - | 국립현대미술관 원본 페이지 URL |
| `created_at` | timestamptz | DEFAULT now() | 생성일시 |

> `year`, `technique`, `material`, `dimensions`, `museum`은 API 응답에 포함되지 않거나 단일 기관으로 고정되어 제외

#### docent_cache
| 컬럼명 | 타입 | 제약 | 설명 |
|--------|------|------|------|
| `id` | uuid | PK, DEFAULT gen_random_uuid() | 고유 식별자 |
| `artwork_id` | uuid | FK → artworks.id, ON DELETE CASCADE | 작품 참조 |
| `attribute` | text | CHECK IN ('background','meaning','relation') | 선택 속성 |
| `tone` | text | CHECK IN ('formal','humorous','child','reflective') | 선택 톤 |
| `content` | text | NOT NULL | Gemini가 생성한 해설 텍스트 |
| `created_at` | timestamptz | DEFAULT now() | 생성일시 |
| — | — | UNIQUE (artwork_id, attribute, tone) | 동일 조합 중복 방지 |

**캐싱 동작 흐름**
1. 요청 수신 시 `(artwork_id, attribute, tone)` 조합으로 `docent_cache` 조회
2. **HIT** → 저장된 `content` 즉시 반환 (Gemini 미호출)
3. **MISS** → `artworks.description`을 컨텍스트로 Gemini 호출 → 응답을 `docent_cache`에 저장 후 반환

> 작품 108개 × 속성 3 × 톤 4 = 최대 1,296개 조합. 동일 조합 재요청 시 API 비용 없이 즉시 응답.

### 1-3. 관계 정의

```
artists (1) ──────< artworks (N)
                        │
                        │ (1)
                        │
                   docent_cache (N)
```

- `artists` : `artworks` = **1 : N** — 한 작가가 여러 작품 보유
- `artworks` : `docent_cache` = **1 : N** — 한 작품에 속성×톤 조합만큼 캐시 생성 (최대 12개: 3속성 × 4톤)

### 1-4. 실제 데이터 현황

| 구분 | 수량 | 출처 |
|------|------|------|
| 작가 | 34명 | API URL 파라미터(`artistnm`) 추출 |
| 작품 | 108개 | 두 JSON 합산 후 중복 제거 |
| 이미지 | 수동 업로드 예정 | Supabase Storage |
| 소장 기관 | 국립현대미술관 | 고정값 |

---

## 2. 기술스택 정의서

### 2-1. Frontend

#### Next.js 15 (App Router)
- **선택 이유**: 작품 상세 페이지의 SEO 확보를 위한 SSR 지원. Route Handler를 통해 Gemini API 키를 서버사이드에서만 처리해 클라이언트 노출 방지. 파일 기반 라우팅으로 `/artwork/[id]` 동적 페이지 구성이 직관적.
- **주요 사용처**: 작품 목록(`/`), 작품 상세(`/artwork/[id]`), Gemini API Route Handler(`/api/docent`)

#### TypeScript
- **선택 이유**: `Artwork`, `Artist`, `DocentCache` 등 도메인 타입을 명확히 정의해 런타임 에러를 사전에 방지. API 응답 타입 정의로 Supabase 데이터와 컴포넌트 간 타입 안정성 확보.
- **주요 사용처**: 전체 프로젝트

#### SCSS Modules
- **선택 이유**: 컴포넌트 단위 스타일 스코프 관리로 클래스명 충돌 방지. 전역 변수 파일(`_variables.scss`)로 색상·타이포그래피 일관성 유지. Tailwind 대비 세밀한 커스텀 디자인 구현에 적합.
- **주요 사용처**: 각 컴포넌트별 `.module.scss`

#### Zustand
- **선택 이유**: 선택한 톤(tone), 현재 속성(attribute), 채팅 히스토리 등 여러 컴포넌트에서 공유되는 상태를 경량으로 관리. Redux 대비 보일러플레이트가 적어 소규모 프로젝트에 적합.
- **주요 사용처**: `useDocentStore` (tone, attribute, chatHistory 관리)

#### TanStack Query
- **선택 이유**: 작품 목록 API 응답을 자동 캐싱해 불필요한 재요청 방지. `useInfiniteQuery`로 무한 스크롤 구현. 로딩·에러 상태 처리를 선언적으로 관리.
- **주요 사용처**: 작품 목록 데이터 패칭 및 캐싱

#### Vercel AI SDK (`ai` 패키지)
- **선택 이유**: Gemini API 스트리밍 응답을 `streamText` / `useChat` 훅으로 간결하게 처리. 직접 스트리밍 구현 대비 코드량 대폭 감소. Next.js Route Handler와 자연스럽게 통합.
- **주요 사용처**: AI 해설 스트리밍 출력

#### Framer Motion
- **선택 이유**: 속성 탭 전환 슬라이드, 해설 텍스트 페이드인 등 미술관 감성에 맞는 부드러운 인터랙션 구현. CSS 애니메이션 대비 선언적 코드로 유지보수 용이.
- **주요 사용처**: 탭 전환 애니메이션, 해설 등장 효과

---

### 2-2. Backend / Infrastructure

#### Supabase (PostgreSQL)
- **선택 이유**: 별도 백엔드 서버 없이 DB + Storage를 한 번에 구성. Row Level Security로 데이터 접근 제어. 무료 티어로 포트폴리오 운영 가능. Supabase JS 클라이언트로 Next.js와 연동이 간단.
- **주요 사용처**: `artists`, `artworks`, `docent_cache` 테이블 관리

#### Supabase Storage
- **선택 이유**: 외부 이미지 서버 의존 없이 작품 이미지를 직접 보관해 안정적인 URL 확보. 버킷 단위 접근 권한 관리로 보안 설정 용이.
- **주요 사용처**: 작품 이미지(`artworks.image_url`), 작가 사진(`artists.profile_image_url`)

#### Gemini API (gemini-1.5-flash)
- **선택 이유**: GPT-4 대비 비용 효율적으로 포트폴리오 데모 환경에 적합. Flash 모델로 응답 속도가 빠르고 한국어 해설 생성 품질이 양호. `docent_cache` 테이블과 연계해 동일 조합 재호출을 방지해 비용 관리.
- **주요 사용처**: 속성별(배경 / 의미·상징 / 관계성) + 톤별(4종) AI 해설 생성

#### Next.js Route Handlers
- **선택 이유**: 별도 Express/FastAPI 서버 구성 없이 Next.js 내에서 API 엔드포인트 처리. Gemini API 키를 서버사이드에서만 다뤄 보안 확보.
- **주요 엔드포인트**: `POST /api/docent` (해설 생성 + 캐시 조회/저장)

#### Vercel
- **선택 이유**: Next.js에 최적화된 배포 플랫폼으로 별도 서버 설정 불필요. GitHub 연동 시 Push만으로 자동 배포. 환경변수 관리 UI 제공. 무료 티어로 포트폴리오 운영 가능.
- **주요 사용처**: 프로덕션 배포, 환경변수(`GEMINI_API_KEY`, `SUPABASE_URL` 등) 관리

---

### 2-3. 기술스택 한눈에 보기

```
┌─────────────────────────────────────────────┐
│                  Frontend                    │
│  Next.js 15  │  TypeScript  │  SCSS Modules │
│  Zustand  │  TanStack Query  │  Framer Motion│
│  Vercel AI SDK                               │
└──────────────────────┬──────────────────────┘
                       │ HTTP / Streaming
┌──────────────────────▼──────────────────────┐
│         Next.js Route Handler                │
│         POST /api/docent                     │
└──────────┬───────────────────┬──────────────┘
           │                   │
┌──────────▼──────┐   ┌────────▼────────────┐
│  Supabase       │   │  Gemini API          │
│  PostgreSQL     │   │  gemini-1.5-flash    │
│  Storage        │   │                      │
└─────────────────┘   └─────────────────────┘
           │
┌──────────▼──────────────────────────────────┐
│                   Vercel                     │
│              (배포 + 환경변수)                │
└─────────────────────────────────────────────┘
```

---

### 2-4. 주요 패키지

| 패키지 | 버전 | 용도 |
|--------|------|------|
| `next` | 15.x | 프레임워크 |
| `typescript` | 5.x | 언어 |
| `@supabase/supabase-js` | 2.x | Supabase 클라이언트 |
| `@google/generative-ai` | 0.x | Gemini SDK |
| `ai` | 3.x | Vercel AI SDK (스트리밍) |
| `zustand` | 4.x | 상태관리 |
| `@tanstack/react-query` | 5.x | 서버 상태 |
| `framer-motion` | 11.x | 애니메이션 |
| `react-markdown` | 9.x | 해설 마크다운 렌더링 |
| `sass` | 1.x | SCSS 컴파일 |
