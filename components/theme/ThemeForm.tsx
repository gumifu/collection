"use client";

import { useState, useTransition } from "react";
import { createThemeItem } from "@/actions/theme";
import { useRouter } from "next/navigation";
import FormError from "@/components/auth/FormError";
import ListOnlyEditor from "@/components/blog/ListOnlyEditor";
import toast from "react-hot-toast";

interface ThemeFormProps {
  themeId: string;
  userId: string;
  themeName: string;
  themePath?: string;
}

const ThemeForm = ({
  themeId,
  userId,
  themeName,
  themePath,
}: ThemeFormProps) => {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [list, setList] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  // 投稿処理
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!content.trim()) {
      setError("内容を入力してください");
      return;
    }

    startTransition(async () => {
      try {
        console.log("投稿開始:", { content, list, themeId, userId });
        const res = await createThemeItem({
          content,
          list,
          theme_id: themeId,
          user_id: userId,
          themePath,
        });

        if (res?.error) {
          console.error("投稿エラー:", res.error);
          setError(res.error);
          return;
        }

        console.log("投稿成功:", res);
        // 成功時の処理
        setContent("");
        setList("");
        toast.success("投稿しました");
        router.refresh();
      } catch (error) {
        console.error("投稿例外:", error);
        setError("エラーが発生しました");
      }
    });
  };

  return (
    <div className="mt-8">
      <h3 className="font-medium mb-4">あなたのコレクションを投稿</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="mb-4">
            <textarea
              className="w-full p-3 border rounded-md dark:bg-gray-700 dark:border-gray-600"
              rows={4}
              placeholder={`あなたの好きな${themeName}を共有しましょう...`}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={isPending}
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              リスト（箇条書き）
            </label>
            <div className="border rounded-md overflow-hidden">
              <ListOnlyEditor content={list} onChange={setList} />
            </div>
          </div>

          <FormError message={error} />

          <button
            type="submit"
            disabled={isPending}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? "投稿中..." : "投稿する"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ThemeForm;
