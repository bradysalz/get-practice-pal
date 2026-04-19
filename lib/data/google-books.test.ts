import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { normalizeGoogleBooksVolume } from "./google-books.ts";

describe("normalizeGoogleBooksVolume", () => {
  it("extracts identifiers, publication data, cover URLs, and provider IDs", () => {
    const candidate = normalizeGoogleBooksVolume({
      id: "abc123",
      volumeInfo: {
        title: " Stick Control ",
        subtitle: " For the Snare Drummer ",
        authors: ["George Lawrence Stone"],
        publishedDate: "2009-10-01",
        description: "Classic drum method.",
        industryIdentifiers: [
          {
            type: "ISBN_10",
            identifier: "1892764040",
          },
          {
            type: "ISBN_13",
            identifier: "978-1892764041",
          },
        ],
        pageCount: 48,
        language: "en",
        imageLinks: {
          thumbnail: "http://books.google.com/thumb",
          small: "http://books.google.com/small",
          medium: "https://books.google.com/medium",
          extraLarge: "http://books.google.com/extra-large",
          large: "http://books.google.com/large",
        },
        canonicalVolumeLink: "http://books.google.com/canonical",
      },
    });

    assert.deepEqual(candidate, {
      provider: "google_books",
      providerBookId: "abc123",
      title: "Stick Control",
      subtitle: "For the Snare Drummer",
      authors: ["George Lawrence Stone"],
      publishedYear: 2009,
      publishedDate: "2009-10-01",
      description: "Classic drum method.",
      isbn10: "1892764040",
      isbn13: "9781892764041",
      pageCount: 48,
      language: "en",
      coverThumbnailUrl: "https://books.google.com/thumb",
      coverSmallUrl: "https://books.google.com/small",
      coverMediumUrl: "https://books.google.com/medium",
      coverLargeUrl: "https://books.google.com/extra-large",
      canonicalUrl: "https://books.google.com/canonical",
    });
  });

  it("handles partial payloads without throwing", () => {
    const candidate = normalizeGoogleBooksVolume({
      id: "partial",
      volumeInfo: {
        title: "No Frills",
      },
    });

    assert.deepEqual(candidate, {
      provider: "google_books",
      providerBookId: "partial",
      title: "No Frills",
      subtitle: null,
      authors: [],
      publishedYear: null,
      publishedDate: null,
      description: null,
      isbn10: null,
      isbn13: null,
      pageCount: null,
      language: null,
      coverThumbnailUrl: null,
      coverSmallUrl: null,
      coverMediumUrl: null,
      coverLargeUrl: null,
      canonicalUrl: null,
    });
  });

  it("drops payloads without a provider ID or title", () => {
    assert.equal(
      normalizeGoogleBooksVolume({
        volumeInfo: {
          title: "Missing ID",
        },
      }),
      null,
    );
    assert.equal(
      normalizeGoogleBooksVolume({
        id: "missing-title",
        volumeInfo: {},
      }),
      null,
    );
  });
});
