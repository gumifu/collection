import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import Loading from "@/app/loading";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import CollectionItem from "@/components/theme/CollectionItem";
import { revalidatePath } from "next/cache";
import { format } from "date-fns";

// ページを動的にレンダリングするように設定
export const dynamic = "force-dynamic";

// 統合コレクションアイテムの型定義
interface CollectionContent {
  id: string;
  content: string;
  title?: string;
  image_url?: string | null;
  list?: string | null;
  user_id: string;
  created_at: string;
  updated_at?: string;
  theme_id?: string;
  blog_id?: string;
  type: "theme_item" | "blog" | "comment";
  themes?: {
    id: string;
    name: string;
    image_url: string | null;
  };
  blogs?: {
    title: string;
  };
  profiles: {
    name: string;
    avatar_url: string | null;
  };
}

// マイコレクションページ
export default async function MyCollectionsPage() {
  const supabase = await createClient();

  // ログインユーザー情報を取得
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const user = session?.user;

  // 未ログインの場合はログインページにリダイレクト
  if (!user) {
    redirect("/login");
  }

  // ユーザーのプロフィール情報を取得
  const { data: profileData } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // ユーザーが投稿したブログを取得
  const { data: blogsData, error: blogsError } = await supabase
    .from("blogs")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (blogsError) {
    console.error("ブログ取得エラー:", blogsError);
  }

  // ユーザーが投稿したコメントを取得
  const { data: commentsData, error: commentsError } = await supabase
    .from("comments")
    .select("*, blogs(title)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (commentsError) {
    console.error("コメント取得エラー:", commentsError);
  }

  // ユーザーが投稿したコレクションを取得
  const { data: themeItemsData, error: themeItemsError } = await supabase
    .from("theme_items")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (themeItemsError) {
    console.error("コレクション取得エラー:", themeItemsError);
  }

  // テーマIDを抽出
  const themeIds = themeItemsData
    ? [...new Set(themeItemsData.map((item) => item.theme_id))]
    : [];

  // テーマ情報を取得
  const { data: themesData } = await supabase
    .from("themes")
    .select("id, name, image_url")
    .in("id", themeIds);

  // テーマ情報をマップ
  const themesMap = themesData
    ? themesData.reduce((acc, theme) => {
        acc[theme.id] = theme;
        return acc;
      }, {} as Record<string, { id: string; name: string; image_url: string | null }>)
    : {};

  // テーマアイテムを統合コレクションに変換
  const themeItemsCollection: CollectionContent[] = themeItemsData
    ? themeItemsData.map(
        (item: {
          id: string;
          content: string;
          list: string | null;
          user_id: string;
          theme_id: string;
          created_at: string;
        }) => ({
          ...item,
          type: "theme_item",
          themes: themesMap[item.theme_id] || {
            id: item.theme_id,
            name: "不明なテーマ",
            image_url: null,
          },
          profiles: {
            name: profileData?.name || "名無しユーザー",
            avatar_url: profileData?.avatar_url || null,
          },
        })
      )
    : [];

  // ブログを統合コレクションに変換
  const blogsCollection: CollectionContent[] = blogsData
    ? blogsData.map(
        (blog: {
          id: string;
          title: string;
          content: string;
          image_url: string | null;
          user_id: string;
          created_at: string;
          updated_at: string;
          list: string | null;
        }) => ({
          ...blog,
          type: "blog",
          profiles: {
            name: profileData?.name || "名無しユーザー",
            avatar_url: profileData?.avatar_url || null,
          },
        })
      )
    : [];

  // コメントを統合コレクションに変換
  const commentsCollection: CollectionContent[] = commentsData
    ? commentsData.map(
        (comment: {
          id: string;
          content: string;
          user_id: string;
          blog_id: string;
          created_at: string;
          blogs: {
            title: string;
          };
        }) => ({
          ...comment,
          type: "comment",
          profiles: {
            name: profileData?.name || "名無しユーザー",
            avatar_url: profileData?.avatar_url || null,
          },
        })
      )
    : [];

  // 全てのコンテンツを統合して日付順にソート
  const allCollections = [
    ...themeItemsCollection,
    ...blogsCollection,
    ...commentsCollection,
  ].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  // 削除後のリフレッシュ用関数
  async function refreshCollectionsPage() {
    "use server";
    revalidatePath("/my-collections");
  }

  return (
    <Suspense fallback={<Loading />}>
      <div className="max-w-screen-lg mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">マイコレクション</h1>
          <Link href="/blog/new">
            <Button variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              新しいコレクションを作成
            </Button>
          </Link>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-8">
          <div className="flex items-center space-x-4">
            <Image
              src={profileData?.avatar_url || "/avator-default.webp"}
              alt="プロフィール画像"
              width={80}
              height={80}
              className="rounded-full aspect-square"
            />
            <div>
              <h2 className="text-xl font-bold">
                {profileData?.name || "名無しユーザー"}
              </h2>
              <div className="text-gray-600 dark:text-gray-400">
                <p>{allCollections.length}件のコレクション</p>
              </div>
            </div>
          </div>
        </div>

        {/* 統合コレクションセクション */}
        {allCollections.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allCollections.map((item) => (
              <div
                key={`${item.type}-${item.id}`}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
              >
                {/* テーマアイテム */}
                {item.type === "theme_item" && (
                  <CollectionItem
                    item={{
                      id: item.id,
                      content: item.content,
                      list: item.list || null,
                      user_id: item.user_id,
                      created_at: item.created_at,
                      profiles: item.profiles,
                    }}
                    currentUserId={user.id}
                    onDelete={refreshCollectionsPage}
                    allItems={themeItemsCollection.map((item) => ({
                      id: item.id,
                      content: item.content,
                      list: item.list || null,
                      user_id: item.user_id,
                      created_at: item.created_at,
                      profiles: item.profiles,
                    }))}
                  />
                )}

                {/* ブログ */}
                {item.type === "blog" && (
                  <Link href={`/blog/${item.id}`}>
                    <div className="aspect-video relative">
                      <Image
                        src={item.image_url || "/noImage.webp"}
                        alt={item.title || ""}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="p-4">
                      <div className="flex items-center mb-2">
                        <span className="bg-blue-100 text-blue-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300">
                          コレクション
                        </span>
                        <p className="text-gray-500 text-xs">
                          {format(
                            new Date(item.created_at),
                            "yyyy/MM/dd HH:mm"
                          )}
                        </p>
                      </div>
                      <h3 className="font-semibold mb-2">{item.title}</h3>
                      <div className="flex items-center mt-2">
                        <Image
                          src={
                            item.profiles.avatar_url || "/avator-default.webp"
                          }
                          alt="ユーザーアバター"
                          width={24}
                          height={24}
                          className="rounded-full mr-2"
                        />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {item.profiles.name}
                        </span>
                      </div>
                    </div>
                  </Link>
                )}

                {/* コメント */}
                {item.type === "comment" && (
                  <div>
                    <div className="aspect-video relative">
                      <Image
                        src="/noImage.webp"
                        alt="コメント画像"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="p-4">
                      <div className="flex items-center mb-2">
                        <span className="bg-green-100 text-green-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded dark:bg-green-900 dark:text-green-300">
                          コメント
                        </span>
                        <p className="text-gray-500 text-xs">
                          {format(
                            new Date(item.created_at),
                            "yyyy/MM/dd HH:mm"
                          )}
                        </p>
                      </div>
                      <Link
                        href={`/blog/${item.blog_id}`}
                        className="block mb-2"
                      >
                        <p className="text-sm text-blue-500 hover:underline">
                          ブログ: {item.blogs?.title}
                        </p>
                      </Link>
                      <p className="text-gray-700 dark:text-gray-300 mb-2">
                        {item.content}
                      </p>
                      <div className="flex items-center mt-2">
                        <Image
                          src={
                            item.profiles.avatar_url || "/avator-default.webp"
                          }
                          alt="ユーザーアバター"
                          width={24}
                          height={24}
                          className="rounded-full mr-2"
                        />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {item.profiles.name}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              まだコレクションがありません
            </p>
            <Link href="/blog/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                新しいコレクションを作成する
              </Button>
            </Link>
          </div>
        )}
      </div>
    </Suspense>
  );
}
