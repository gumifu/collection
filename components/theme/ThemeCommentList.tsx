"use client";

import { useState } from "react";
import { deleteThemeComment } from "@/actions/theme-comments";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { format } from "date-fns";
import toast from "react-hot-toast";

interface ThemeCommentType {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  theme_id: string;
  profiles: {
    id: string;
    name: string;
    avatar_url: string | null;
  };
}

interface ThemeCommentListProps {
  comments: ThemeCommentType[];
  currentUserId: string | undefined;
  themeId: string;
}

const ThemeCommentList = ({
  comments,
  currentUserId,
  themeId,
}: ThemeCommentListProps) => {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (commentId: string) => {
    if (!currentUserId || isDeleting) return;

    if (!confirm("コメントを削除しますか？")) return;

    setIsDeleting(true);

    try {
      const res = await deleteThemeComment({
        commentId,
        themeId,
        userId: currentUserId,
      });

      if (res?.error) {
        toast.error(res.error);
        return;
      }

      toast.success("コメントを削除しました");
      router.refresh();
    } catch (error) {
      console.error("コメント削除エラー:", error);
      toast.error("エラーが発生しました");
    } finally {
      setIsDeleting(false);
    }
  };

  if (comments.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        まだコメントがありません。最初のコメントを投稿してみましょう！
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {comments.map((comment) => (
        <div
          key={comment.id}
          className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <Image
                src={comment.profiles.avatar_url || "/avator-default.webp"}
                alt={comment.profiles.name}
                width={40}
                height={40}
                className="rounded-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">{comment.profiles.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {format(new Date(comment.created_at), "yyyy/MM/dd HH:mm")}
                  </p>
                </div>
                {currentUserId === comment.user_id && (
                  <button
                    onClick={() => handleDelete(comment.id)}
                    disabled={isDeleting}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    削除
                  </button>
                )}
              </div>
              <div className="mt-2 whitespace-pre-wrap break-words">
                {comment.content}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ThemeCommentList;
