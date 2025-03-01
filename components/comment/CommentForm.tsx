"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { newComment } from "@/actions/comment";
import { Loader2 } from "lucide-react";
import FormError from "@/components/auth/FormError";
import toast from "react-hot-toast";
import TipTapEditor from "@/components/blog/TipTapEditor";

interface CommentFormProps {
  blogId: string;
  userId: string;
}

// コメント作成の型定義
interface NewCommentProps {
  content: string;
  blogId: string;
  userId: string;
}

// コメント入力の型定義
const commentFormSchema = z.object({
  content: z.string().min(1, { message: "コメントを入力してください" }),
});

type CommentFormValues = z.infer<typeof commentFormSchema>;

const CommentForm = ({ blogId, userId }: CommentFormProps) => {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [editorContent, setEditorContent] = useState("");

  const {
    handleSubmit,
    setValue,
    formState: { errors },
    reset,
  } = useForm<CommentFormValues>({
    resolver: zodResolver(commentFormSchema),
    defaultValues: {
      content: "",
    },
  });

  // エディターの内容が変更されたときに呼び出される
  const handleEditorChange = (content: string) => {
    setEditorContent(content);
    setValue("content", content, { shouldValidate: true });
  };

  // コメント投稿
  const onSubmit = async (data: CommentFormValues) => {
    setError("");

    startTransition(async () => {
      try {
        const commentData: NewCommentProps = {
          content: data.content,
          blogId,
          userId,
        };

        const result = await newComment(commentData);

        if (result?.error) {
          setError(result.error);
          return;
        }

        // フォームのリセット
        reset();
        setEditorContent("");
        toast.success("コメントを投稿しました");
      } catch (error) {
        console.error(error);
        setError("エラーが発生しました");
      }
    });
  };

  return (
    <div className="mt-8">
      <h3 className="font-bold text-lg mb-4">コメントを投稿</h3>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <TipTapEditor content={editorContent} onChange={handleEditorChange} />
          {errors.content && (
            <p className="text-red-500 text-sm mt-1">
              {errors.content.message}
            </p>
          )}
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isPending}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-70 transition"
          >
            {isPending ? (
              <div className="flex items-center">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                送信中...
              </div>
            ) : (
              "コメントを投稿"
            )}
          </button>
        </div>

        <FormError message={error} />
      </form>
    </div>
  );
};

export default CommentForm;
