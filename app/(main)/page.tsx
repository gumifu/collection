import { Suspense } from "react";
import Loading from "@/app/loading";
import ThemeSelector from "@/components/theme/ThemeSelector";
import { getThemes } from "@/actions/theme";
import { ThemeType } from "@/types";
import InfiniteOriginalThemes from "@/components/blog/InfiniteOriginalThemes";
import Image from "next/image";
import Link from "next/link";

// メインページ
const MainPage = async () => {
  // テーマタグのリストをデータベースから取得
  const { data: themesData } = await getThemes();
  const themeObjects = (themesData as ThemeType[]) || [];

  // 最初の11個のテーマを表示用に取得
  const displayThemes = themeObjects.slice(0, 11).map((theme) => theme.name);
  // 全てのテーマ（ThemeSelectorコンポーネントに渡す）
  const allThemes = themeObjects.map((theme) => theme.name);

  return (
    <Suspense fallback={<Loading />}>
      <div className="space-y-6 -mt-16 pt-16">
        {/* FVセクション - 画面いっぱいに表示 */}
        <div className="w-full relative h-[60vh] min-h-[400px] mb-8 -mt-16">
          <div
            className="absolute top-0 left-0 right-0 w-[100vw] h-full"
            style={{ left: "50%", transform: "translateX(-50%)" }}
          >
            <Image
              src="https://images.unsplash.com/photo-1493106641515-6b5631de4bb9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2000&q=80"
              alt="コレクションのファーストビュー"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-black/30 flex flex-col justify-center items-center text-white p-6 pt-24">
              <h1
                className="text-6xl md:text-5xl font-bold mb-6 text-center"
                style={{ fontFamily: "var(--font-pacifico)" }}
              >
                collextion
              </h1>
              <p className="text-xl md:text-2xl text-center max-w-2xl mb-8">
                あなただけの ” ベスト ” コレクションを作成して共有しよう！
              </p>
              <Link
                href="/blog/new"
                className="bg-white text-black hover:bg-gray-100 transition-colors px-8 py-3 rounded-full font-bold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-transform"
              >
                コレクションを作成する
              </Link>
            </div>
          </div>
        </div>

        <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-8 mt-16">
          募集中テーマから作成する
        </h2>
        <ThemeSelector
          themes={displayThemes}
          showAllLink={true}
          allThemes={allThemes}
        />

        <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-8">
          みんなのコレクションから作成する
        </h2>

        <InfiniteOriginalThemes initialLimit={20} />
      </div>
    </Suspense>
  );
};

export default MainPage;
