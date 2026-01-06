import React, { useEffect, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";

export default function RichNotes({ value, onChange, placeholder }) {
  const isSettingFromOutside = useRef(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Placeholder.configure({ placeholder: placeholder || "Notes..." }),
    ],
    content: value || "",
    onUpdate: ({ editor }) => {
      // If we just set content from outside, don't echo it back up
      if (isSettingFromOutside.current) return;
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: { class: "notes-editor" },
    },
  });

  useEffect(() => {
    if (!editor) return;

    const next = value || "";
    const current = editor.getHTML();

    if (next === current) return;

    isSettingFromOutside.current = true;
    editor.commands.setContent(next, false); // false = don't emit extra history steps
    // allow next onUpdate to flow again
    setTimeout(() => {
      isSettingFromOutside.current = false;
    }, 0);
  }, [value, editor]);

  if (!editor) return null;

  const Btn = ({ active, onClick, children, title }) => (
    <button
      type="button"
      className={`notes-btn ${active ? "active" : ""}`}
      onClick={onClick}
      title={title}
    >
      {children}
    </button>
  );

  return (
    <div className="notes-editor-shell">
      <div className="notes-toolbar">
        <Btn
          title="Bold"
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <span style={{ fontWeight: 700 }}>B</span>
        </Btn>

        <Btn
          title="Italic"
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <span style={{ fontStyle: "italic" }}>I</span>
        </Btn>

        <Btn
          title="Underline"
          active={editor.isActive("underline")}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <span style={{ textDecoration: "underline" }}>U</span>
        </Btn>

        <div className="notes-divider" />

        <Btn
          title="Numbered list"
          active={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          1. list
        </Btn>

        <Btn
          title="Dashed list"
          active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          - list
        </Btn>

        <div className="notes-divider" />

        <Btn
          title="Heading"
          active={editor.isActive("heading", { level: 2 })}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
        >
          heading
        </Btn>

        <Btn
          title="Subheading"
          active={editor.isActive("heading", { level: 3 })}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
        >
          subheading
        </Btn>

        <Btn
          title="Body text"
          active={editor.isActive("paragraph")}
          onClick={() => editor.chain().focus().setParagraph().run()}
        >
          body
        </Btn>
      </div>

      <EditorContent editor={editor} />
    </div>
  );
}
