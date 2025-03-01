import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {  // 関数を async にする
  const cookieStore = await cookies()  // cookies() を非同期で解決

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        async getAll() {  // 非同期関数として実装
          return await cookieStore.getAll()  // 非同期で取得
        },
        async setAll(cookiesToSet) {  // 非同期関数として実装
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}
