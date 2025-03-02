"use client";

import { User } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { LogOut, Menu, X } from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";
import { useState } from "react";
import Image from "next/image";

interface NavigationProps {
  user: User | null;
}

// ナビゲーション
const Navigation = ({ user }: NavigationProps) => {
  const router = useRouter();
  const supabase = createClient();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    if (!window.confirm("ログアウトしますが、宜しいですか？")) {
      return;
    }

    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="border-b dark:border-gray-700 dark:bg-gray-900 relative overflow-visible">
      <div className="mx-auto max-w-screen-lg px-4 py-5 flex items-center justify-between">
        <div className="flex items-center">
          <Link
            href="/"
            className="font-bold text-2xl"
            onClick={(e) => {
              // テーマ詳細ページが開いている場合は、通常のリンク動作をキャンセルして
              // URLを直接変更し、ページをリフレッシュする
              if (window.location.search.includes("theme=")) {
                e.preventDefault();
                window.history.pushState({}, "", "/");
                window.location.reload();
              }
            }}
          >
            collextion
          </Link>
          <div
            className="relative"
            style={{ marginLeft: "-10px", marginTop: "-20px" }}
          >
            <Image
              src="/Union.svg"
              alt="Union icon"
              width={120}
              height={120}
              className="absolute -top-10 -right-10"
            />
          </div>
        </div>

        {/* デスクトップメニュー */}
        <div className="hidden md:flex items-center space-x-4">
          <ThemeToggle />

          <div className="text-sm font-bold">
            {user ? (
              <div className="flex items-center space-x-5">
                <Link href="/blog/new">
                  <div>テーマを投稿</div>
                </Link>

                <Link href="/settings/profile">
                  <div>設定</div>
                </Link>

                <div className="cursor-pointer" onClick={handleLogout}>
                  <LogOut className="h-5 w-5" />
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-5">
                <Link href="/login">ログイン</Link>
                <Link href="/signup">サインアップ</Link>
              </div>
            )}
          </div>
        </div>

        {/* モバイルメニューボタン */}
        <div className="md:hidden flex items-center">
          <ThemeToggle />
          <button
            onClick={toggleMenu}
            className="ml-4 p-1"
            aria-label="メニューを開く"
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* モバイルメニュー */}
      {isMenuOpen && (
        <div className="md:hidden px-4 py-3 border-t dark:border-gray-700 bg-white dark:bg-gray-900">
          <div className="flex flex-col space-y-4 text-sm font-bold">
            {user ? (
              <>
                <Link href="/blog/new" onClick={() => setIsMenuOpen(false)}>
                  <div className="py-2">テーマを投稿</div>
                </Link>

                <Link
                  href="/settings/profile"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <div className="py-2">設定</div>
                </Link>

                <div
                  className="cursor-pointer py-2 flex items-center"
                  onClick={handleLogout}
                >
                  <LogOut className="h-5 w-5 mr-2" />
                  <span>ログアウト</span>
                </div>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                  <div className="py-2">ログイン</div>
                </Link>
                <Link href="/signup" onClick={() => setIsMenuOpen(false)}>
                  <div className="py-2">サインアップ</div>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navigation;
