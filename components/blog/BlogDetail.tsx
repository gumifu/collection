"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { BlogType } from "@/types";
import { format } from "date-fns";
import { FilePenLine, Loader2, Trash2 } from "lucide-react";
import { deleteBlog } from "@/actions/blog";
import FormError from "@/components/auth/FormError";
import Image from "next/image";
import Link from "next/link";
import toast from "react-hot-toast";

interface BlogDetailProps {
  blog: BlogType & {
    profiles: {
      name: string;
      avatar_url: string | null;
      introduce: string | null;
    };
  };
  isMyBlog: boolean;
}

const BlogDetail = ({ blog, isMyBlog }: BlogDetailProps) => {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  // コレクション削除
  const handleDelete = async () => {
    if (!window.confirm("本当に削除しますか？")) {
      return;
    }

    setError("");

    startTransition(async () => {
      try {
        const res = await deleteBlog({
          blogId: blog.id,
          imageUrl: blog.image_url,
          userId: blog.user_id,
        });

        if (res?.error) {
          setError(res.error);
          return;
        }

        toast.success("コレクションを削除しました");
        router.push("/");
        router.refresh();
      } catch (error) {
        console.error(error);
        setError("エラーが発生しました");
      }
    });
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
      <div className="col-span-1 sm:col-span-2 space-y-5 order-first">
        <div>
          <Image
            src={blog.image_url || "/noImage.webp"}
            className="rounded object-cover"
            alt="image"
            width={768}
            height={432}
            priority
          />
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {format(new Date(blog.updated_at), "yyyy/MM/dd HH:mm")}
        </div>
        <div className="font-bold text-2xl">{blog.title}</div>
        <div className="leading-relaxed break-words whitespace-pre-wrap">
          {blog.content}
        </div>

        {blog.list && blog.list.trim() !== "" && (
          <div className="mt-4">
            {/* <h3 className="font-bold text-lg mb-2">リスト</h3> */}
            <div
              className="prose prose-sm max-w-none dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: blog.list }}
            />
          </div>
        )}

        {isMyBlog && (
          <div className="flex items-center justify-end space-x-3">
            <Link href={`/blog/${blog.id}/edit`}>
              <FilePenLine className="w-6 h-6" />
            </Link>
            <button
              className="cursor-pointer"
              onClick={handleDelete}
              disabled={isPending}
            >
              {isPending ? (
                <Loader2 className="h-6 w-6 animate-spin text-red-500" />
              ) : (
                <Trash2 className="w-6 h-6 text-red-500" />
              )}
            </button>
          </div>
        )}

        <FormError message={error} />
      </div>

      <div className="col-span-1 order-last md:order-none">
        <div className="md:sticky md:top-4">
          <Link
            href={`/profile/${blog.user_id}`}
            className="hover:opacity-80 transition-opacity block"
          >
            <div className="border rounded flex flex-col items-center justify-center space-y-2 p-5 dark:border-gray-700 dark:bg-gray-800">
              <Image
                src={blog.profiles.avatar_url || "/avator-default.webp"}
                className="rounded-full object-cover aspect-square"
                alt="avatar"
                width={100}
                height={100}
                priority
              />

              <div className="font-bold font-yugothic">
                {blog.profiles.name || "No Name"}
              </div>

              {blog.profiles.introduce && (
                <p className="text-gray-600 dark:text-gray-300 mt-1">
                  {blog.profiles.introduce}
                </p>
              )}
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BlogDetail;
