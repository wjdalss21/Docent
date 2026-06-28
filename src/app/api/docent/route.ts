import { NextRequest } from 'next/server'
import { streamText } from 'ai'
import { google } from '@ai-sdk/google'
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

  const { data: cached } = await supabase
    .from('docent_cache')
    .select('content')
    .eq('artwork_id', artwork_id)
    .eq('attribute', attribute)
    .eq('tone', tone)
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

  const artistName = (artwork.artists as { name: string } | null)?.name ?? '알 수 없음'

  const prompt = buildDocentPrompt({
    title: artwork.title,
    artistName,
    description: artwork.description ?? '',
    attribute,
    tone,
    level,
  })

  const result = streamText({
    model: google('gemini-1.5-flash'),
    prompt,
    onFinish: async ({ text }) => {
      await supabase.from('docent_cache').insert({
        artwork_id,
        attribute,
        tone,
        content: text,
      })
    },
  })

  return new Response(result.textStream.pipeThrough(new TextEncoderStream()), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
