"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// テーマの取得
export const getThemes = async () => {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from("themes")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return { error: error.message };
    }

    // 指定されたIDのテーマを優先的に表示するように並べ替え
    const priorityThemeIds = [
      "ab51c039-62ff-49a0-97e6-6369fecd77b0",
      "c723eddb-2bf2-4593-b40d-8fe92b22defe"
    ];

    if (data) {
      // 優先テーマとそれ以外のテーマに分ける
      const priorityThemes = data.filter(theme => priorityThemeIds.includes(theme.id));
      const otherThemes = data.filter(theme => !priorityThemeIds.includes(theme.id));

      // 優先テーマを先頭に、それ以外のテーマを後ろに配置
      const sortedData = [...priorityThemes, ...otherThemes];
      return { data: sortedData };
    }

    return { data };
  } catch (error) {
    console.error(error);
    return { error: "テーマの取得に失敗しました" };
  }
};

// テーマの詳細取得
export const getThemeById = async (themeId: string) => {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from("themes")
      .select("*")
      .eq("id", themeId)
      .single();

    if (error) {
      return { error: error.message };
    }

    return { data };
  } catch (error) {
    console.error(error);
    return { error: "テーマの取得に失敗しました" };
  }
};

// テーマの作成
const ThemeSchema = z.object({
  name: z.string().min(1, "テーマ名は必須です"),
  description: z.string().optional(),
  image_url: z.string().optional(),
});

export type NewThemeProps = z.infer<typeof ThemeSchema>;

export const createTheme = async (formData: NewThemeProps) => {
  const supabase = await createClient();

  // バリデーション
  const validatedFields = ThemeSchema.safeParse(formData);
  if (!validatedFields.success) {
    return { error: "入力内容が正しくありません" };
  }

  try {
    const { data, error } = await supabase
      .from("themes")
      .insert([
        {
          name: formData.name,
          description: formData.description || null,
          image_url: formData.image_url || null,
        },
      ])
      .select()
      .single();

    if (error) {
      return { error: error.message };
    }

    revalidatePath("/");
    return { data };
  } catch (error) {
    console.error(error);
    return { error: "テーマの作成に失敗しました" };
  }
};

// テーマアイテムの取得
export const getThemeItems = async (themeId: string) => {
  const supabase = await createClient();

  try {
    // まずテーマIDを取得
    const { data: themeData, error: themeError } = await supabase
      .from("themes")
      .select("id")
      .eq("name", themeId)
      .single();

    if (themeError) {
      return { error: themeError.message };
    }

    // テーマIDを使ってアイテムを取得
    const { data, error } = await supabase
      .from("theme_items")
      .select("*")
      .eq("theme_id", themeData.id)
      .order("created_at", { ascending: true });

    if (error) {
      return { error: error.message };
    }

    // プロフィール情報を別途取得
    if (data && data.length > 0) {
      const userIds = data.map(item => item.user_id);
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("id, name, avatar_url")
        .in("id", userIds);

      if (profilesError) {
        return { error: profilesError.message };
      }

      // プロフィール情報をマージ
      if (profilesData) {
        const profilesMap: Record<string, { id: string, name: string, avatar_url: string | null }> = {};

        profilesData.forEach(profile => {
          profilesMap[profile.id] = profile;
        });

        data.forEach(item => {
          item.profiles = profilesMap[item.user_id] || { name: "不明", avatar_url: null };
        });
      }
    }

    return { data };
  } catch (error) {
    console.error("テーマアイテム取得エラー:", error);
    return { error: "テーマアイテムの取得に失敗しました" };
  }
};

// テーマアイテムの作成
const ThemeItemSchema = z.object({
  content: z.string().min(1, "内容は必須です"),
  list: z.string().optional(),
  theme_id: z.string().min(1, "テーマIDは必須です"),
  user_id: z.string().min(1, "ユーザーIDは必須です"),
  themePath: z.string().optional(),
});

export type NewThemeItemProps = z.infer<typeof ThemeItemSchema>;

export const createThemeItem = async (formData: NewThemeItemProps) => {
  const supabase = await createClient();

  // バリデーション
  const validatedFields = ThemeItemSchema.safeParse(formData);
  if (!validatedFields.success) {
    return { error: "入力内容が正しくありません" };
  }

  try {
    // テーマ名からIDを取得する必要があるか確認
    let themeId = formData.theme_id;

    // UUIDの形式でない場合はテーマ名と判断してIDを取得
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(themeId)) {
      const { data: themeData, error: themeError } = await supabase
        .from("themes")
        .select("id")
        .eq("name", themeId)
        .single();

      if (themeError) {
        return { error: themeError.message };
      }

      themeId = themeData.id;
    }

    const { data, error } = await supabase
      .from("theme_items")
      .insert([
        {
          content: formData.content,
          list: formData.list || null,
          theme_id: themeId,
          user_id: formData.user_id,
        },
      ])
      .select()
      .single();

    if (error) {
      return { error: error.message };
    }

    // テーマ詳細ページのパスを追加で再検証
    if (formData.themePath) {
      revalidatePath(formData.themePath);
    }
    revalidatePath(`/?theme=${formData.theme_id}`);
    return { data };
  } catch (error) {
    console.error("テーマアイテム作成エラー:", error);
    return { error: "テーマアイテムの作成に失敗しました" };
  }
};

// テーマアイテムの削除
export const deleteThemeItem = async ({
  itemId,
  userId,
}: {
  itemId: string;
  userId: string;
}) => {
  const supabase = await createClient();

  try {
    // 自分のテーマアイテムかチェック
    const { data: item, error: fetchError } = await supabase
      .from("theme_items")
      .select("*")
      .eq("id", itemId)
      .single();

    if (fetchError) {
      return { error: fetchError.message };
    }

    if (item.user_id !== userId) {
      return { error: "削除権限がありません" };
    }

    // 削除実行
    const { error: deleteError } = await supabase
      .from("theme_items")
      .delete()
      .eq("id", itemId);

    if (deleteError) {
      return { error: deleteError.message };
    }

    revalidatePath(`/?theme=${item.theme_id}`);
    return { success: true };
  } catch (error) {
    console.error("テーマアイテム削除エラー:", error);
    return { error: "テーマアイテムの削除に失敗しました" };
  }
};
