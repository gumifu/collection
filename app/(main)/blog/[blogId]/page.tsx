import { createClient } from "@/utils/supabase/server";
import { Suspense } from "react";
import BlogDetail from "@/components/blog/BlogDetail";
import Loading from "@/app/loading";

type PageProps = {
  params: Promise<{ blogId: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function BlogDetailPage(props: PageProps) {
  const params = await props.params;
  const { blogId } = params;
  const supabase = await createClient();

  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;

  // ブログ詳細取得
  const { data: blogData } = await supabase
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

  if (!blogData) {
    return <div className="text-center">ブログが存在しません</div>;
  }

  // ログインユーザーがブログ作成者かどうか
  const isMyBlog = user?.id === blogData.user_id;

  return (
    <Suspense fallback={<Loading />}>
      <BlogDetail blog={blogData} isMyBlog={isMyBlog} />
    </Suspense>
  );
}
