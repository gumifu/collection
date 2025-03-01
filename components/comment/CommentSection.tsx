"use client";

import { CommentType } from "@/types";
import CommentForm from "./CommentForm";
import CommentList from "./CommentList";
import Link from "next/link";

interface CommentSectionProps {
  comments: CommentType[];
  blogId: string;
  currentUserId: string | undefined;
}

const CommentSection = ({
  comments,
  blogId,
  currentUserId,
}: CommentSectionProps) => {
  return (
    <div className="mt-10 border-t pt-8">
      <h2 className="font-bold text-xl mb-6">コメント ({comments.length})</h2>

      <CommentList
        comments={comments}
        currentUserId={currentUserId}
        blogId={blogId}
      />

      {currentUserId ? (
        <CommentForm blogId={blogId} userId={currentUserId} />
      ) : (
        <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-gray-600 mb-4">
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

export default CommentSection;
