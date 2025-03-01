import { createClient } from "@/utils/supabase/server";
import { Suspense } from "react";
import Loading from "@/app/loading";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import ThemeForm from "@/components/theme/ThemeForm";
import BlogItems from "@/components/theme/BlogItems";

// テーマ詳細ページ
const ThemePage = async ({ params }: { params: Promise<{ name: string }> }) => {
  const supabase = await createClient();
  const { name } = await params;
  const decodedName = decodeURIComponent(name);

  // ログインユーザー情報を取得
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const user = session?.user || null;

  // ブログ一覧取得
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

  // テーマの詳細情報を取得（FV画像を含む）
  const { data: themeData } = await supabase
    .from("themes")
    .select("*")
    .eq("name", decodedName)
    .single();

  // テーマ詳細ページの場合は最新6件のみ表示
  const displayBlogs = blogsData.slice(0, 6);

  return (
    <Suspense fallback={<Loading />}>
      <div>
        {/* メインコンテンツ - ブログ詳細と同じグリッドレイアウト */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="col-span-1 sm:col-span-2 space-y-5 order-first">
            <div>
              <Image
                src={themeData?.image_url || "/noImage.webp"}
                alt={decodedName}
                className="rounded object-cover"
                width={768}
                height={432}
                priority
              />
            </div>

            <div className="text-sm text-gray-500 dark:text-gray-400">
              {format(new Date(), "yyyy/MM/dd")}
            </div>

            <div className="font-bold text-2xl">#{decodedName}</div>

            <div className="leading-relaxed break-words whitespace-pre-wrap">
              「{decodedName}
              」に関するコレクションです。あなたのお気に入りを投稿してみましょう。
            </div>

            <div className="prose dark:prose-invert max-w-none">
              <ul>
                <li>あなたの好きな{decodedName}を共有しましょう</li>
                <li>写真や詳細な説明を添えると、より魅力的な投稿になります</li>
                <li>他のユーザーの投稿にコメントして交流を深めましょう</li>
              </ul>
            </div>

            {/* 投稿フォーム */}
            {user ? (
              <div className="mt-8">
                <ThemeForm
                  themeId={themeData?.id || decodedName}
                  userId={user.id}
                  themeName={decodedName}
                  themePath={`/theme/${encodeURIComponent(decodedName)}`}
                />
              </div>
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

        {/* コレクションセクション */}
        <div className="mt-10 border-t pt-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-bold text-xl">
              みんなのコレクション ({displayBlogs.length}/{blogsData.length})
            </h2>
            <Link href="/" className="text-blue-500 hover:underline">
              トップに戻る
            </Link>
          </div>

          {/* テーマアイテムリスト */}
          {displayBlogs.length > 0 ? (
            <BlogItems blogs={displayBlogs} />
          ) : (
            <div className="text-center py-8 text-gray-500">
              まだ投稿がありません。最初の投稿をしてみましょう！
            </div>
          )}

          {displayBlogs.length === 6 && blogsData.length > 6 && (
            <div className="text-center mt-8">
              <p className="text-gray-500">
                表示: 6件 / 全{blogsData.length}件
              </p>
            </div>
          )}
        </div>
      </div>
    </Suspense>
  );
};

export default ThemePage;
