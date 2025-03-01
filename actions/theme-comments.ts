"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// テーマコメント作成のスキーマ
const ThemeCommentSchema = z.object({
  content: z.string().min(1, { message: "コメントを入力してください" }),
});

// テーマコメント作成の型定義
interface NewThemeCommentProps {
  content: string;
  themeId: string;
  userId: string;
}

// テーマコメント作成
export async function newThemeComment(values: NewThemeCommentProps) {
  try {
    // 入力値の検証
    const validatedContent = ThemeCommentSchema.parse({ content: values.content });

    const supabase = await createClient();

    // コメントの作成
    const { error: commentError } = await supabase.from("theme_comments").insert({
      content: validatedContent.content,
      theme_id: values.themeId,
      user_id: values.userId,
    });

    if (commentError) {
      return {
        error: "コメントの作成に失敗しました",
      };
    }

    // キャッシュのクリア
    revalidatePath(`/theme/${values.themeId}`);

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

// テーマコメント削除の型定義
interface DeleteThemeCommentProps {
  commentId: string;
  themeId: string;
  userId: string;
}

// テーマコメント削除
export async function deleteThemeComment(values: DeleteThemeCommentProps) {
  try {
    const supabase = await createClient();

    // コメントの取得
    const { data: commentData, error: commentError } = await supabase
      .from("theme_comments")
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
      .from("theme_comments")
      .delete()
      .eq("id", values.commentId);

    if (deleteError) {
      return {
        error: "コメントの削除に失敗しました",
      };
    }

    // キャッシュのクリア
    revalidatePath(`/theme/${values.themeId}`);

    return { success: "コメントを削除しました" };
  } catch (error: unknown) {
    console.error("コメント削除エラー:", error);
    return {
      error: "エラーが発生しました",
    };
  }
}

// テーマコメント取得
export async function getThemeComments(themeId: string) {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("theme_comments")
      .select(`
        *,
        profiles (
          id,
          name,
          avatar_url
        )
      `)
      .eq("theme_id", themeId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("テーマコメント取得エラー:", error);
      return { error: "コメントの取得に失敗しました" };
    }

    return { data };
  } catch (error) {
    console.error("テーマコメント取得エラー:", error);
    return { error: "エラーが発生しました" };
  }
}
