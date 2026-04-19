const GOOGLE_BOOKS_VOLUMES_URL = "https://www.googleapis.com/books/v1/volumes";

export type GoogleBooksSearchInput = {
  isbn?: string | null;
  title?: string | null;
  author?: string | null;
  maxResults?: number;
};

export type GoogleBooksCandidate = {
  provider: "google_books";
  providerBookId: string;
  title: string;
  subtitle: string | null;
  authors: string[];
  publishedDate: string | null;
  description: string | null;
  isbn10: string | null;
  isbn13: string | null;
  pageCount: number | null;
  language: string | null;
  coverThumbnailUrl: string | null;
  coverSmallUrl: string | null;
  coverMediumUrl: string | null;
  coverLargeUrl: string | null;
  canonicalUrl: string | null;
};

type GoogleBooksIndustryIdentifier = {
  type?: string;
  identifier?: string;
};

type GoogleBooksImageLinks = {
  smallThumbnail?: string;
  thumbnail?: string;
  small?: string;
  medium?: string;
  large?: string;
  extraLarge?: string;
};

type GoogleBooksVolumeInfo = {
  title?: string;
  subtitle?: string;
  authors?: string[];
  publishedDate?: string;
  description?: string;
  industryIdentifiers?: GoogleBooksIndustryIdentifier[];
  pageCount?: number;
  language?: string;
  imageLinks?: GoogleBooksImageLinks;
  canonicalVolumeLink?: string;
  infoLink?: string;
};

type GoogleBooksVolume = {
  id?: string;
  volumeInfo?: GoogleBooksVolumeInfo;
};

type GoogleBooksResponse = {
  items?: GoogleBooksVolume[];
};

function cleanText(value: string | null | undefined) {
  return value?.trim() || null;
}

function normalizeIsbn(value: string | null | undefined) {
  return cleanText(value)?.replace(/[-\s]/g, "") ?? null;
}

function getIdentifier(
  identifiers: GoogleBooksIndustryIdentifier[] | undefined,
  type: "ISBN_10" | "ISBN_13",
) {
  return normalizeIsbn(identifiers?.find((item) => item.type === type)?.identifier);
}

function buildQuery(input: GoogleBooksSearchInput) {
  const isbn = normalizeIsbn(input.isbn);

  if (isbn) {
    return `isbn:${isbn}`;
  }

  const parts = [cleanText(input.title), cleanText(input.author)]
    .filter((part): part is string => Boolean(part))
    .map((part) => `"${part.replaceAll('"', "")}"`);

  if (!parts.length) {
    throw new Error("Provide an ISBN, title, or author to search Google Books.");
  }

  return parts.join(" ");
}

function normalizeImageUrl(value: string | null | undefined) {
  const text = cleanText(value);
  return text ? text.replace(/^http:/, "https:") : null;
}

function toCandidate(volume: GoogleBooksVolume): GoogleBooksCandidate | null {
  const volumeInfo = volume.volumeInfo;
  const title = cleanText(volumeInfo?.title);

  if (!volume.id || !volumeInfo || !title) {
    return null;
  }

  return {
    provider: "google_books",
    providerBookId: volume.id,
    title,
    subtitle: cleanText(volumeInfo.subtitle),
    authors: volumeInfo.authors ?? [],
    publishedDate: cleanText(volumeInfo.publishedDate),
    description: cleanText(volumeInfo.description),
    isbn10: getIdentifier(volumeInfo.industryIdentifiers, "ISBN_10"),
    isbn13: getIdentifier(volumeInfo.industryIdentifiers, "ISBN_13"),
    pageCount: volumeInfo.pageCount ?? null,
    language: cleanText(volumeInfo.language),
    coverThumbnailUrl: normalizeImageUrl(volumeInfo.imageLinks?.thumbnail),
    coverSmallUrl: normalizeImageUrl(volumeInfo.imageLinks?.small),
    coverMediumUrl: normalizeImageUrl(volumeInfo.imageLinks?.medium),
    coverLargeUrl: normalizeImageUrl(volumeInfo.imageLinks?.large ?? volumeInfo.imageLinks?.extraLarge),
    canonicalUrl: normalizeImageUrl(volumeInfo.canonicalVolumeLink ?? volumeInfo.infoLink),
  };
}

export async function searchGoogleBooks(input: GoogleBooksSearchInput) {
  const query = buildQuery(input);
  const maxResults = Math.min(Math.max(input.maxResults ?? 10, 1), 20);
  const params = new URLSearchParams({
    maxResults: String(maxResults),
    printType: "books",
    q: query,
  });
  const apiKey = process.env.GOOGLE_BOOKS_API_KEY?.trim();

  if (apiKey) {
    params.set("key", apiKey);
  }

  const response = await fetch(`${GOOGLE_BOOKS_VOLUMES_URL}?${params.toString()}`, {
    headers: {
      Accept: "application/json",
    },
    next: {
      revalidate: 60 * 60 * 24,
    },
  });

  if (!response.ok) {
    throw new Error(`Google Books lookup failed with status ${response.status}.`);
  }

  const payload = (await response.json()) as GoogleBooksResponse;
  return (payload.items ?? []).map(toCandidate).filter((item): item is GoogleBooksCandidate => Boolean(item));
}

export async function lookupGoogleBookByIsbn(isbn: string) {
  return searchGoogleBooks({
    isbn,
    maxResults: 5,
  });
}
