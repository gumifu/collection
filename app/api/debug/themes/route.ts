import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from("themes")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("テーマ取得エラー:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log("テーマ取得結果:", data);
    return NextResponse.json({ data: data || [] });
  } catch (error) {
    console.error("テーマ取得例外:", error);
    return NextResponse.json({ error: "テーマの取得に失敗しました" }, { status: 500 });
  }
}
