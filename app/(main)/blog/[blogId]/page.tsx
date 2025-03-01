import { createClient } from "@/utils/supabase/server";
import { Suspense } from "react";
import BlogDetail from "@/components/blog/BlogDetail";
import Loading from "@/app/loading";
import { notFound } from "next/navigation";
import CommentSection from "@/components/comment/CommentSection";
import { CommentType } from "@/types";

type Params = Promise<{ blogId: string }>;

export default async function BlogDetailPage({ params }: { params: Params }) {
  try {
    const resolvedParams = await params;
    const { blogId } = resolvedParams;
    const supabase = await createClient();

    // ユーザー情報の取得（ログインしていなくてもエラーにならないように修正）
    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;

    // ブログ詳細取得
    const { data: blogData, error: blogError } = await supabase
      .from("blogs")
      .select(
        `
        *,
        profiles (
          name,
          avatar_url,
          introduce
        )
      `
      )
      .eq("id", blogId)
      .single();

    if (blogError) {
      console.error("ブログ取得エラー:", blogError);
      throw new Error("ブログの取得に失敗しました");
    }

    if (!blogData) {
      return notFound();
    }

    // コメント一覧取得
    let comments: CommentType[] = [];
    try {
      // コメントのみを取得
      const { data: commentsData, error: commentsError } = await supabase
        .from("comments")
        .select("*")
        .eq("blog_id", blogId)
        .order("created_at", { ascending: true });

      if (commentsError) {
        console.error("コメント取得エラー:", commentsError);
      } else if (commentsData && commentsData.length > 0) {
        // コメントが存在する場合、プロフィール情報を取得
        const userIds = [
          ...new Set(commentsData.map((comment) => comment.user_id)),
        ];

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

        // コメントにプロフィール情報を追加
        comments = commentsData.map((comment) => ({
          ...comment,
          profiles: profilesMap[comment.user_id] || {
            name: "ユーザー",
            avatar_url: null,
          },
        }));
      }
    } catch (error) {
      console.error("コメント取得中にエラーが発生しました:", error);
      // エラーが発生しても処理を続行
    }

    // ログインユーザーがブログ作成者かどうか（ログインしていない場合はfalse）
    const isMyBlog = user ? user.id === blogData.user_id : false;

    return (
      <Suspense fallback={<Loading />}>
        <BlogDetail blog={blogData} isMyBlog={isMyBlog} />
        <CommentSection
          comments={comments}
          blogId={blogId}
          currentUserId={user?.id}
        />
      </Suspense>
    );
  } catch (error) {
    console.error("予期せぬエラーが発生しました:", error);
    throw error; // Next.jsのエラーページにリダイレクト
  }
}
