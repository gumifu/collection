import { type NextRequest } from "next/server"
import { updateSession } from "@/utils/supabase/middleware"

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    // "/((?!_next/static|_next/image|favicon.ico|reset-password|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",

  ],
}
