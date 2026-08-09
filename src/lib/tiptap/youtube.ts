import { Node, mergeAttributes } from "@tiptap/core";
import { normalizeYoutubeEmbedUrl } from "@/lib/youtube";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    youtube: {
      setYoutubeVideo: (options: { src: string }) => ReturnType;
    };
  }
}

export const Youtube = Node.create({
  name: "youtube",
  group: "block",
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      src: {
        default: null,
        parseHTML: (element) => element.getAttribute("src"),
        renderHTML: (attributes) => {
          if (!attributes.src) return {};
          return { src: attributes.src };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'iframe[src*="youtube"]',
        getAttrs: (el) => {
          if (!(el instanceof HTMLElement)) return false;
          const src = el.getAttribute("src") ?? "";
          const normalized = normalizeYoutubeEmbedUrl(src);
          return normalized ? { src: normalized } : false;
        },
      },
      {
        tag: 'div[data-youtube-video]',
        getAttrs: (el) => {
          if (!(el instanceof HTMLElement)) return false;
          const src = el.getAttribute("data-src") ?? "";
          const normalized = normalizeYoutubeEmbedUrl(src);
          return normalized ? { src: normalized } : false;
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const src =
      typeof HTMLAttributes.src === "string"
        ? normalizeYoutubeEmbedUrl(HTMLAttributes.src)
        : null;
    if (!src) {
      return ["div", { class: "youtube-embed youtube-embed--empty" }];
    }
    return [
      "div",
      {
        class: "youtube-embed",
        "data-youtube-video": "",
        "data-src": src,
      },
      [
        "iframe",
        mergeAttributes({
          src,
          title: "YouTube video",
          allow:
            "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share",
          allowfullscreen: "true",
          loading: "lazy",
          referrerpolicy: "strict-origin-when-cross-origin",
        }),
      ],
    ];
  },

  addCommands() {
    return {
      setYoutubeVideo:
        (options) =>
        ({ commands }) => {
          const src = normalizeYoutubeEmbedUrl(options.src);
          if (!src) return false;
          return commands.insertContent({
            type: this.name,
            attrs: { src },
          });
        },
    };
  },
});
