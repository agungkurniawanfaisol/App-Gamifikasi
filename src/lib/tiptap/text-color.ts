import { Extension } from "@tiptap/core";

const SAFE_COLOR = /^#[0-9a-f]{6}$/i;

export function sanitizeColor(value: string | null | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  return SAFE_COLOR.test(trimmed) ? trimmed.toLowerCase() : null;
}

export const TEXT_COLOR_OPTIONS = [
  { value: "#000000", label: "Black" },
  { value: "#dc2626", label: "Red" },
  { value: "#ea580c", label: "Orange" },
  { value: "#ca8a04", label: "Gold" },
  { value: "#16a34a", label: "Green" },
  { value: "#2563eb", label: "Blue" },
  { value: "#7c3aed", label: "Purple" },
  { value: "#db2777", label: "Pink" },
] as const;

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    textColor: {
      setTextColor: (color: string) => ReturnType;
      unsetTextColor: () => ReturnType;
    };
  }
}

export const TextColor = Extension.create({
  name: "textColor",

  addOptions() {
    return {
      types: ["textStyle"],
    };
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          color: {
            default: null,
            parseHTML: (element) =>
              sanitizeColor(element.style.color?.replace(/['"]+/g, "")),
            renderHTML: (attributes) => {
              const color = sanitizeColor(attributes.color);
              if (!color) return {};
              return { style: `color: ${color}` };
            },
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      setTextColor:
        (color) =>
        ({ chain }) => {
          const safe = sanitizeColor(color);
          if (!safe) return false;
          return chain().setMark("textStyle", { color: safe }).run();
        },
      unsetTextColor:
        () =>
        ({ chain }) =>
          chain().setMark("textStyle", { color: null }).removeEmptyTextStyle().run(),
    };
  },
});
