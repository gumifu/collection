import { createClient } from "@/utils/supabase/server";
import { Suspense } from "react";
import Loading from "@/app/loading";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import ThemeForm from "@/components/theme/ThemeForm";

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

  // テーマの詳細情報を取得（FV画像を含む）
  const { data: themeData } = await supabase
    .from("themes")
    .select("*")
    .eq("name", decodedName)
    .single();

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
                  <div
                    key={item.id}
                    className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 h-full flex flex-col cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        <Image
                          src={
                            item.profiles?.avatar_url || "/avator-default.webp"
                          }
                          alt="ユーザーアバター"
                          className="rounded-full aspect-square"
                          width={40}
                          height={40}
                        />
                        <div>
                          <p className="font-semibold">
                            {item.profiles?.name || "名無しユーザー"}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {format(
                              new Date(item.created_at),
                              "yyyy/MM/dd HH:mm"
                            )}
                          </p>
                        </div>
                      </div>
                      {user && user.id === item.user_id && (
                        <button className="text-red-500 hover:text-red-700 transition">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="lucide lucide-trash2 h-4 w-4"
                          >
                            <path d="M3 6h18"></path>
                            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                            <line x1="10" x2="10" y1="11" y2="17"></line>
                            <line x1="14" x2="14" y1="11" y2="17"></line>
                          </svg>
                        </button>
                      )}
                    </div>
                    <div className="mt-4 flex-grow prose prose-sm max-w-none line-clamp-3 overflow-hidden pl-4 dark:prose-invert">
                      <p>{item.content}</p>
                      {item.list && (
                        <div
                          className="mt-2"
                          dangerouslySetInnerHTML={{ __html: item.list }}
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                まだ投稿がありません。最初の投稿をしてみましょう！
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
