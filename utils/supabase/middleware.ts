import { createServerClient, type CookieOptions } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  try {
    const supabaseResponse = NextResponse.next({
      request: {
        headers: request.headers,
      },
    })

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            supabaseResponse.cookies.set(name, value, options)
          },
          remove(name: string, options: CookieOptions) {
            supabaseResponse.cookies.set(name, '', options)
          },
        },
      }
    )

    // 必要に応じてリダイレクトなどの処理を行う
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // ログインなしでアクセス可能なパス
    const publicPaths = [
      "/login",
      "/signup",
      "/",
      "/blog",
      "/profile",
      "/reset-password",
      "/theme",
      "/my-collections"
    ]

    // パスがpublicPathsのいずれかで始まる場合はログインなしでアクセス可能
    const isPublicPath = publicPaths.some(path =>
      request.nextUrl.pathname === path ||
      request.nextUrl.pathname.startsWith(`${path}/`)
    )

    if (!user && !isPublicPath) {
      const url = request.nextUrl.clone()
      url.pathname = "/login"
      return NextResponse.redirect(url)
    }

    return supabaseResponse
  } catch (error) {
    console.error('Middleware error:', error)
    return NextResponse.next({
      request: {
        headers: request.headers,
      },
    })
  }
}
