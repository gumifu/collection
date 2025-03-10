import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Noto_Sans_JP } from "next/font/google";
import { createClient } from "@/utils/supabase/server";
// import ToastProvider from "@/components/providers/ToastProvider";
import Navigation from "@/components/ui/navigation";
import ToastProvider from "@/components/providers/ToastProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";

const notoSansJP = Noto_Sans_JP({
  weight: ["400", "700", "900"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    template: "Collextion",
    default: "Collexion",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

interface RootLayoutProps {
  children: React.ReactNode;
}

// ルートレイアウト
const RootLayout = async ({ children }: RootLayoutProps) => {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const user = data?.user;

  return (
    <html lang="ja">
      <body
        className={`${notoSansJP.className}`}
        suppressHydrationWarning={true}
      >
        <ThemeProvider>
          <ToastProvider />
          <div className="flex min-h-screen flex-col dark:bg-gray-900 dark:text-white">
            <Navigation user={user} />

            <main className="flex-1 container mx-auto max-w-screen-lg py-6">
              {children}
            </main>

            <footer className="border-t py-2 dark:border-gray-700">
              <div className="flex flex-col items-center justify-center text-sm space-y-5">
                <div>©Collextion Case ALL Rights Reserved.</div>
              </div>
            </footer>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
};

export default RootLayout;
