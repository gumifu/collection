import type { Metadata } from "next";
import { Suspense } from "react";
import Loading from "@/app/loading";

export const metadata: Metadata = {
  title: "全てのテーマ | Collection Case",
  description:
    "Collection Caseの全てのテーマ一覧です。様々なテーマのコレクションを探索しましょう。",
};

export default function ThemesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<Loading />}>
      <main className="min-h-screen py-6">{children}</main>
    </Suspense>
  );
}
