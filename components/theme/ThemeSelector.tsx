"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import ThemeForm from "./ThemeForm";
import { getThemeItems } from "@/actions/theme";
import { ThemeItemType } from "@/types";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface ThemeSelectorProps {
  themes: string[];
}

const ThemeSelector = ({ themes }: ThemeSelectorProps) => {
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);
  const [themeItems, setThemeItems] = useState<ThemeItemType[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [slideDirection, setSlideDirection] = useState<"left" | "right" | null>(
    null
  );
  const router = useRouter();
  const { user } = useAuth();

  // URLからテーマを取得
  useEffect(() => {
    const url = new URL(window.location.href);
    const themeParam = url.searchParams.get("theme");
    if (themeParam && themes.includes(themeParam)) {
      setSelectedTheme(themeParam);
      fetchThemeItems(themeParam);
    }
  }, [themes]);

  // スライド方向を監視して、アニメーションをリセット
  useEffect(() => {
    if (slideDirection) {
      const timer = setTimeout(() => {
        setSlideDirection(null);
      }, 300); // アニメーション時間と同じ
      return () => clearTimeout(timer);
    }
  }, [slideDirection]);

  // テーマアイテムを取得
  const fetchThemeItems = async (themeName: string) => {
    setLoading(true);
    try {
      const res = await getThemeItems(themeName);
      if (res?.data) {
        setThemeItems(res.data);
      } else if (res?.error) {
        // エラー処理
      }
    } catch (error) {
      // エラー処理
      console.error("テーマアイテム取得エラー:", error);
    } finally {
      setLoading(false);
    }
  };

  // テーマをクリックしたときの処理
  const handleThemeClick = (theme: string) => {
    // 新しいテーマ詳細ページに遷移
    router.push(`/theme/${encodeURIComponent(theme)}`);
  };

  // 詳細表示から戻る処理
  const handleBack = () => {
    setSelectedTheme(null);
    setThemeItems([]);
    // URLを元に戻す
    router.push("/");
  };

  // モーダルを開く
  const openModal = (index: number) => {
    setCurrentIndex(index);
    setIsModalOpen(true);
    // スクロールを無効にする
    document.body.style.overflow = "hidden";
  };

  // モーダルを閉じる
  const closeModal = () => {
    setIsModalOpen(false);
    // スクロールを有効にする
    document.body.style.overflow = "auto";
  };

  // 前のアイテムに移動
  const goToPrevious = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentIndex > 0) {
      setSlideDirection("right"); // 右からスライドイン（前に戻る）
      setCurrentIndex(currentIndex - 1);
    }
  };

  // 次のアイテムに移動
  const goToNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentIndex < themeItems.length - 1) {
      setSlideDirection("left"); // 左からスライドイン（次に進む）
      setCurrentIndex(currentIndex + 1);
    }
  };

  // スライドアニメーションのクラスを取得
  const getSlideAnimationClass = () => {
    if (!slideDirection) return "";
    return slideDirection === "left" ? "slide-left" : "slide-right";
  };

  // テーマの詳細表示
  if (selectedTheme) {
    // 最新の6件のみを表示するためのデータ
    const latestThemeItems = themeItems.slice(0, 6);

    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="col-span-1 sm:col-span-2 space-y-5 order-first">
            <div>
              <Image
                src="/noImage.webp"
                alt={selectedTheme}
                className="rounded object-cover"
                width={768}
                height={432}
                priority
              />
            </div>

            <div className="text-sm text-gray-500 dark:text-gray-400">
              {format(new Date(), "yyyy/MM/dd")}
            </div>

            <div className="font-bold text-2xl">#{selectedTheme}</div>

            <div className="leading-relaxed break-words whitespace-pre-wrap">
              「{selectedTheme}
              」に関するコレクションです。あなたのお気に入りを投稿してみましょう。
            </div>

            <div className="prose dark:prose-invert max-w-none">
              <ul>
                <li>あなたの好きな{selectedTheme}を共有しましょう</li>
                <li>写真や詳細な説明を添えると、より魅力的な投稿になります</li>
                <li>他のユーザーの投稿にコメントして交流を深めましょう</li>
              </ul>
            </div>
          </div>

          <div className="col-span-1 order-last md:order-none">
            <div className="md:sticky md:top-4">
              <div className="border rounded flex flex-col items-center justify-center space-y-2 p-5 dark:border-gray-700 dark:bg-gray-800">
                <Image
                  src="/avator-default.webp"
                  className="rounded-full object-cover aspect-square"
                  alt="avatar"
                  width={100}
                  height={100}
                  priority
                />
                <div className="font-bold font-yugothic">Collection Case</div>
                <p className="text-gray-600 dark:text-gray-300 mt-1 text-center">
                  テーマに沿ったコレクションを投稿してみましょう
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* コメントセクション */}
        <div className="mt-10 border-t pt-8">
          <h2 className="font-bold text-xl mb-6">
            みんなのテーマ ({latestThemeItems.length}/{themeItems.length})
          </h2>

          {/* テーマアイテムリスト */}
          {loading ? (
            <div className="text-center py-8">読み込み中...</div>
          ) : themeItems.length > 0 ? (
            <div className="mt-4 pr-2">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {latestThemeItems.map((item, index) => (
                  <div
                    key={item.id}
                    className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 h-full flex flex-col cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                    onClick={() => openModal(index)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        <Image
                          src={
                            item.profiles.avatar_url || "/avator-default.webp"
                          }
                          alt="ユーザーアバター"
                          width={40}
                          height={40}
                          className="rounded-full aspect-square"
                        />
                        <div>
                          <p className="font-semibold">{item.profiles.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {format(
                              new Date(item.created_at),
                              "yyyy/MM/dd HH:mm"
                            )}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 whitespace-pre-wrap leading-relaxed">
                      {item.content}
                    </div>

                    {item.list && (
                      <div
                        className="mt-2 prose prose-sm max-w-none dark:prose-invert"
                        dangerouslySetInnerHTML={{ __html: item.list }}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              まだ投稿がありません。最初の投稿をしてみましょう！
            </div>
          )}

          {user ? (
            <ThemeForm
              themeId={selectedTheme}
              userId={user.id}
              themeName={selectedTheme}
            />
          ) : (
            <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                コレクションを投稿するにはログインが必要です
              </p>
              <Link
                href="/login"
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition inline-block"
              >
                ログインする
              </Link>
            </div>
          )}
        </div>

        {/* モーダル */}
        {isModalOpen && latestThemeItems.length > 0 && (
          <div className="modal-overlay" onClick={closeModal}>
            <div
              className="modal-container"
              onClick={(e) => e.stopPropagation()}
            >
              {/* 閉じるボタン */}
              <button onClick={closeModal} className="modal-close-button">
                <X className="h-6 w-6" />
              </button>

              <div className="p-6 flex flex-col h-full">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <Image
                      src={
                        latestThemeItems[currentIndex].profiles.avatar_url ||
                        "/avator-default.webp"
                      }
                      alt="ユーザーアバター"
                      width={50}
                      height={50}
                      className="rounded-full aspect-square"
                    />
                    <div>
                      <p className="font-bold text-lg">
                        {latestThemeItems[currentIndex].profiles.name}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {format(
                          new Date(latestThemeItems[currentIndex].created_at),
                          "yyyy/MM/dd HH:mm"
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                <div
                  className={`whitespace-pre-wrap mb-6 leading-relaxed ${getSlideAnimationClass()}`}
                >
                  {latestThemeItems[currentIndex].content}
                </div>

                {latestThemeItems[currentIndex].list && (
                  <div
                    className={`prose dark:prose-invert max-w-none ${getSlideAnimationClass()}`}
                    dangerouslySetInnerHTML={{
                      __html: latestThemeItems[currentIndex].list,
                    }}
                  />
                )}

                {/* ページネーション表示 */}
                <div className="modal-pagination">
                  <button
                    onClick={goToPrevious}
                    className={`modal-pagination-button ${
                      currentIndex <= 0
                        ? "opacity-0 cursor-not-allowed"
                        : "opacity-100"
                    }`}
                    disabled={currentIndex <= 0}
                  >
                    <ChevronLeft className="h-4 w-4 text-gray-700 dark:text-gray-300" />
                  </button>

                  <div className="modal-pagination-counter">
                    {currentIndex + 1} / {latestThemeItems.length}
                  </div>

                  <button
                    onClick={goToNext}
                    className={`modal-pagination-button ${
                      currentIndex >= latestThemeItems.length - 1
                        ? "opacity-0 cursor-not-allowed"
                        : "opacity-100"
                    }`}
                    disabled={currentIndex >= latestThemeItems.length - 1}
                  >
                    <ChevronRight className="h-4 w-4 text-gray-700 dark:text-gray-300" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* テーマ一覧に戻るボタン - フッターの上に配置 */}
        <div className="mt-8 border-b pb-6 mb-8">
          <button
            onClick={handleBack}
            className="flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            一覧に戻る
          </button>
        </div>
      </div>
    );
  }

  // テーマ一覧表示
  return (
    <div className="container mx-auto w-full mb-16">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {themes.map((theme, index) => (
          <div
            key={index}
            className="p-6 rounded-lg cursor-pointer transition-transform hover:scale-105 hover:shadow-lg"
            style={{
              background: `linear-gradient(135deg, ${getGradientColor(
                index
              )}, ${getLighterColor(getGradientColor(index))})`,
            }}
            onClick={() => handleThemeClick(theme)}
          >
            <h3 className="text-lg font-bold text-white mb-2">#{theme}</h3>
            <p className="text-white text-opacity-80 text-sm">
              {theme}に関するコレクションを見る
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

// グラデーションの色を取得する関数
function getGradientColor(index: number): string {
  // テーマごとに異なる色を返す
  const colors = [
    "#4F46E5", // インディゴ
    "#0EA5E9", // スカイブルー
    "#10B981", // エメラルド
    "#F59E0B", // アンバー
    "#EC4899", // ピンク
    "#8B5CF6", // バイオレット
    "#06B6D4", // シアン
    "#F97316", // オレンジ
  ];
  return colors[index % colors.length];
}

// より明るい色を取得する関数
function getLighterColor(color: string): string {
  // 簡易的な明るい色の生成（実際はもっと洗練された方法があります）
  return color + "99"; // 透明度を追加して明るく見せる
}

export default ThemeSelector;
