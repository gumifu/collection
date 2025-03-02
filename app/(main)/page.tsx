import { createClient } from "@/utils/supabase/server";
import { Suspense } from "react";
import BlogItem from "@/components/blog/BlogItem";
import Loading from "@/app/loading";
import ThemeSelector from "@/components/theme/ThemeSelector";
import { getThemes } from "@/actions/theme";
import { ThemeType } from "@/types";
import Link from "next/link";

// メインページ
const MainPage = async () => {
  const supabase = await createClient();

  // コレクション一覧取得
  const { data: blogsData, error } = await supabase
    .from("blogs")
    .select(
      `
      *,
      profiles (
        name,
        avatar_url
      )
    `
    )
    .order("updated_at", { ascending: false });

  if (!blogsData || error) {
    return <div className="text-center">投稿されていません</div>;
  }

  // テーマタグのリストをデータベースから取得
  const { data: themesData } = await getThemes();
  const themeObjects = (themesData as ThemeType[]) || [];

  // 最初の11個のテーマを表示用に取得
  const displayThemes = themeObjects.slice(0, 11).map((theme) => theme.name);
  // 全てのテーマ（ThemeSelectorコンポーネントに渡す）
  const allThemes = themeObjects.map((theme) => theme.name);

  return (
    <Suspense fallback={<Loading />}>
      <div className="space-y-6">
        <h2 className="text-3xl font-bold mb-8">テーマ</h2>
        <ThemeSelector
          themes={displayThemes}
          showAllLink={true}
          allThemes={allThemes}
        />

        <h2 className="text-3xl font-bold mb-8">みんなのオリジナルテーマ</h2>
        <div className="grid grid-cols-3 gap-5">
          {blogsData.map((blog) => {
            return <BlogItem key={blog.id} blog={blog} />;
          })}
        </div>
      </div>
    </Suspense>
  );
};

export default MainPage;
