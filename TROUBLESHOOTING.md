# TROUBLESHOOTING

프로젝트 개발 중 발생한 이슈와 해결 방법을 기록한다.

---

## 1. SCSS `darken()` Deprecation 빌드 경고

**증상**
```text
Deprecation Warning: darken() is deprecated.
Global built-in functions are deprecated and will be removed in Dart Sass 3.0.0.
```

**원인**
Dart Sass 2.x부터 `darken()`, `lighten()` 등 전역 색상 함수가 deprecated됨.

**해결**
```scss
/* Before */
background: linear-gradient(135deg, $color-border, darken($color-border, 5%));

/* After — 고정값 사용 */
background: linear-gradient(135deg, $color-border, #d0d0d0);

/* 또는 sass:color 모듈 사용 */
@use 'sass:color';
background: linear-gradient(135deg, $color-border, color.adjust($color-border, $lightness: -5%));
```

---

## 2. ESLint Flat Config — `eslint-config-next` 모듈 오류

**증상**
```text
ESLint: Cannot find module 'eslint-config-next/core-web-vitals'
```
또는
```text
ESLint: nextVitals is not iterable
```

**원인**
Next.js 15 + ESLint 9 Flat Config 환경에서 `eslint-config-next`가 CommonJS 형식(`module.exports = { extends: [...] }`)으로 export되므로 직접 spread(`...nextVitals`)가 불가능함.

**해결**
`eslint.config.mjs`를 `FlatCompat` 방식으로 재작성:
```js
import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({ baseDirectory: __dirname });

export default [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
];
```

---

## 3. Next.js 15 — `params` 비동기 타입 오류

**증상**
```text
Type error: Type '{ params: { id: string; }; }' does not satisfy the constraint 'PageProps'.
Type '{ id: string; }' is missing the following properties from type 'Promise<any>': then, catch, finally
```

**원인**
Next.js 15부터 동적 라우트의 `params`가 `Promise`로 변경됨.

**해결**
```tsx
/* Before (Next.js 14 방식) */
export default function Page({ params }: { params: { id: string } }) {
  return <div>{params.id}</div>
}

/* After (Next.js 15 방식) */
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <div>{id}</div>
}
```

---

## 4. `@ai-sdk/anthropic` 버전 불일치

**증상**
```text
error TS2741: Property 'defaultObjectGenerationMode' is missing in type 'LanguageModelV4'
but required in type 'LanguageModelV1'.
```

**원인**
`ai@4.x`는 내부적으로 `LanguageModelV1` 인터페이스를 사용하는데, `@ai-sdk/anthropic@4.x`는 `LanguageModelV4`를 반환함 → 버전 불일치.

**해결**
`ai@4.x`에는 `@ai-sdk/anthropic@1.x`를 사용해야 함:
```bash
npm install @ai-sdk/anthropic@1
```

---

## 5. Vercel 배포 차단 — Next.js 보안 취약점 (CVE-2025-66478)

**증상**
```text
Vulnerable version of Next.js detected, please update immediately.
```
Vercel이 `next@15.3.3` 이하 버전을 감지하면 배포를 강제 차단함.

**원인**
React Server Components 비직렬화 취약점 (CVE-2025-55182 / CVE-2025-66478).

**해결**
```bash
npm install next@15   # 15.x 최신 패치 버전으로 업그레이드
```
> ⚠️ 메이저 버전(15→16) 업그레이드는 반드시 팀 합의 후 진행할 것.

---

## 6. Turbopack 워크스페이스 루트 경고

**증상**
```text
Warning: Next.js inferred your workspace root, but it may not be correct.
We detected multiple lockfiles and selected C:\...\docent\package-lock.json
```

**원인**
프로젝트 상위 디렉토리(`docent/`)에 별도의 `package-lock.json`이 존재해 Turbopack이 루트를 잘못 감지함.

**해결**
`next.config.ts`에 `turbopack.root` 명시:
```ts
import path from "path";
const nextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
};
```

---

## 7. `useSearchParams` — Suspense 바운더리 필요

**증상**
```text
Error: useSearchParams() should be wrapped in a suspense boundary at page "/"
```

**원인**
Next.js 15에서 `useSearchParams()`를 사용하는 컴포넌트는 반드시 `<Suspense>`로 감싸야 함.

**해결**
```tsx
// page.tsx
export default function HomePage() {
  return (
    <Suspense>
      <HomeContent />  {/* useSearchParams 사용하는 컴포넌트 */}
    </Suspense>
  )
}
```

---

## 8. `.env.local` — IDE 열기 시 파일 덮어쓰기

**증상**
Claude Code로 `.env.local`을 수정했는데 IDE에서 파일을 열자마자 이전 내용으로 되돌아감.

**원인**
IDE가 파일을 열 때 캐시된 버전을 저장하면서 덮어씀.

**해결**
- `.env.local` 수정 후 IDE에서 해당 파일 탭을 닫고 새로 열기
- 또는 IDE에서 직접 편집하지 않고 Claude Code에 위임

---

## 9. Supabase `artists` 관계 타입 — 배열 vs 객체

**증상**
```text
Conversion of type '{ name: any; }[]' to type '{ name: string; }' may be a mistake
```

**원인**
Supabase가 외래키 관계(`.select('*, artists(*)')`)를 배열 타입으로 추론함.

**해결**
```ts
const artists = artwork.artists as unknown as { name: string } | { name: string }[] | null
const artistName = (Array.isArray(artists) ? artists[0]?.name : artists?.name) ?? '알 수 없음'
```

---

## 10. `docent_cache` — 캐시 키에 `level` 누락

**증상**
이해수준(level)이 달라도 같은 캐시 결과가 반환됨.

**원인**
캐시 조회/저장 시 `(artwork_id, attribute, tone)` 3개만 키로 사용하고 `level`을 누락함.

**해결**
- 캐시 조회에 `.eq('level', level)` 추가
- 저장 시 `insert` → `upsert`로 변경 (동시 요청에 의한 중복 방지)
- DB 유니크 제약: `UNIQUE (artwork_id, attribute, tone, level)`

---

## 11. `docent_cache`를 활용한 API 비용 최적화

Claude API는 요청마다 과금되는 구조로, 동일한 작품에 대해 같은 속성·톤·이해수준 조합을 반복 요청할 경우 불필요한 비용이 발생하는 문제가 있었습니다.

이를 해결하기 위해 `(artwork_id, attribute, tone, level)` 조합을 복합 유니크 키로 하는 `docent_cache` 테이블을 설계하였습니다. Route Handler에서 Claude API 호출 전 캐시를 먼저 조회해 동일 조합이 존재하면 즉시 반환하고, 없을 경우에만 Claude API를 호출한 뒤 결과를 저장하는 HIT/MISS 구조로 전환하였습니다.

작품 108개 × 속성 3가지 × 톤 4가지 × 이해수준 3가지 기준 최대 **3,888개 조합**이 캐싱 대상으로, 반복 요청 시 API 비용 없이 즉시 응답이 가능한 구조를 갖추었습니다.

```text
캐시 HIT  → content 즉시 반환 (Claude API 미호출)
캐시 MISS → Claude API 호출 → docent_cache에 upsert → 스트리밍 반환
```

---

## 12. 속성별 프롬프트 분리 설계

초기에는 하나의 프롬프트 안에 세 속성 조건을 모두 나열하고 라벨만 교체하는 방식을 사용했습니다. 이 경우 AI가 자신이 해설해야 할 속성과 무관한 지시문까지 읽게 되어 초점이 분산되는 문제가 있었습니다.

**이전 방식 (문제)**
```
[설명 속성]: 작품 배경 (시대적 맥락, 작가 생애, 사조 중심)
- 배경일 경우 작가 생애 중심으로...
- 의미·상징일 경우 색채·구도 중심으로...
- 관계성일 경우 동시대 작가 중심으로...
```

**개선 방식**
`ATTRIBUTE_PROMPTS` 객체에 속성별 지시문을 분리 정의하고, 선택된 속성 하나의 지시문만 프롬프트에 주입합니다.

| 속성 | 핵심 지시 |
|------|-----------|
| `background` | 작품이 만들어진 계기·시대적 배경, 작가 생애, 미술 사조 |
| `meaning` | 색채·구도·형태의 상징, 작가의 메시지, 표현 의도 |
| `relation` | 의미·상징을 간략히 언급 후 연관 작품과의 영향 관계 중심 |

또한 이해수준(`level`)에 따라 용어 난이도를 조정하며, 도슨트 페르소나("30년 경력")를 부여해 해설의 신뢰감을 높였습니다.

---

## 13. QR 직접 진입 — Zustand 잔류 `tone`으로 확인 페이지 우회

**증상**
QR로 `/artwork/[id]?from=qr` 진입 시, 이전 세션에 Zustand `tone`이 남아 있으면 확인 페이지(`/qr`)를 건너뛰고 상세 페이지로 바로 들어감.

**원인**
`from=qr` 분기를 클라이언트(`ArtworkDetailClient`)의 `tone === null` 조건에 의존했기 때문에, 클라이언트 상태(Zustand)가 잔류하면 분기가 동작하지 않음.

**해결**
서버 컴포넌트(`page.tsx`)에서 `from === 'qr'`를 감지해 즉시 서버 리다이렉트:
```ts
if (from === 'qr') {
  redirect(`/artwork/${id}/qr`)
}
```
클라이언트 상태와 무관하게 항상 확인 페이지로 이동.

---

## 14. `/api/chat` — `chatHistory` 런타임 검증 없음

**증상**
조작된 요청으로 유효하지 않은 `role`, 비정상적으로 긴 메시지, 배열이 아닌 값을 `chatHistory`로 전송하면 500 에러 또는 과도한 토큰 사용이 발생.

**원인**
TypeScript 타입 단언(`as { chatHistory: ... }`)은 런타임에 실제 shape을 검증하지 않음. 공개 API 경계에서 입력값을 신뢰한 것이 원인.

**해결**
요청 파싱 후 `chatHistory`의 shape을 명시적으로 검증:
```ts
const isInvalidHistory =
  chatHistory != null &&
  (!Array.isArray(chatHistory) ||
    chatHistory.some(
      (msg) =>
        !msg ||
        (msg.role !== 'user' && msg.role !== 'assistant') ||
        typeof msg.content !== 'string' ||
        msg.content.length > 500,
    ))
```
검증 실패 시 400 반환.

---

## 15. `.next` 캐시 — CSS 404 에러

**증상**
```text
GET /_next/static/css/app/(page)/page.css net::ERR_ABORTED 404
```

**원인**
빌드 아티팩트가 캐시된 상태에서 파일이 변경됨.

**해결**
```bash
# .next 폴더 삭제 후 재시작
rm -rf .next && npm run dev
```
