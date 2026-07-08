import { Extension } from "@tiptap/core";

export type TextAlignValue = "left" | "center" | "right" | "justify";

export type TextAlignOptions = {
  types: string[];
  alignments: TextAlignValue[];
  defaultAlignment: TextAlignValue;
};

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    textAlign: {
      setTextAlign: (alignment: TextAlignValue) => ReturnType;
      unsetTextAlign: () => ReturnType;
    };
  }
}

export const TextAlign = Extension.create<TextAlignOptions>({
  name: "textAlign",

  addOptions() {
    return {
      types: ["heading", "paragraph"],
      alignments: ["left", "center", "right", "justify"],
      defaultAlignment: "left",
    };
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          textAlign: {
            default: this.options.defaultAlignment,
            parseHTML: (element) => {
              const align = element.style.textAlign as TextAlignValue | "";
              return this.options.alignments.includes(align as TextAlignValue)
                ? align
                : this.options.defaultAlignment;
            },
            renderHTML: (attributes) => {
              if (
                !attributes.textAlign ||
                attributes.textAlign === this.options.defaultAlignment
              ) {
                return {};
              }
              return { style: `text-align: ${attributes.textAlign}` };
            },
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      setTextAlign:
        (alignment) =>
        ({ commands }) => {
          if (!this.options.alignments.includes(alignment)) {
            return false;
          }
          return this.options.types
            .map((type) =>
              commands.updateAttributes(type, { textAlign: alignment })
            )
            .every(Boolean);
        },
      unsetTextAlign:
        () =>
        ({ commands }) =>
          this.options.types
            .map((type) => commands.resetAttributes(type, "textAlign"))
            .every(Boolean),
    };
  },
});
