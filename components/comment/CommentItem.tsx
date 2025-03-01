"use client";

import { useState, useTransition, useEffect } from "react";
import { CommentType } from "@/types";
import { format } from "date-fns";
import { Loader2, Trash2, X, ChevronLeft, ChevronRight } from "lucide-react";
import { deleteComment } from "@/actions/comment";
import Image from "next/image";
import toast from "react-hot-toast";

interface CommentItemProps {
  comment: CommentType;
  currentUserId: string | undefined;
  blogId: string;
  comments: CommentType[];
  index: number;
}

const CommentItem = ({
  comment,
  currentUserId,
  blogId,
  comments,
  index,
}: CommentItemProps) => {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(index);
  const [slideDirection, setSlideDirection] = useState<"left" | "right" | null>(
    null
  );

  // 自分のコメントかどうか
  const isMyComment = currentUserId === comment.user_id;
  const currentComment = comments[currentIndex];

  // スライド方向を監視して、アニメーションをリセット
  useEffect(() => {
    if (slideDirection) {
      const timer = setTimeout(() => {
        setSlideDirection(null);
      }, 300); // アニメーション時間と同じ
      return () => clearTimeout(timer);
    }
  }, [slideDirection]);

  // コメント削除
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation(); // モーダルが開かないようにする

    if (!window.confirm("コメントを削除しますか？")) {
      return;
    }

    setError("");

    startTransition(async () => {
      try {
        if (!currentUserId) {
          setError("ログインが必要です");
          return;
        }

        const result = await deleteComment({
          commentId: currentComment.id,
          blogId,
          userId: currentUserId,
        });

        if (result?.error) {
          setError(result.error);
          return;
        }

        toast.success("コメントを削除しました");
        closeModal();
      } catch (error) {
        console.error(error);
        setError("エラーが発生しました");
      }
    });
  };

  // モーダルを開く
  const openModal = () => {
    setCurrentIndex(index);
    setIsModalOpen(true);
    // スクロールを無効にする
    document.body.style.overflow = "hidden";
  };

  // モーダルを閉じる
  const closeModal = () => {
    setIsModalOpen(false);
    // スクロールを有効にする
    document.body.style.overflow = "auto";
  };

  // 前のコメントに移動
  const goToPrevious = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentIndex > 0) {
      setSlideDirection("right"); // 右からスライドイン（前に戻る）
      setCurrentIndex(currentIndex - 1);
    }
  };

  // 次のコメントに移動
  const goToNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentIndex < comments.length - 1) {
      setSlideDirection("left"); // 左からスライドイン（次に進む）
      setCurrentIndex(currentIndex + 1);
    }
  };

  // 現在のコメントの作成者かどうか
  const isCurrentCommentMine = currentUserId === currentComment?.user_id;

  // スライドアニメーションのクラスを取得
  const getSlideAnimationClass = () => {
    if (!slideDirection) return "";
    return slideDirection === "left" ? "slide-left" : "slide-right";
  };

  return (
    <>
      <div
        className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 h-full flex flex-col cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition"
        onClick={openModal}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            <Image
              src={comment.profiles?.avatar_url || "/avator-default.webp"}
              alt="ユーザーアバター"
              width={40}
              height={40}
              className="rounded-full aspect-square"
            />
            <div>
              <p className="font-semibold">
                {comment.profiles?.name || "ユーザー"}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {format(new Date(comment.created_at), "yyyy/MM/dd HH:mm")}
              </p>
            </div>
          </div>

          {isMyComment && (
            <button
              onClick={handleDelete}
              disabled={isPending}
              className="text-red-500 hover:text-red-700 transition"
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
            </button>
          )}
        </div>

        <div
          className="mt-4 flex-grow prose prose-sm max-w-none line-clamp-3 overflow-hidden pl-4 dark:prose-invert"
          dangerouslySetInnerHTML={{ __html: comment.content }}
        />

        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      </div>

      {/* モーダル */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 flex flex-col h-full">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <Image
                    src={
                      currentComment.profiles?.avatar_url ||
                      "/avator-default.webp"
                    }
                    alt="ユーザーアバター"
                    width={50}
                    height={50}
                    className="rounded-full aspect-square"
                  />
                  <div>
                    <p className="font-bold text-lg">
                      {currentComment.profiles?.name || "ユーザー"}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {format(
                        new Date(currentComment.created_at),
                        "yyyy/MM/dd HH:mm"
                      )}
                    </p>
                  </div>
                </div>
                <button onClick={closeModal} className="modal-close-button">
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div
                className={`mt-4 prose prose-sm max-w-none flex-grow overflow-y-auto pl-4 dark:prose-invert ${getSlideAnimationClass()}`}
                dangerouslySetInnerHTML={{ __html: currentComment.content }}
                style={{ alignSelf: "flex-start" }}
              />

              {isCurrentCommentMine && (
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={handleDelete}
                    disabled={isPending}
                    className="flex items-center space-x-1 text-red-500 hover:text-red-700 transition"
                  >
                    {isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-1" />
                    ) : (
                      <Trash2 className="h-4 w-4 mr-1" />
                    )}
                    <span>削除</span>
                  </button>
                </div>
              )}

              {/* ページネーション表示 - 矢印を追加 */}
              <div className="modal-pagination">
                <button
                  onClick={goToPrevious}
                  className={`modal-pagination-button ${
                    currentIndex <= 0
                      ? "opacity-0 cursor-not-allowed"
                      : "opacity-100"
                  }`}
                  disabled={currentIndex <= 0}
                >
                  <ChevronLeft className="h-4 w-4 text-gray-700 dark:text-gray-300" />
                </button>

                <div className="modal-pagination-counter">
                  {currentIndex + 1} / {comments.length}
                </div>

                <button
                  onClick={goToNext}
                  className={`modal-pagination-button ${
                    currentIndex >= comments.length - 1
                      ? "opacity-0 cursor-not-allowed"
                      : "opacity-100"
                  }`}
                  disabled={currentIndex >= comments.length - 1}
                >
                  <ChevronRight className="h-4 w-4 text-gray-700 dark:text-gray-300" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CommentItem;
