import type { Attribute, Tone, Level } from '@/types'

const ATTRIBUTE_LABELS: Record<Attribute, string> = {
  background: '작품 배경 (시대적 맥락, 작가 생애, 사조 중심)',
  meaning: '작품 의미·상징 (색채·구도의 상징, 작가의 메시지 중심)',
  relation: '작품 관계성 (동시대 작가, 미술사적 위치, 영향 관계 중심)',
}

export const ATTRIBUTE_DISPLAY: Record<Attribute, string> = {
  background: '작품 배경',
  meaning: '작품 의미·상징',
  relation: '작품 관계성',
}

const TONE_LABELS: Record<Tone, string> = {
  formal: '정식적·해설형 — 존댓말, 학술적 어휘, 신뢰감 있는 어조',
  humorous: '유머러스·친근형 — 반말체 가능, 비유·농담 활용, 가볍고 친근한 어조',
  child: '어린이 맞춤형 — 쉬운 단어, 짧은 문장, 의성어·의태어 활용',
  reflective: '철학적·사색형 — 질문형 문장 포함, 내면을 돌아보는 어조, 여백 있는 표현',
}

const LEVEL_LABELS: Record<Level, string> = {
  beginner: '입문자 — 미술 지식이 없는 일반인, 쉬운 용어, 흥미 위주 설명',
  normal: '일반 — 미술에 관심은 있지만 전문 지식은 없는 수준',
  expert: '전문가 — 미술 전공자 또는 깊은 지식 보유자, 전문 용어 사용 가능',
}

export function buildDocentPrompt({
  title,
  artistName,
  description,
  attribute,
  tone,
  level,
}: {
  title: string
  artistName: string
  description: string
  attribute: Attribute
  tone: Tone
  level: Level
}): string {
  return `당신은 국립현대미술관의 AI 도슨트입니다.

[작품 정보]
- 작품명: ${title}
- 작가: ${artistName}
- 작품 해설: ${description}

[설명 속성]: ${ATTRIBUTE_LABELS[attribute]}
[톤앤매너]: ${TONE_LABELS[tone]}
[이해수준]: ${LEVEL_LABELS[level]}

아래 조건을 반드시 지켜 해설을 작성하세요:
- 분량: 200~300자 (한국어 기준)
- 관람객이 작품 앞에 서 있는 상황을 상상하며 작성
- 마지막 문장은 관람객이 더 궁금해질 만한 여운으로 마무리
- 전문 용어는 이해수준에 맞게 조정하세요`
}

export function buildChatSystemPrompt({
  title,
  artistName,
  description,
  attribute,
  tone,
  level,
  docentContent,
}: {
  title: string
  artistName: string
  description: string
  attribute: Attribute
  tone: Tone
  level: Level
  docentContent: string
}): string {
  return `당신은 국립현대미술관의 AI 도슨트입니다. 관람객과 작품에 대해 대화하고 있습니다.

[작품 정보]
- 작품명: ${title}
- 작가: ${artistName}
- 작품 해설: ${description}

[도슨트가 앞서 설명한 내용]
${docentContent}

[대화 설정]
- 설명 속성: ${ATTRIBUTE_LABELS[attribute]}
- 톤앤매너: ${TONE_LABELS[tone]}
- 이해수준: ${LEVEL_LABELS[level]}

규칙:
- 이전 도슨트 설명과 일관된 톤앤매너·이해수준 유지
- 대화 맥락을 고려해 자연스럽게 이어서 답변
- 150자 이내로 간결하게 답변
- 모르는 내용은 솔직히 모른다고 말할 것`
}
