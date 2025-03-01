"use client";

import { useState, useTransition } from "react";
import { newThemeComment } from "@/actions/theme-comments";
import { useRouter } from "next/navigation";
import FormError from "@/components/auth/FormError";
import toast from "react-hot-toast";

interface ThemeCommentFormProps {
  themeId: string;
  userId: string;
}

const ThemeCommentForm = ({ themeId, userId }: ThemeCommentFormProps) => {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!content.trim()) {
      setError("コメントを入力してください");
      return;
    }

    startTransition(async () => {
      try {
        const res = await newThemeComment({
          content,
          themeId,
          userId,
        });

        if (res?.error) {
          setError(res.error);
          return;
        }

        // 成功時の処理
        setContent("");
        toast.success("コメントを投稿しました");
        router.refresh();
      } catch (error) {
        console.error("コメント投稿エラー:", error);
        setError("エラーが発生しました");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6">
      <div className="mb-4">
        <textarea
          className="w-full p-3 border rounded-md dark:bg-gray-700 dark:border-gray-600"
          rows={3}
          placeholder="コメントを入力してください"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={isPending}
        />
      </div>

      <FormError message={error} />

      <button
        type="submit"
        disabled={isPending}
        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? "投稿中..." : "コメントを投稿"}
      </button>
    </form>
  );
};

export default ThemeCommentForm;
