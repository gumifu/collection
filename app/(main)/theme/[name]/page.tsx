import { createClient } from "@/utils/supabase/server";
import { Suspense } from "react";
import Loading from "@/app/loading";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import ThemeForm from "@/components/theme/ThemeForm";
import CollectionItem from "@/components/theme/CollectionItem";
import { revalidatePath } from "next/cache";

// テーマ詳細ページ
const ThemePage = async ({ params }: { params: Promise<{ name: string }> }) => {
  const supabase = await createClient();
  const { name } = await params;
  const decodedName = decodeURIComponent(name);

  // ログインユーザー情報を取得（存在しない場合はnull）
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const user = session?.user || null;

  // テーマの詳細情報を取得（FV画像を含む）
  const { data: themeData, error: themeError } = await supabase
    .from("themes")
    .select("*")
    .eq("name", decodedName)
    .single();

  // テーマが見つからない場合
  if (themeError) {
    console.error("テーマ取得エラー:", themeError);
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-bold mb-4">
          テーマが見つかりませんでした
        </h2>
        <p className="mb-4">
          お探しのテーマは存在しないか、削除された可能性があります。
        </p>
        <Link href="/" className="text-blue-500 hover:underline">
          トップページに戻る
        </Link>
      </div>
    );
  }

  // テーマアイテムを取得
  const { data: themeItemsData, error: themeItemsError } = await supabase
    .from("theme_items")
    .select("*")
    .eq("theme_id", themeData?.id)
    .order("created_at", { ascending: false })
    .limit(10);

  let themeItems = themeItemsData || [];

  if (themeItemsError) {
    console.error("テーマアイテム取得エラー:", themeItemsError);
  } else if (themeItems.length > 0) {
    // ユーザーIDを抽出
    const userIds = [...new Set(themeItems.map((item) => item.user_id))];

    // プロフィール情報を取得
    const { data: profilesData } = await supabase
      .from("profiles")
      .select("id, name, avatar_url")
      .in("id", userIds);

    // プロフィール情報をマップ
    const profilesMap = profilesData
      ? profilesData.reduce((acc, profile) => {
          acc[profile.id] = profile;
          return acc;
        }, {} as Record<string, { name: string; avatar_url: string | null }>)
      : {};

    // テーマアイテムにプロフィール情報を追加
    themeItems = themeItems.map((item) => ({
      ...item,
      profiles: profilesMap[item.user_id] || {
        name: "名無しユーザー",
        avatar_url: null,
      },
    }));
  }

  // 削除後のリフレッシュ用関数
  async function refreshThemePage() {
    "use server";
    revalidatePath(`/theme/${decodedName}`);
  }

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
          <h2 className="font-bold text-xl mb-6">
            みんなのコレクション ({themeItems.length})
          </h2>

          <div className="mt-4 max-h-[30vh] overflow-y-auto pr-2">
            {themeItems.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {themeItems.map((item) => (
                  <CollectionItem
                    key={item.id}
                    item={item}
                    currentUserId={user?.id || null}
                    onDelete={refreshThemePage}
                    allItems={themeItems}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-gray-500 dark:text-gray-400">
                まだコレクションがありません。最初の投稿をしてみましょう！
              </div>
            )}
          </div>

          {/* コレクション投稿フォーム */}
          <div className="mt-8">
            <h3 className="font-bold text-lg mb-4">コレクションを投稿</h3>
            {user ? (
              <ThemeForm
                themeId={themeData?.id || ""}
                userId={user.id}
                themeName={decodedName}
                themePath={`/theme/${name}`}
              />
            ) : (
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
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
        </div>
      </div>
    </Suspense>
  );
};

export default ThemePage;
