import { createClient } from "@/utils/supabase/server";
import { Suspense } from "react";
import BlogDetail from "@/components/blog/BlogDetail";
import Loading from "@/app/loading";
import { notFound } from "next/navigation";

type Params = Promise<{ blogId: string }>;

export default async function BlogDetailPage({ params }: { params: Params }) {
  try {
    const resolvedParams = await params;
    const { blogId } = resolvedParams;
    const supabase = await createClient();

    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError) {
      console.error("認証エラー:", userError);
      throw new Error("認証に失敗しました");
    }

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

    // ログインユーザーがブログ作成者かどうか
    const isMyBlog = user?.id === blogData.user_id;

    return (
      <Suspense fallback={<Loading />}>
        <BlogDetail blog={blogData} isMyBlog={isMyBlog} />
      </Suspense>
    );
  } catch (error) {
    console.error("予期せぬエラー:", error);
    throw error; // Next.jsのエラーページにリダイレクト
  }
}
