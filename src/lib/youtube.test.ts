import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  normalizeYoutubeEmbedUrl,
  parseYoutubeVideoId,
  toYoutubeEmbedUrl,
} from "./youtube";

const ID = "dQw4w9WgXcQ";

describe("parseYoutubeVideoId", () => {
  it("accepts bare video IDs", () => {
    assert.equal(parseYoutubeVideoId(ID), ID);
  });

  it("parses watch URLs", () => {
    assert.equal(
      parseYoutubeVideoId(`https://www.youtube.com/watch?v=${ID}`),
      ID
    );
    assert.equal(
      parseYoutubeVideoId(`https://youtube.com/watch?v=${ID}&t=10`),
      ID
    );
  });

  it("parses youtu.be short links", () => {
    assert.equal(parseYoutubeVideoId(`https://youtu.be/${ID}`), ID);
  });

  it("parses embed and shorts URLs", () => {
    assert.equal(
      parseYoutubeVideoId(`https://www.youtube.com/embed/${ID}`),
      ID
    );
    assert.equal(
      parseYoutubeVideoId(`https://www.youtube.com/shorts/${ID}`),
      ID
    );
    assert.equal(
      parseYoutubeVideoId(
        `https://www.youtube-nocookie.com/embed/${ID}`
      ),
      ID
    );
  });

  it("rejects unknown hosts and bad IDs", () => {
    assert.equal(parseYoutubeVideoId("https://vimeo.com/123"), null);
    assert.equal(parseYoutubeVideoId("https://youtube.com/watch?v=short"), null);
    assert.equal(parseYoutubeVideoId(""), null);
    assert.equal(parseYoutubeVideoId("not a url"), null);
  });
});

describe("normalizeYoutubeEmbedUrl", () => {
  it("returns nocookie embed URLs", () => {
    assert.equal(
      normalizeYoutubeEmbedUrl(`https://youtu.be/${ID}`),
      `https://www.youtube-nocookie.com/embed/${ID}`
    );
    assert.equal(toYoutubeEmbedUrl(ID), `https://www.youtube-nocookie.com/embed/${ID}`);
  });

  it("returns null for invalid input", () => {
    assert.equal(normalizeYoutubeEmbedUrl("https://example.com"), null);
  });
});
