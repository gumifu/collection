"use client";

import { useState } from "react";
import TipTapEditor from "./TipTapEditor";
import { Button } from "@/components/ui/button";

const TipTapEditorExample = () => {
  const [content, setContent] = useState(
    "<p>こんにちは、TipTapエディターへようこそ！</p>"
  );
  const [output, setOutput] = useState("");

  const handleChange = (newContent: string) => {
    setContent(newContent);
  };

  const handleSubmit = () => {
    setOutput(content);
  };

  return (
    <div className="mx-auto max-w-screen-md p-4">
      <h1 className="text-2xl font-bold mb-4">TipTapエディター例</h1>

      <div className="mb-6">
        <h2 className="text-xl font-bold mb-2">エディター</h2>
        <TipTapEditor content={content} onChange={handleChange} />
      </div>

      <div className="mb-6">
        <Button onClick={handleSubmit} className="mb-4">
          コンテンツを表示
        </Button>

        <h2 className="text-xl font-bold mb-2">HTML出力</h2>
        <div className="bg-gray-100 p-4 rounded overflow-auto max-h-40">
          <pre className="text-sm">{content}</pre>
        </div>
      </div>

      {output && (
        <div>
          <h2 className="text-xl font-bold mb-2">レンダリング結果</h2>
          <div className="border p-4 rounded prose">
            <div dangerouslySetInnerHTML={{ __html: output }} />
          </div>
        </div>
      )}
    </div>
  );
};

export default TipTapEditorExample;
