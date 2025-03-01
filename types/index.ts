export interface ProfileType {
  id: string
  name: string
  introduce: string | null
  avatar_url: string | null
}

export type BlogType = {
  id: string;
  title: string;
  content: string;
  image_url: string | null;
  user_id: string;
  created_at: string;
  updated_at: string;
  list: string | null;
};

export type CommentType = {
  id: string;
  content: string;
  blog_id: string;
  user_id: string;
  created_at: string;
  profiles: {
    name: string;
    avatar_url: string | null;
  };
};

export type ThemeCommentType = {
  id: string;
  content: string;
  theme_id: string;
  user_id: string;
  created_at: string;
  profiles: {
    id: string;
    name: string;
    avatar_url: string | null;
  };
};

export type ThemeType = {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
};

export type ThemeItemType = {
  id: string;
  content: string;
  list: string | null;
  theme_id: string;
  user_id: string;
  created_at: string;
  profiles: {
    name: string;
    avatar_url: string | null;
  };
};
