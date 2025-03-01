import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const themeId = searchParams.get("themeId");

  if (!themeId) {
    return NextResponse.json({ error: "テーマIDが必要です" }, { status: 400 });
  }

  try {
    console.log("テーマアイテム取得リクエスト:", themeId);

    // まずテーマIDを取得
    const { data: themeData, error: themeError } = await supabase
      .from("themes")
      .select("id")
      .eq("name", themeId)
      .single();

    if (themeError) {
      console.error("テーマ検索エラー:", themeError);
      return NextResponse.json({ error: themeError.message }, { status: 500 });
    }

    console.log("テーマ検索結果:", themeData);

    // テーマIDを使ってアイテムを取得
    const { data, error } = await supabase
      .from("theme_items")
      .select(
        `
        *,
        profiles (
          name,
          avatar_url
        )
      `
      )
      .eq("theme_id", themeData.id)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("テーマアイテム取得エラー:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log("テーマアイテム取得結果:", data);
    return NextResponse.json({ data: data || [] });
  } catch (error) {
    console.error("テーマアイテム取得例外:", error);
    return NextResponse.json({ error: "テーマアイテムの取得に失敗しました" }, { status: 500 });
  }
}
