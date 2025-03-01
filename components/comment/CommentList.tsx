"use client";

import { CommentType } from "@/types";
import CommentItem from "./CommentItem";

interface CommentListProps {
  comments: CommentType[];
  currentUserId: string | undefined;
  blogId: string;
}

const CommentList = ({ comments, currentUserId, blogId }: CommentListProps) => {
  if (comments.length === 0) {
    return <p className="text-gray-500 mt-2">コメントはまだありません</p>;
  }

  return (
    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {comments.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          currentUserId={currentUserId}
          blogId={blogId}
        />
      ))}
    </div>
  );
};

export default CommentList;
