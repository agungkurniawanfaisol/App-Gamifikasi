import { Mark, mergeAttributes } from "@tiptap/core";
import { sanitizeColor } from "@/lib/tiptap/text-color";

export const HIGHLIGHT_COLOR_OPTIONS = [
  { value: "#fef08a", label: "Yellow" },
  { value: "#bbf7d0", label: "Green" },
  { value: "#bfdbfe", label: "Blue" },
  { value: "#fbcfe8", label: "Pink" },
  { value: "#e5e7eb", label: "Gray" },
] as const;

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    highlight: {
      setHighlight: (color?: string) => ReturnType;
      toggleHighlight: (color?: string) => ReturnType;
      unsetHighlight: () => ReturnType;
    };
  }
}

export const Highlight = Mark.create({
  name: "highlight",

  addOptions() {
    return {
      HTMLAttributes: {},
      multicolor: true,
    };
  },

  addAttributes() {
    return {
      color: {
        default: "#fef08a",
        parseHTML: (element) =>
          sanitizeColor(element.style.backgroundColor) ?? "#fef08a",
        renderHTML: (attributes) => {
          const color = sanitizeColor(attributes.color) ?? "#fef08a";
          return {
            style: `background-color: ${color}`,
            "data-highlight-color": color,
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "mark",
      },
      {
        style: "background-color",
        getAttrs: (value) => ({ color: sanitizeColor(String(value)) ?? "#fef08a" }),
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ["mark", mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0];
  },

  addCommands() {
    return {
      setHighlight:
        (color) =>
        ({ commands }) => {
          const safe = sanitizeColor(color) ?? "#fef08a";
          return commands.setMark(this.name, { color: safe });
        },
      toggleHighlight:
        (color) =>
        ({ commands }) => {
          const safe = sanitizeColor(color) ?? "#fef08a";
          return commands.toggleMark(this.name, { color: safe });
        },
      unsetHighlight:
        () =>
        ({ commands }) =>
          commands.unsetMark(this.name),
    };
  },
});
