import { NextRequest } from 'next/server'
import { streamText } from 'ai'
import { anthropic } from '@ai-sdk/anthropic'
import { supabase } from '@/lib/supabase'
import { buildDocentPrompt } from '@/lib/prompts'
import type { Attribute, Tone, Level } from '@/types'

export async function POST(request: NextRequest) {
  const { artwork_id, attribute, tone, level } = (await request.json()) as {
    artwork_id: string
    attribute: Attribute
    tone: Tone
    level: Level
  }

  const VALID_ATTRIBUTES = ['background', 'meaning', 'relation']
  const VALID_TONES = ['formal', 'humorous', 'child', 'reflective']
  const VALID_LEVELS = ['beginner', 'normal', 'expert']

  if (
    !artwork_id ||
    !VALID_ATTRIBUTES.includes(attribute) ||
    !VALID_TONES.includes(tone) ||
    !VALID_LEVELS.includes(level)
  ) {
    return new Response('잘못된 요청입니다.', { status: 400 })
  }

  const { data: cached } = await supabase
    .from('docent_cache')
    .select('content')
    .eq('artwork_id', artwork_id)
    .eq('attribute', attribute)
    .eq('tone', tone)
    .eq('level', level)
    .single()

  if (cached?.content) {
    return new Response(cached.content, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    })
  }

  const { data: artwork } = await supabase
    .from('artworks')
    .select('title, description, artists(name)')
    .eq('id', artwork_id)
    .single()

  if (!artwork) {
    return new Response('작품을 찾을 수 없습니다.', { status: 404 })
  }

  const artists = artwork.artists as unknown as { name: string } | { name: string }[] | null
  const artistName = (Array.isArray(artists) ? artists[0]?.name : artists?.name) ?? '알 수 없음'

  const prompt = buildDocentPrompt({
    title: artwork.title,
    artistName,
    description: artwork.description ?? '',
    attribute,
    tone,
    level,
  })

  const result = streamText({
    model: anthropic('claude-haiku-4-5-20251001'),
    prompt,
    onFinish: async ({ text }) => {
      await supabase.from('docent_cache').upsert(
        { artwork_id, attribute, tone, level, content: text },
        { onConflict: 'artwork_id,attribute,tone,level' },
      )
    },
  })

  return new Response(result.textStream.pipeThrough(new TextEncoderStream()), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
