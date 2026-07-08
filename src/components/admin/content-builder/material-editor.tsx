"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import { Button } from "@/components/ui/button";
import { labels } from "@/lib/labels";
import { cn } from "@/lib/utils";
import { TextAlign } from "@/lib/tiptap/text-align";
import {
  FONT_SIZE_OPTIONS,
  FontSize,
  TextStyle,
} from "@/lib/tiptap/font-size";
import { Underline } from "@/lib/tiptap/underline";
import { TextColor, TEXT_COLOR_OPTIONS } from "@/lib/tiptap/text-color";
import { Highlight, HIGHLIGHT_COLOR_OPTIONS } from "@/lib/tiptap/highlight";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Code,
  Eraser,
  FileCode,
  ImageIcon,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Minus,
  Quote,
  Redo2,
  Strikethrough,
  Underline as UnderlineIcon,
  Undo2,
} from "lucide-react";

type HeadingLevel = 1 | 2 | 3;

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
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
        heading: {
          levels: [1, 2, 3],
        },
      }),
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
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      TextStyle,
      FontSize,
      TextColor,
      Underline,
      Highlight,
    ],
    content: initialContent ? safeParse(initialContent) : undefined,
    onUpdate: ({ editor: ed }) => {
      onChange(JSON.stringify(ed.getJSON()));
    },
    editorProps: {
      attributes: {
        class:
          "material-editor-content min-h-[240px] rounded-md border border-border bg-background p-3 focus:outline-none prose prose-sm max-w-none",
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
    const previous = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt(labels.admin.editorLinkPrompt, previous ?? "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }

  function clearFormatting() {
    if (!editor) return;
    editor.chain().focus().unsetAllMarks().clearNodes().run();
  }

  function getHeadingValue(): "0" | "1" | "2" | "3" {
    if (!editor) return "0";
    if (editor.isActive("heading", { level: 1 })) return "1";
    if (editor.isActive("heading", { level: 2 })) return "2";
    if (editor.isActive("heading", { level: 3 })) return "3";
    return "0";
  }

  function setHeading(value: string) {
    if (!editor) return;
    if (value === "0") {
      editor.chain().focus().setParagraph().run();
      return;
    }
    const level = Number(value) as HeadingLevel;
    editor.chain().focus().setHeading({ level }).run();
  }

  if (!editor) return null;

  const currentFontSize =
    (editor.getAttributes("textStyle").fontSize as string | undefined) ?? "";
  const currentTextColor =
    (editor.getAttributes("textStyle").color as string | undefined) ?? "";
  const currentHighlight =
    (editor.getAttributes("highlight").color as string | undefined) ?? "";

  return (
    <div className="flex h-full flex-col gap-2">
      <div
        className="flex flex-col gap-1 rounded-md border border-border bg-muted/50 p-1"
        role="toolbar"
        aria-label={labels.admin.editorToolbar}
      >
        <div className="flex flex-wrap items-center gap-1">
          <ToolbarButton
            label={labels.admin.editorUndo}
            disabled={!editor.can().undo()}
            onClick={() => editor.chain().focus().undo().run()}
          >
            <Undo2 className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            label={labels.admin.editorRedo}
            disabled={!editor.can().redo()}
            onClick={() => editor.chain().focus().redo().run()}
          >
            <Redo2 className="size-4" />
          </ToolbarButton>

          <ToolbarDivider />

          <label className="sr-only" htmlFor="material-editor-heading">
            {labels.admin.editorHeadingStyle}
          </label>
          <select
            id="material-editor-heading"
            className="native-select h-11 min-h-11 w-full min-w-0 flex-1 py-0 text-sm sm:w-auto sm:min-w-[8.5rem] sm:flex-none"
            value={getHeadingValue()}
            aria-label={labels.admin.editorHeadingStyle}
            onChange={(e) => setHeading(e.target.value)}
          >
            <option value="0">{labels.admin.editorHeadingNormal}</option>
            <option value="1">{labels.admin.editorHeading1}</option>
            <option value="2">{labels.admin.editorHeading2}</option>
            <option value="3">{labels.admin.editorHeading3}</option>
          </select>

          <label className="sr-only" htmlFor="material-editor-font-size">
            {labels.admin.editorFontSize}
          </label>
          <select
            id="material-editor-font-size"
            className="native-select h-11 min-h-11 w-full min-w-0 flex-1 py-0 text-sm sm:w-auto sm:min-w-[5.5rem] sm:flex-none"
            value={currentFontSize}
            aria-label={labels.admin.editorFontSize}
            onChange={(e) => {
              const value = e.target.value;
              if (!value) {
                editor.chain().focus().unsetFontSize().run();
                return;
              }
              editor.chain().focus().setFontSize(value).run();
            }}
          >
            <option value="">{labels.admin.editorFontSizeDefault}</option>
            {FONT_SIZE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <ToolbarDivider />

          <ToolbarButton
            label={labels.admin.editorBold}
            active={editor.isActive("bold")}
            onClick={() => editor.chain().focus().toggleBold().run()}
          >
            <Bold className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            label={labels.admin.editorItalic}
            active={editor.isActive("italic")}
            onClick={() => editor.chain().focus().toggleItalic().run()}
          >
            <Italic className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            label={labels.admin.editorUnderline}
            active={editor.isActive("underline")}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
          >
            <UnderlineIcon className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            label={labels.admin.editorStrikethrough}
            active={editor.isActive("strike")}
            onClick={() => editor.chain().focus().toggleStrike().run()}
          >
            <Strikethrough className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            label={labels.admin.editorInlineCode}
            active={editor.isActive("code")}
            onClick={() => editor.chain().focus().toggleCode().run()}
          >
            <Code className="size-4" />
          </ToolbarButton>

          <ToolbarDivider />

          <ColorSelect
            id="material-editor-text-color"
            label={labels.admin.editorTextColor}
            value={currentTextColor}
            options={TEXT_COLOR_OPTIONS}
            onChange={(value) => {
              if (!value) {
                editor.chain().focus().unsetTextColor().run();
                return;
              }
              editor.chain().focus().setTextColor(value).run();
            }}
          />

          <ColorSelect
            id="material-editor-highlight"
            label={labels.admin.editorHighlight}
            value={currentHighlight}
            options={HIGHLIGHT_COLOR_OPTIONS}
            onChange={(value) => {
              if (!value) {
                editor.chain().focus().unsetHighlight().run();
                return;
              }
              editor.chain().focus().setHighlight(value).run();
            }}
          />
        </div>

        <div className="flex flex-wrap items-center gap-1">
          <ToolbarButton
            label={labels.admin.editorAlignLeft}
            active={editor.isActive({ textAlign: "left" })}
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
          >
            <AlignLeft className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            label={labels.admin.editorAlignCenter}
            active={editor.isActive({ textAlign: "center" })}
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
          >
            <AlignCenter className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            label={labels.admin.editorAlignRight}
            active={editor.isActive({ textAlign: "right" })}
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
          >
            <AlignRight className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            label={labels.admin.editorAlignJustify}
            active={editor.isActive({ textAlign: "justify" })}
            onClick={() => editor.chain().focus().setTextAlign("justify").run()}
          >
            <AlignJustify className="size-4" />
          </ToolbarButton>

          <ToolbarDivider />

          <ToolbarButton
            label={labels.admin.editorBulletList}
            active={editor.isActive("bulletList")}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
          >
            <List className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            label={labels.admin.editorOrderedList}
            active={editor.isActive("orderedList")}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
          >
            <ListOrdered className="size-4" />
          </ToolbarButton>

          <ToolbarDivider />

          <ToolbarButton
            label={labels.admin.editorBlockquote}
            active={editor.isActive("blockquote")}
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
          >
            <Quote className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            label={labels.admin.editorCodeBlock}
            active={editor.isActive("codeBlock")}
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          >
            <FileCode className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            label={labels.admin.editorHorizontalRule}
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
          >
            <Minus className="size-4" />
          </ToolbarButton>

          <ToolbarDivider />

          <ToolbarButton label={labels.admin.editorLink} onClick={setLink}>
            <LinkIcon className="size-4" />
          </ToolbarButton>
          <ToolbarButton label={labels.admin.uploadImage} onClick={insertImage}>
            <ImageIcon className="size-4" />
          </ToolbarButton>

          <ToolbarDivider />

          <ToolbarButton
            label={labels.admin.editorClearFormatting}
            onClick={clearFormatting}
          >
            <Eraser className="size-4" />
          </ToolbarButton>
        </div>
      </div>
      <EditorContent editor={editor} className="min-h-0 flex-1" />
    </div>
  );
}

function ColorSelect({
  id,
  label,
  value,
  options,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  options: readonly { value: string; label: string }[];
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex items-center gap-1">
      <label className="sr-only" htmlFor={id}>
        {label}
      </label>
      <select
        id={id}
        className="native-select h-11 min-h-11 w-full min-w-0 flex-1 py-0 text-sm sm:w-auto sm:min-w-[6.5rem] sm:flex-none"
        value={value}
        aria-label={label}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">{label}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {value ? (
        <span
          className="size-5 shrink-0 rounded border border-border"
          style={{ backgroundColor: value }}
          aria-hidden
        />
      ) : null}
    </div>
  );
}

function ToolbarButton({
  label,
  active = false,
  disabled = false,
  onClick,
  children,
}: {
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Button
      type="button"
      size="icon"
      variant="ghost"
      aria-label={label}
      title={label}
      aria-pressed={active}
      disabled={disabled}
      className={cn("size-11", active && "bg-background shadow-sm")}
      onClick={onClick}
    >
      {children}
    </Button>
  );
}

function ToolbarDivider() {
  return <span className="mx-0.5 hidden h-6 w-px bg-border sm:block" aria-hidden />;
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
