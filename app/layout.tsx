import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Noto_Sans_JP } from "next/font/google";
import { createClient } from "@/utils/supabase/server";
// import ToastProvider from "@/components/providers/ToastProvider";
import Navigation from "@/components/ui/navigation";
import ToastProvider from "@/components/providers/ToastProvider";

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
  maximumScale: 1,
  userScalable: false,
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
      <body className={notoSansJP.className} suppressHydrationWarning={true}>
        <ToastProvider />
        <div className="flex min-h-screen flex-col">
          <Navigation user={user} />

          <main className="flex-1">{children}</main>

          <footer className="border-t py-2">
            <div className="flex flex-col items-center justify-center text-sm space-y-5">
              <div>©Collextion Case ALL Rights Reserved.</div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
};

export default RootLayout;
