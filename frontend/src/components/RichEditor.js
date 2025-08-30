import { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

export default function RichEditor({ value, onChange, placeholder }) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value || "",
    onUpdate: ({ editor }) => {
      onChange && onChange(editor.getHTML());
    },
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "prose max-w-none min-h-[160px] border rounded p-2 focus:outline-none",
        spellcheck: "false",
      },
    },
  });

  useEffect(() => {
    if (editor && typeof value === "string" && value !== editor.getHTML()) {
      editor.commands.setContent(value || "", false);
    }
  }, [value, editor]);

  if (!editor) return null;

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-2">
        <button
          type="button"
          className="text-sm border rounded px-2 py-1"
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          Bold
        </button>
        <button
          type="button"
          className="text-sm border rounded px-2 py-1"
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          Italic
        </button>
        <button
          type="button"
          className="text-sm border rounded px-2 py-1"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          Bullets
        </button>
        <button
          type="button"
          className="text-sm border rounded px-2 py-1"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          Numbered
        </button>
        <button
          type="button"
          className="text-sm border rounded px-2 py-1"
          onClick={() => editor.commands.clearContent(true)}
        >
          Clear
        </button>
      </div>
      <EditorContent editor={editor} />
      {placeholder && !value && (
        <div className="text-gray-400 text-sm mt-1">{placeholder}</div>
      )}
    </div>
  );
}
