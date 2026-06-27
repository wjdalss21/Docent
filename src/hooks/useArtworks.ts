'use client'

import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Artwork } from '@/types'

async function fetchArtworks(): Promise<Artwork[]> {
  const { data, error } = await supabase
    .from('artworks')
    .select(`
      *,
      artists (
        id,
        name,
        profile_image_url,
        created_at
      )
    `)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data ?? []
}

export function useArtworks() {
  return useQuery({
    queryKey: ['artworks'],
    queryFn: fetchArtworks,
  })
}
