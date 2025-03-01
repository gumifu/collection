"use client";

import { ThemeCommentType } from "@/types";
import ThemeCommentForm from "./ThemeCommentForm";
import ThemeCommentList from "./ThemeCommentList";
import Link from "next/link";

interface ThemeCommentSectionProps {
  comments: ThemeCommentType[];
  themeId: string;
  currentUserId: string | undefined;
}

const ThemeCommentSection = ({
  comments,
  themeId,
  currentUserId,
}: ThemeCommentSectionProps) => {
  return (
    <div className="mt-10 border-t pt-8">
      <h2 className="font-bold text-xl mb-6">
        みんなのコメント ({comments.length})
      </h2>

      <ThemeCommentList
        comments={comments}
        currentUserId={currentUserId}
        themeId={themeId}
      />

      {currentUserId ? (
        <ThemeCommentForm themeId={themeId} userId={currentUserId} />
      ) : (
        <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            コメントを投稿するにはログインが必要です
          </p>
          <Link
            href="/login"
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition inline-block"
          >
            ログインする
          </Link>
        </div>
      )}
    </div>
  );
};

export default ThemeCommentSection;
