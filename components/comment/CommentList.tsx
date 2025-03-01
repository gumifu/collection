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
    <div className="mt-4 max-h-[30vh] overflow-y-auto pr-2">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {comments.map((comment, index) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            currentUserId={currentUserId}
            blogId={blogId}
            comments={comments}
            index={index}
          />
        ))}
      </div>
    </div>
  );
};

export default CommentList;
