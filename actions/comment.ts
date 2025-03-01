"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// コメント作成のスキーマ
const CommentSchema = z.object({
  content: z.string().min(1, { message: "コメントを入力してください" }),
});

// コメント作成の型定義
interface NewCommentProps {
  content: string;
  blogId: string;
  userId: string;
}

// コメント作成
export async function newComment(values: NewCommentProps) {
  try {
    // 入力値の検証
    const validatedContent = CommentSchema.parse({ content: values.content });

    const supabase = await createClient();

    // コメントの作成
    const { error: commentError } = await supabase.from("comments").insert({
      content: validatedContent.content,
      blog_id: values.blogId,
      user_id: values.userId,
    });

    if (commentError) {
      return {
        error: "コメントの作成に失敗しました",
      };
    }

    // キャッシュのクリア
    revalidatePath(`/blog/${values.blogId}`);

    return { success: "コメントを作成しました" };
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return {
        error: "コメントの入力内容が正しくありません",
      };
    }
    console.error("コメント作成エラー:", error);
    return {
      error: "エラーが発生しました",
    };
  }
}

// コメント削除の型定義
interface deleteCommentProps {
  commentId: string;
  blogId: string;
  userId: string;
}

// コメント削除
export async function deleteComment(values: deleteCommentProps) {
  try {
    const supabase = await createClient();

    // コメントの取得
    const { data: commentData, error: commentError } = await supabase
      .from("comments")
      .select("user_id")
      .eq("id", values.commentId)
      .single();

    if (commentError) {
      return {
        error: "コメントの取得に失敗しました",
      };
    }

    // 自分のコメントかどうかチェック
    if (commentData.user_id !== values.userId) {
      return {
        error: "他のユーザーのコメントは削除できません",
      };
    }

    // コメントの削除
    const { error: deleteError } = await supabase
      .from("comments")
      .delete()
      .eq("id", values.commentId);

    if (deleteError) {
      return {
        error: "コメントの削除に失敗しました",
      };
    }

    // キャッシュのクリア
    revalidatePath(`/blog/${values.blogId}`);

    return { success: "コメントを削除しました" };
  } catch (error: unknown) {
    console.error("コメント削除エラー:", error);
    return {
      error: "エラーが発生しました",
    };
  }
}
