import { Button } from "@/components/ui/button";
import { List, ListOrdered } from "lucide-react";
import { useEffect, useRef, useCallback } from "react";

interface TextEditorToolbarProps {
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
}

const TextEditorToolbar = ({ textareaRef }: TextEditorToolbarProps) => {
  // ボタンへの参照を作成
  const bulletButtonRef = useRef<HTMLButtonElement>(null);

  // テキストエリアの値を更新し、React Hook Formの状態も更新する関数
  const updateTextareaValue = useCallback(
    (textarea: HTMLTextAreaElement, newValue: string) => {
      // Object.getOwnPropertyDescriptorを使用してsetterを取得
      const descriptor = Object.getOwnPropertyDescriptor(
        HTMLTextAreaElement.prototype,
        "value"
      );

      // setterが存在する場合は、それを使用して値を設定
      if (descriptor && descriptor.set) {
        descriptor.set.call(textarea, newValue);
      }

      // React Hook Formの値を更新するためにイベントを発火
      const event = new Event("input", { bubbles: true });
      textarea.dispatchEvent(event);
    },
    []
  );

  // テキストエリアに箇条書きリストを挿入する
  const insertBulletList = useCallback(() => {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const beforeText = text.substring(0, start);
    const selectedText = text.substring(start, end);
    const afterText = text.substring(end);

    // 選択されたテキストを行ごとに分割
    const lines = selectedText ? selectedText.split("\n") : [""];

    // 各行の先頭に「・」を追加
    const bulletLines = lines.map((line) => `・ ${line}`).join("\n");

    // 新しいテキストを作成
    const newText = beforeText + bulletLines + afterText;

    // テキストエリアの値を更新
    updateTextareaValue(textarea, newText);

    // カーソル位置を更新
    const newCursorPos = beforeText.length + bulletLines.length;
    textarea.selectionStart = newCursorPos;
    textarea.selectionEnd = newCursorPos;
  }, [textareaRef, updateTextareaValue]);

  // コンポーネントがマウントされたときに実行
  useEffect(() => {
    // テキストエリアが存在する場合、初期値として箇条書きリストを挿入
    if (textareaRef.current && textareaRef.current.value === "") {
      insertBulletList();

      // ボタンにフォーカスを当てる
      if (bulletButtonRef.current) {
        bulletButtonRef.current.focus();
      }
    }
  }, [textareaRef, insertBulletList]);

  // テキストエリアに番号付きリストを挿入する
  const insertNumberedList = useCallback(() => {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const beforeText = text.substring(0, start);
    const selectedText = text.substring(start, end);
    const afterText = text.substring(end);

    // 選択されたテキストを行ごとに分割
    const lines = selectedText ? selectedText.split("\n") : [""];

    // 各行の先頭に番号を追加
    const numberedLines = lines
      .map((line, index) => `${index + 1}. ${line}`)
      .join("\n");

    // 新しいテキストを作成
    const newText = beforeText + numberedLines + afterText;

    // テキストエリアの値を更新
    updateTextareaValue(textarea, newText);

    // カーソル位置を更新
    const newCursorPos = beforeText.length + numberedLines.length;
    textarea.selectionStart = newCursorPos;
    textarea.selectionEnd = newCursorPos;
  }, [textareaRef, updateTextareaValue]);

  // Enterキーが押されたときの処理を追加
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!textareaRef.current || e.key !== "Enter") return;

      const textarea = textareaRef.current;
      const cursorPos = textarea.selectionStart;
      const text = textarea.value;

      // カーソル位置より前のテキストを取得
      const beforeCursor = text.substring(0, cursorPos);

      // 現在の行を取得
      const currentLineStart = beforeCursor.lastIndexOf("\n") + 1;
      const currentLine = beforeCursor.substring(currentLineStart);

      // 行の先頭に箇条書き記号または番号があるか確認
      const bulletMatch = currentLine.match(/^(・\s)(.*)/);
      const numberedMatch = currentLine.match(/^(\d+)(\.\s)(.*)/);

      if (bulletMatch || numberedMatch) {
        e.preventDefault();

        let prefix;
        let content;

        if (bulletMatch) {
          prefix = bulletMatch[1]; // 「・ 」
          content = bulletMatch[2]; // 記号の後のコンテンツ
        } else if (numberedMatch) {
          prefix = `${numberedMatch[1]}${numberedMatch[2]}`; // 「数字. 」
          content = numberedMatch[3]; // 記号の後のコンテンツ
        } else {
          return;
        }

        // 内容が空の場合はリストを終了
        if (!content.trim()) {
          // リスト記号を削除して改行だけ挿入
          const newText =
            text.substring(0, currentLineStart) + text.substring(cursorPos);

          // テキストエリアの値を更新
          updateTextareaValue(textarea, newText);

          // カーソル位置を設定
          textarea.selectionStart = currentLineStart;
          textarea.selectionEnd = currentLineStart;
          return;
        }

        // 番号付きリストの場合、次の番号を計算
        let newPrefix = prefix;
        if (numberedMatch) {
          const num = parseInt(numberedMatch[1]);
          newPrefix = `${num + 1}. `;
        }

        // カーソルが行末にあるかどうかを確認
        const isAtEndOfLine =
          cursorPos === currentLineStart + currentLine.length;

        // 新しい行に同じ記号を追加
        let newText;
        let newCursorPos;

        if (isAtEndOfLine) {
          // カーソルが行末にある場合は単純に新しい行と記号を追加
          newText = text.substring(0, cursorPos) + "\n" + newPrefix;
          newCursorPos = cursorPos + 1 + newPrefix.length;
        } else {
          // カーソルが行の途中にある場合は、カーソル位置で行を分割
          const beforeCursorInLine = currentLine.substring(
            0,
            cursorPos - currentLineStart
          );
          const afterCursorInLine = currentLine.substring(
            cursorPos - currentLineStart
          );

          newText =
            text.substring(0, currentLineStart) +
            beforeCursorInLine +
            "\n" +
            newPrefix +
            afterCursorInLine +
            text.substring(currentLineStart + currentLine.length);

          newCursorPos =
            currentLineStart + beforeCursorInLine.length + 1 + newPrefix.length;
        }

        // テキストエリアの値を更新
        updateTextareaValue(textarea, newText);

        // カーソル位置を設定
        textarea.selectionStart = newCursorPos;
        textarea.selectionEnd = newCursorPos;
      }
    };

    // テキストエリアにイベントリスナーを追加
    const textareaElement = textareaRef.current;
    if (textareaElement) {
      textareaElement.addEventListener("keydown", handleKeyDown);
    }

    // クリーンアップ関数
    return () => {
      if (textareaElement) {
        textareaElement.removeEventListener("keydown", handleKeyDown);
      }
    };
  }, [textareaRef, updateTextareaValue]);

  return (
    <div className="flex space-x-2 mb-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={insertBulletList}
        title="箇条書きリスト"
        ref={bulletButtonRef}
      >
        <List className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={insertNumberedList}
        title="番号付きリスト"
      >
        <ListOrdered className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default TextEditorToolbar;
