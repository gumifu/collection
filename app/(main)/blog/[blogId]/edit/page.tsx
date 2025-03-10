import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import BlogEdit from "@/components/blog/BlogEdit";
import Loading from "@/app/loading";

type Params = Promise<{ blogId: string }>;

export default async function BlogEditPage({ params }: { params: Params }) {
  const resolvedParams = await params;
  const { blogId } = resolvedParams;
  const supabase = await createClient();

  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;

  if (!user) {
    redirect("/");
  }

  // コレクション詳細取得
  const { data: blogData } = await supabase
    .from("blogs")
    .select("*")
    .eq("id", blogId)
    .single();

  if (!blogData) {
    return <div className="text-center">コレクションが存在しません</div>;
  }

  // コレクション作成者とログインユーザーが一致しない場合
  if (blogData.user_id !== user.id) {
    redirect(`/blog/${blogData.id}`);
  }

  return (
    <Suspense fallback={<Loading />}>
      <BlogEdit blog={blogData} />
    </Suspense>
  );
}
