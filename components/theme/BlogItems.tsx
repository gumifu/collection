"use client";

import Image from "next/image";
import { format } from "date-fns";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";

interface Blog {
  id: string;
  title: string;
  content: string;
  image_url: string;
  updated_at: string;
  list?: string;
  profiles: {
    name: string;
    avatar_url: string;
  };
}

interface BlogItemsProps {
  blogs: Blog[];
}

const BlogItems = ({ blogs }: BlogItemsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {blogs.map((blog) => (
        <BlogItem key={blog.id} blog={blog} />
      ))}
    </div>
  );
};

// トップページと同じBlogItemコンポーネント
const BlogItem = ({ blog }: { blog: Blog }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  // コンテンツがオーバーフローしているかチェック
  useEffect(() => {
    if (isHovered && contentRef.current) {
      const element = contentRef.current;
      setIsOverflowing(element.scrollHeight > element.clientHeight);
    }
  }, [isHovered]);

  return (
    <div
      className="break-words border rounded relative overflow-hidden group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/blog/${blog.id}`} className="block relative">
        {/* オーバーレイ - 全体（ホバー時） */}
        <div
          className={`absolute inset-0 bg-black z-10 transition-opacity duration-300 ease-in-out ${
            isHovered ? "opacity-60" : "opacity-0"
          }`}
        />

        <div className="aspect-video relative overflow-hidden">
          <Image
            src={blog.image_url || "/noImage.webp"}
            className="rounded-t object-cover"
            alt="image"
            width={640}
            height={360}
            priority
          />
        </div>

        <div className="p-3 space-y-2 relative">
          <div className="font-semibold relative z-1">{blog.title}</div>
          <div className="text-gray-500 text-xs relative z-1">
            {format(new Date(blog.updated_at), "yyyy/MM/dd HH:mm")}
          </div>
          <div className="flex items-center space-x-3 relative z-1">
            <Image
              src={blog.profiles.avatar_url || "/avator-default.webp"}
              className="rounded-full aspect-square"
              alt="avatar"
              width={30}
              height={30}
            />
            <div className="text-sm font-yugothic">
              {blog.profiles.name || "No Name"}
            </div>
          </div>
        </div>

        {/* リスト表示（常に存在するが、ホバー時のみ表示） */}
        {blog.list && (
          <div className="absolute inset-0 p-6 overflow-hidden z-11 transition-opacity duration-300 ease-in-out opacity-0 group-hover:opacity-100">
            <div
              ref={contentRef}
              className="text-white font-bold prose prose-invert max-w-none list-animation max-h-full"
              dangerouslySetInnerHTML={{ __html: blog.list }}
            />

            {/* 下部のグラデーション（オーバーフロー時のみ表示） */}
            {isOverflowing && (
              <div className="absolute bottom-0 left-0 right-0 h-1/4 bg-gradient-to-t from-black to-transparent opacity-90 pointer-events-none" />
            )}
          </div>
        )}
      </Link>
    </div>
  );
};

export default BlogItems;
