import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import BulletList from "@tiptap/extension-bullet-list";
import OrderedList from "@tiptap/extension-ordered-list";
import ListItem from "@tiptap/extension-list-item";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  List as BulletListIcon,
  ListOrdered as OrderedListIcon,
} from "lucide-react";

interface ListOnlyEditorProps {
  content: string;
  onChange: (content: string) => void;
}

const ListOnlyEditor = ({ content, onChange }: ListOnlyEditorProps) => {
  const [isInitialized, setIsInitialized] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        bold: false,
        italic: false,
        strike: false,
        blockquote: false,
        code: false,
        codeBlock: false,
        horizontalRule: false,
        paragraph: {},
      }),
      BulletList.configure({
        HTMLAttributes: {
          class: "list-disc pl-4",
        },
      }),
      OrderedList.configure({
        HTMLAttributes: {
          class: "list-decimal pl-4",
        },
      }),
      ListItem.configure({
        HTMLAttributes: {
          class: "my-1",
        },
      }),
    ],
    content: content || "<ul><li></li></ul>",
    onUpdate: ({ editor }) => {
      try {
        if (!editor.isActive("bulletList") && !editor.isActive("orderedList")) {
          editor.chain().toggleBulletList().run();
        }
        const html = editor.getHTML();
        onChange(html);
      } catch (error) {
        console.error("エディター更新エラー:", error);
        // エラーが発生しても最低限のリスト構造を返す
        onChange("<ul><li></li></ul>");
      }
    },
    autofocus: false,
    editable: true,
  });

  useEffect(() => {
    if (editor && !isInitialized) {
      try {
        if (content) {
          editor.commands.setContent(content);
        } else {
          // デフォルトで箇条書きリストを設定
          editor.commands.toggleBulletList();
        }

        // リストが有効でない場合は強制的に設定
        if (!editor.isActive("bulletList") && !editor.isActive("orderedList")) {
          editor.commands.toggleBulletList();
        }

        editor.setOptions({ editable: true });
        setIsInitialized(true);
      } catch (error) {
        console.error("エディター初期化エラー:", error);
        // エラーが発生しても初期化を完了させる
        setIsInitialized(true);
      }
    }
  }, [editor, content, isInitialized]);

  useEffect(() => {
    if (editor && isInitialized && content !== editor.getHTML()) {
      try {
        const selection = editor.state.selection;
        editor.commands.setContent(content || "<ul><li></li></ul>");

        if (!editor.isActive("bulletList") && !editor.isActive("orderedList")) {
          editor.commands.toggleBulletList();
        }

        if (selection) {
          editor.commands.setTextSelection(selection.from);
        }
      } catch (error) {
        console.error("コンテンツ同期エラー:", error);
      }
    }
  }, [editor, content, isInitialized]);

  useEffect(() => {
    if (editor && isInitialized) {
      const handleKeyDown = () => {
        setTimeout(() => {
          try {
            if (
              !editor.isActive("bulletList") &&
              !editor.isActive("orderedList")
            ) {
              editor.commands.toggleBulletList();
            }
          } catch (error) {
            console.error("キー入力処理エラー:", error);
          }
        }, 0);
      };

      const editorElement = editor.view.dom;
      editorElement.addEventListener("keydown", handleKeyDown);

      return () => {
        editorElement.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [editor, isInitialized]);

  if (!editor) {
    return null;
  }

  return (
    <div className="border rounded-md overflow-hidden">
      <div className="flex flex-wrap gap-1 p-2 border-b bg-gray-50">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            try {
              if (!editor.isActive("bulletList")) {
                editor.chain().focus().toggleBulletList().run();
              }
            } catch (error) {
              console.error("箇条書きリスト切替エラー:", error);
            }
          }}
          className={editor.isActive("bulletList") ? "bg-gray-200" : ""}
          title="箇条書きリスト"
        >
          <BulletListIcon className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            try {
              if (!editor.isActive("orderedList")) {
                editor.chain().focus().toggleOrderedList().run();
              }
            } catch (error) {
              console.error("番号付きリスト切替エラー:", error);
            }
          }}
          className={editor.isActive("orderedList") ? "bg-gray-200" : ""}
          title="番号付きリスト"
        >
          <OrderedListIcon className="h-4 w-4" />
        </Button>
      </div>
      <EditorContent
        editor={editor}
        className="p-4 min-h-[150px] prose prose-sm max-w-none"
        onClick={() => editor.commands.focus()}
      />
    </div>
  );
};

export default ListOnlyEditor;
