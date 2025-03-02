import { Suspense } from "react";
import Loading from "@/app/loading";
import Link from "next/link";
import { getThemes } from "@/actions/theme";
import { ThemeType } from "@/types";

// テーマ一覧ページ
const ThemesPage = async () => {
  // テーマタグのリストをデータベースから取得
  const { data: themesData } = await getThemes();
  const themeObjects = (themesData as ThemeType[]) || [];

  // グラデーションカラーを生成する関数
  const getGradientColor = (index: number) => {
    const colors = [
      "#FF6B6B",
      "#4ECDC4",
      "#45B7D1",
      "#FFA5A5",
      "#A5D8FF",
      "#FFD166",
      "#06D6A0",
      "#118AB2",
      "#EF476F",
      "#FFD166",
      "#06D6A0",
      "#073B4C",
      "#F94144",
      "#F3722C",
      "#F8961E",
      "#F9C74F",
      "#90BE6D",
      "#43AA8B",
      "#4D908E",
      "#577590",
      "#277DA1",
      "#577590",
      "#4D908E",
      "#43AA8B",
    ];
    return colors[index % colors.length];
  };

  // 明るい色を生成する関数
  const getLighterColor = (hexColor: string) => {
    // カラーコードを RGB に変換
    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);

    // 明るくする
    const lighterR = Math.min(255, r + 40);
    const lighterG = Math.min(255, g + 40);
    const lighterB = Math.min(255, b + 40);

    // RGB を 16進数に戻す
    return `#${lighterR.toString(16).padStart(2, "0")}${lighterG
      .toString(16)
      .padStart(2, "0")}${lighterB.toString(16).padStart(2, "0")}`;
  };

  return (
    <Suspense fallback={<Loading />}>
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold">全てのテーマ</h1>
          <Link
            href="/"
            className="text-blue-500 hover:text-blue-700 transition-colors"
          >
            トップページに戻る
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 md:gap-4">
          {themeObjects.map((theme, index) => (
            <Link
              key={theme.id}
              href={`/theme/${encodeURIComponent(theme.name)}`}
              className="p-4 sm:p-6 rounded-lg cursor-pointer transition-transform hover:scale-105 hover:shadow-lg"
              style={{
                background: `linear-gradient(135deg, ${getGradientColor(
                  index
                )}, ${getLighterColor(getGradientColor(index))})`,
              }}
            >
              <h3 className="text-base sm:text-lg font-bold text-white mb-1 sm:mb-2">
                #{theme.name}
              </h3>
              <p className="text-white text-opacity-80 text-xs sm:text-sm">
                {theme.name}に関するコレクションを見る
              </p>
            </Link>
          ))}
        </div>

        {themeObjects.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              テーマが見つかりませんでした
            </p>
          </div>
        )}
      </div>
    </Suspense>
  );
};

export default ThemesPage;
