"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import { Button } from "@/components/ui/button";
import { labels } from "@/lib/labels";
import {
  Bold,
  ImageIcon,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
} from "lucide-react";

export function MaterialEditor({
  groupId,
  initialContent,
  onChange,
}: {
  groupId: number;
  initialContent?: string;
  onChange: (json: string) => void;
}) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false }),
      Image.configure({
        inline: false,
        HTMLAttributes: {
          class: "max-w-full h-auto rounded-md my-3 block",
        },
      }),
      Placeholder.configure({
        placeholder: labels.admin.materialPlaceholder,
      }),
    ],
    content: initialContent ? safeParse(initialContent) : undefined,
    onUpdate: ({ editor: ed }) => {
      onChange(JSON.stringify(ed.getJSON()));
    },
    editorProps: {
      attributes: {
        class:
          "min-h-[240px] rounded-md border border-border bg-background p-3 focus:outline-none prose prose-sm max-w-none [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-md [&_img]:my-3 [&_img]:block",
      },
    },
  });

  async function insertImage() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file || !editor) return;
      const formData = new FormData();
      formData.append("file", file);
      formData.append("groupId", String(groupId));
      const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
      const data = (await res.json()) as { url?: string; error?: string };
      if (data.url) {
        editor.chain().focus().setImage({ src: data.url, alt: file.name }).run();
        onChange(JSON.stringify(editor.getJSON()));
      }
    };
    input.click();
  }

  function setLink() {
    if (!editor) return;
    const url = window.prompt("URL");
    if (!url) return;
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }

  if (!editor) return null;

  return (
    <div className="flex h-full flex-col gap-2">
      <div className="flex flex-wrap gap-1 rounded-md border border-border bg-muted/50 p-1">
        <Button type="button" size="icon" variant="ghost" className="size-11" onClick={() => editor.chain().focus().toggleBold().run()}>
          <Bold className="size-4" />
        </Button>
        <Button type="button" size="icon" variant="ghost" className="size-11" onClick={() => editor.chain().focus().toggleItalic().run()}>
          <Italic className="size-4" />
        </Button>
        <Button type="button" size="icon" variant="ghost" className="size-11" onClick={() => editor.chain().focus().toggleBulletList().run()}>
          <List className="size-4" />
        </Button>
        <Button type="button" size="icon" variant="ghost" className="size-11" onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          <ListOrdered className="size-4" />
        </Button>
        <Button type="button" size="icon" variant="ghost" className="size-11" onClick={setLink}>
          <LinkIcon className="size-4" />
        </Button>
        <Button type="button" size="icon" variant="ghost" className="size-11" onClick={insertImage} title={labels.admin.uploadImage}>
          <ImageIcon className="size-4" />
        </Button>
      </div>
      <EditorContent editor={editor} className="min-h-0 flex-1" />
    </div>
  );
}

function safeParse(json: string) {
  try {
    return JSON.parse(json);
  } catch {
    return {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [{ type: "text", text: json }],
        },
      ],
    };
  }
}
