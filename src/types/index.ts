export interface Artist {
  id: string
  name: string
  profile_image_url: string | null
  created_at: string
}

export interface Artwork {
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

export interface DocentCache {
  id: string
  artwork_id: string
  attribute: Attribute
  tone: Tone
  content: string
  created_at: string
}

export type Attribute = 'background' | 'meaning' | 'relation'
export type Tone = 'formal' | 'humorous' | 'child' | 'reflective'
export type Level = 'beginner' | 'normal' | 'expert'
