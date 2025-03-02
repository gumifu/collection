"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { format } from "date-fns";
import { Trash2, X, ChevronLeft, ChevronRight } from "lucide-react";
import { deleteThemeItem } from "@/actions/theme";
import toast from "react-hot-toast";

interface CollectionModalProps {
  item: {
    id: string;
    content: string;
    list: string | null;
    user_id: string;
    created_at: string;
    profiles: {
      name: string;
      avatar_url: string | null;
    };
  };
  isOpen: boolean;
  onClose: () => void;
  currentUserId: string | null;
  onDelete: () => void;
  allItems: Array<{
    id: string;
    content: string;
    list: string | null;
    user_id: string;
    created_at: string;
    profiles: {
      name: string;
      avatar_url: string | null;
    };
  }>;
}

const CollectionModal = ({
  item,
  isOpen,
  onClose,
  currentUserId,
  onDelete,
  allItems,
}: CollectionModalProps) => {
  const [currentIndex, setCurrentIndex] = useState(() => {
    return allItems.findIndex((i) => i.id === item.id);
  });

  // ESCキーでモーダルを閉じる
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      window.addEventListener("keydown", handleEsc);
    }

    return () => {
      window.removeEventListener("keydown", handleEsc);
    };
  }, [isOpen, onClose]);

  const currentItem = allItems[currentIndex] || item;
  const totalItems = allItems.length;

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < totalItems - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleDelete = async () => {
    if (!currentUserId || currentUserId !== currentItem.user_id) return;
    if (!window.confirm("本当に削除しますか？")) return;

    try {
      const res = await deleteThemeItem({
        itemId: currentItem.id,
        userId: currentUserId,
      });

      if (res?.error) {
        toast.error(res.error);
        return;
      }

      toast.success("削除しました");
      onDelete();
      onClose();
    } catch (error) {
      console.error("削除エラー:", error);
      toast.error("削除に失敗しました");
    }
  };

  // リスト項目を整形する関数
  const formatListItems = (list: string | null) => {
    if (!list) return null;

    // HTMLタグを除去して純粋なテキストのみを表示
    return list
      .split("\n")
      .filter((line) => line.trim())
      .map((line, index) => {
        // HTMLタグを除去
        const cleanLine = line
          .replace(/<[^>]*>/g, "")
          .replace(/&nbsp;/g, " ")
          .trim();

        // チェックボックスの状態を検出（データ形式によって調整が必要かもしれません）
        const isChecked =
          line.includes('checked="true"') || line.includes('checked="checked"');
        const hasCheckbox =
          line.includes('type="checkbox"') ||
          line.includes('<li data-type="taskItem"');

        return cleanLine ? (
          <li
            key={index}
            className={`my-1 ${hasCheckbox ? "flex items-center gap-2" : ""}`}
          >
            {hasCheckbox && (
              <div className="relative inline-block w-4 h-4 mr-2 checkbox-disabled">
                <input
                  type="checkbox"
                  checked={isChecked}
                  readOnly
                  disabled
                  className="h-4 w-4 rounded border-gray-300 pointer-events-none opacity-100"
                  tabIndex={-1}
                  aria-disabled="true"
                  onClick={(e) => e.preventDefault()}
                />
                <div className="checkbox-overlay"></div>
              </div>
            )}
            <span>{cleanLine}</span>
          </li>
        ) : null;
      })
      .filter(Boolean); // nullの項目を除外
  };

  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 flex flex-col h-full">
          {/* ヘッダー */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Image
                src={currentItem.profiles.avatar_url || "/avator-default.webp"}
                alt="ユーザーアバター"
                className="rounded-full aspect-square"
                width={50}
                height={50}
              />
              <div>
                <p className="font-bold text-lg">{currentItem.profiles.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {format(new Date(currentItem.created_at), "yyyy/MM/dd HH:mm")}
                </p>
              </div>
            </div>
            <button
              className="modal-close-button"
              onClick={onClose}
              aria-label="閉じる"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* コンテンツ */}
          <div
            className="mt-4 prose prose-sm max-w-none flex-grow overflow-y-auto pl-4 dark:prose-invert "
            style={{ alignSelf: "flex-start" }}
          >
            {currentItem.list && (
              <div className="task-list-disabled">
                <ul className="list-disc pl-4">
                  {formatListItems(currentItem.list)}
                </ul>
              </div>
            )}
          </div>

          {/* フッター */}
          <div className="mt-6 flex justify-end">
            {currentUserId && currentUserId === currentItem.user_id && (
              <button
                className="flex items-center space-x-1 text-red-500 hover:text-red-700 transition"
                onClick={handleDelete}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                <span>削除</span>
              </button>
            )}
          </div>

          {/* ページネーション */}
          <div className="modal-pagination">
            <button
              className={`modal-pagination-button ${
                currentIndex === 0
                  ? "opacity-0 cursor-not-allowed"
                  : "opacity-100"
              }`}
              onClick={handlePrevious}
              disabled={currentIndex === 0}
            >
              <ChevronLeft className="h-4 w-4 text-gray-700 dark:text-gray-300" />
            </button>
            <div className="modal-pagination-counter">
              {currentIndex + 1} / {totalItems}
            </div>
            <button
              className={`modal-pagination-button ${
                currentIndex === totalItems - 1
                  ? "opacity-0 cursor-not-allowed"
                  : "opacity-100"
              }`}
              onClick={handleNext}
              disabled={currentIndex === totalItems - 1}
            >
              <ChevronRight className="h-4 w-4 text-gray-700 dark:text-gray-300" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollectionModal;
