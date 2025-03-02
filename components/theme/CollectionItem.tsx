"use client";

import { useState } from "react";
import Image from "next/image";
import { format } from "date-fns";
import { Trash2 } from "lucide-react";
import CollectionModal from "./CollectionModal";

interface CollectionItemProps {
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

const CollectionItem = ({
  item,
  currentUserId,
  onDelete,
  allItems,
}: CollectionItemProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
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

        return cleanLine ? (
          <li key={index} className="my-1">
            {cleanLine}
          </li>
        ) : null;
      })
      .filter(Boolean); // nullの項目を除外
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
              src={item.profiles?.avatar_url || "/avator-default.webp"}
              alt="ユーザーアバター"
              className="rounded-full aspect-square"
              width={40}
              height={40}
            />
            <div>
              <p className="font-semibold">
                {item.profiles?.name || "名無しユーザー"}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {format(new Date(item.created_at), "yyyy/MM/dd HH:mm")}
              </p>
            </div>
          </div>
          {currentUserId && currentUserId === item.user_id && (
            <button
              className="text-red-500 hover:text-red-700 transition"
              onClick={(e) => {
                e.stopPropagation(); // モーダルが開かないようにする
                setIsModalOpen(true); // 代わりにモーダルを開いて削除ボタンを表示
              }}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className="mt-4 flex-grow prose prose-sm max-w-none line-clamp-3 overflow-hidden pl-4 dark:prose-invert">
          {item.content && <p>{item.content}</p>}
          {item.list && (
            <ul className="list-disc pl-4">{formatListItems(item.list)}</ul>
          )}
        </div>
      </div>

      <CollectionModal
        item={item}
        isOpen={isModalOpen}
        onClose={closeModal}
        currentUserId={currentUserId}
        onDelete={onDelete}
        allItems={allItems}
      />
    </>
  );
};

export default CollectionItem;
