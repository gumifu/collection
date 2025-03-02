"use client";

import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import BlogItem from "@/components/blog/BlogItem";
import { BlogType } from "@/types";
import { createClient } from "@/utils/supabase/client";

// BlogItemコンポーネントが期待する型に合わせる
type BlogWithProfile = BlogType & {
  profiles: {
    name: string;
    avatar_url: string;
  };
};

interface InfiniteOriginalThemesProps {
  initialLimit: number;
}

const InfiniteOriginalThemes = ({
  initialLimit,
}: InfiniteOriginalThemesProps) => {
  const [blogs, setBlogs] = useState<BlogWithProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const { ref, inView } = useInView({
    threshold: 0,
    rootMargin: "0px 0px 300px 0px", // 画面下部から300px手前で発火
  });

  const fetchBlogs = async (start: number, limit: number) => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      const { data, error, count } = await supabase
        .from("blogs")
        .select(
          `
          *,
          profiles (
            name,
            avatar_url
          )
        `,
          { count: "exact" }
        )
        .order("updated_at", { ascending: false })
        .range(start, start + limit - 1);

      if (error) {
        console.error("ブログ取得エラー:", error);
        return;
      }

      if (data) {
        // nullのavatar_urlを処理して、BlogItemが期待する型に変換
        const processedData = data.map((blog) => ({
          ...blog,
          profiles: {
            ...blog.profiles,
            avatar_url: blog.profiles.avatar_url || "/avator-default.webp",
          },
        })) as BlogWithProfile[];

        // 初回ロードの場合は置き換え、それ以外は追加
        if (start === 0) {
          setBlogs(processedData);
        } else {
          setBlogs((prev) => [...prev, ...processedData]);
        }

        // 取得したデータが要求した数より少ない場合、もうデータがないと判断
        setHasMore(
          data.length === limit &&
            count !== null &&
            count !== undefined &&
            start + limit < count
        );
      }
    } catch (error) {
      console.error("ブログ取得例外:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 初回ロード
  useEffect(() => {
    fetchBlogs(0, initialLimit);
  }, [initialLimit]);

  // スクロール検知時の追加ロード
  useEffect(() => {
    if (inView && !isLoading && hasMore) {
      const nextPage = page + 1;
      const start = nextPage * initialLimit;
      fetchBlogs(start, initialLimit);
      setPage(nextPage);
    }
  }, [inView, isLoading, hasMore, page, initialLimit]);

  if (blogs.length === 0 && !isLoading) {
    return <div className="text-center py-8">投稿されていません</div>;
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {blogs.map((blog) => (
          <BlogItem key={blog.id} blog={blog} />
        ))}
      </div>

      {/* ローディングインジケーターとスクロール検知用の要素 */}
      <div ref={ref} className="w-full py-8 flex justify-center">
        {isLoading && hasMore && (
          <div className="animate-pulse text-gray-500">読み込み中...</div>
        )}
      </div>
    </>
  );
};

export default InfiniteOriginalThemes;
