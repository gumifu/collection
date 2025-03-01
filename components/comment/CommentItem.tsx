"use client";

import { useState, useTransition } from "react";
import { CommentType } from "@/types";
import { format } from "date-fns";
import { Loader2, Trash2 } from "lucide-react";
import { deleteComment } from "@/actions/comment";
import Image from "next/image";
import toast from "react-hot-toast";

interface CommentItemProps {
  comment: CommentType;
  currentUserId: string | undefined;
  blogId: string;
}

const CommentItem = ({ comment, currentUserId, blogId }: CommentItemProps) => {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  // 自分のコメントかどうか
  const isMyComment = currentUserId === comment.user_id;

  // コメント削除
  const handleDelete = () => {
    if (!window.confirm("コメントを削除しますか？")) {
      return;
    }

    setError("");

    startTransition(async () => {
      try {
        if (!currentUserId) {
          setError("ログインが必要です");
          return;
        }

        const result = await deleteComment({
          commentId: comment.id,
          blogId,
          userId: currentUserId,
        });

        if (result?.error) {
          setError(result.error);
          return;
        }

        toast.success("コメントを削除しました");
      } catch (error) {
        console.error(error);
        setError("エラーが発生しました");
      }
    });
  };

  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200 h-full flex flex-col">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-2">
          <Image
            src={comment.profiles?.avatar_url || "/avator-default.webp"}
            alt="ユーザーアバター"
            width={40}
            height={40}
            className="rounded-full aspect-square"
          />
          <div>
            <p className="font-semibold">
              {comment.profiles?.name || "ユーザー"}
            </p>
            <p className="text-xs text-gray-500">
              {format(new Date(comment.created_at), "yyyy/MM/dd HH:mm")}
            </p>
          </div>
        </div>

        {isMyComment && (
          <button
            onClick={handleDelete}
            disabled={isPending}
            className="text-red-500 hover:text-red-700 transition"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </button>
        )}
      </div>

      <div
        className="mt-4 flex-grow prose prose-sm max-w-none"
        dangerouslySetInnerHTML={{ __html: comment.content }}
      />

      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </div>
  );
};

export default CommentItem;
