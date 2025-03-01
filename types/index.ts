export interface ProfileType {
  id: string
  name: string
  introduce: string | null
  avatar_url: string | null
}

export interface BlogType {
  id: string
  title: string
  content: string
  list?: string
  user_id: string
  image_url: string | null
  updated_at: string
  created_at: string
}

export interface CommentType {
  id: string
  content: string
  blog_id: string
  user_id: string
  created_at: string
  updated_at: string
  profiles?: {
    name: string
    avatar_url: string | null
  }
}
