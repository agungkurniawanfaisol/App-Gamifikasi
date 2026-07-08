import { Extension, Mark, mergeAttributes } from "@tiptap/core";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    textStyle: {
      removeEmptyTextStyle: () => ReturnType;
    };
    fontSize: {
      setFontSize: (fontSize: string) => ReturnType;
      unsetFontSize: () => ReturnType;
    };
  }
}

/** Base textStyle mark required by font-size global attributes. */
export const TextStyle = Mark.create({
  name: "textStyle",

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  parseHTML() {
    return [
      {
        tag: "span",
        getAttrs: (element) => {
          if (!(element instanceof HTMLElement)) return false;
          return element.hasAttribute("style") ? {} : false;
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "span",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes),
      0,
    ];
  },

  addCommands() {
    return {
      removeEmptyTextStyle:
        () =>
        ({ state, commands }) => {
          const attrs = state.selection.$from
            .marks()
            .find((mark) => mark.type.name === this.name)?.attrs;
          if (!attrs) return true;
          const hasValue = Object.values(attrs).some(
            (value) => value !== null && value !== undefined && value !== ""
          );
          if (hasValue) return true;
          return commands.unsetMark(this.name);
        },
    };
  },
});

export const FONT_SIZE_OPTIONS = [
  { value: "12px", label: "12" },
  { value: "14px", label: "14" },
  { value: "16px", label: "16" },
  { value: "18px", label: "18" },
  { value: "20px", label: "20" },
  { value: "24px", label: "24" },
  { value: "28px", label: "28" },
  { value: "32px", label: "32" },
] as const;

const SAFE_FONT_SIZE = /^\d{1,3}(\.\d+)?(px|rem|em|%)$/;

export function sanitizeFontSize(value: string | null | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim().toLowerCase();
  return SAFE_FONT_SIZE.test(trimmed) ? trimmed : null;
}

export const FontSize = Extension.create({
  name: "fontSize",

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
          fontSize: {
            default: null,
            parseHTML: (element) =>
              sanitizeFontSize(element.style.fontSize?.replace(/['"]+/g, "")),
            renderHTML: (attributes) => {
              const size = sanitizeFontSize(attributes.fontSize);
              if (!size) return {};
              return { style: `font-size: ${size}` };
            },
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      setFontSize:
        (fontSize) =>
        ({ chain }) => {
          const size = sanitizeFontSize(fontSize);
          if (!size) return false;
          return chain().setMark("textStyle", { fontSize: size }).run();
        },
      unsetFontSize:
        () =>
        ({ chain }) =>
          chain()
            .setMark("textStyle", { fontSize: null })
            .removeEmptyTextStyle()
            .run(),
    };
  },
});
