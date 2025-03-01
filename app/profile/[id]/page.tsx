import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { Metadata } from "next";

// メタデータ
export const metadata: Metadata = {
  title: "ユーザープロフィール",
};

// ユーザープロフィールページ
const ProfilePage = async ({ params }: { params: { id: string } }) => {
  const supabase = await createClient();

  // ユーザー情報を取得
  const { data: profileData, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", params.id)
    .single();

  // ユーザーが存在しない場合は404ページを表示
  if (profileError || !profileData) {
    notFound();
  }

  // ユーザーの投稿を取得
  const { data: blogs, error: blogsError } = await supabase
    .from("blogs")
    .select("id, title, content, image_url, created_at, updated_at")
    .eq("user_id", params.id)
    .order("created_at", { ascending: false });

  if (blogsError) {
    console.error(blogsError);
  }

  return (
    <div className="max-w-screen-md mx-auto p-4">
      <div className="bg-white rounded-lg p-6 pl-0 mt-6">
        <div className="flex items-center space-x-4 mb-6">
          <Image
            src={profileData.avatar_url || "/avator-default.webp"}
            alt="プロフィール画像"
            width={80}
            height={80}
            className="rounded-full aspect-square"
          />
          <div>
            <h1 className="text-2xl font-bold font-zenkaku">
              {profileData.name || "No Name"}
            </h1>
            {profileData.introduction && (
              <p className="text-gray-600 mt-1">{profileData.introduction}</p>
            )}
          </div>
        </div>
        <div className="text-sm">{profileData.introduce}</div>
      </div>

      <h2 className="text-xl font-bold mb-4 font-zenkaku">投稿記事</h2>

      {blogs && blogs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {blogs.map((blog) => (
            <div key={blog.id} className="border rounded-lg overflow-hidden">
              <Link href={`/blog/${blog.id}`}>
                <div className="aspect-video relative">
                  <Image
                    src={blog.image_url || "/noImage.webp"}
                    alt={blog.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-4">
                  <p className="text-gray-500 text-xs mb-2">
                    {format(new Date(blog.created_at), "yyyy/MM/dd HH:mm")}
                  </p>
                  <h3 className="font-semibold">{blog.title}</h3>
                </div>
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">投稿記事はありません</p>
      )}
    </div>
  );
};

export default ProfilePage;
