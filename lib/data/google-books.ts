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
  publishedYear: number | null;
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

export type GoogleBooksIndustryIdentifier = {
  type?: string;
  identifier?: string;
};

export type GoogleBooksImageLinks = {
  smallThumbnail?: string;
  thumbnail?: string;
  small?: string;
  medium?: string;
  large?: string;
  extraLarge?: string;
};

export type GoogleBooksVolumeInfo = {
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

export type GoogleBooksVolume = {
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

function cleanQueryTerm(value: string | null | undefined) {
  return cleanText(value)?.replaceAll('"', "") ?? null;
}

function getIdentifier(
  identifiers: GoogleBooksIndustryIdentifier[] | undefined,
  type: "ISBN_10" | "ISBN_13",
) {
  return normalizeIsbn(identifiers?.find((item) => item.type === type)?.identifier);
}

function buildTextQuery(input: Pick<GoogleBooksSearchInput, "author" | "title">) {
  return [cleanQueryTerm(input.title), cleanQueryTerm(input.author)]
    .filter((part): part is string => Boolean(part))
    .join(" ");
}

function buildScopedTextQuery(input: Pick<GoogleBooksSearchInput, "author" | "title">) {
  return [
    cleanQueryTerm(input.title) ? `intitle:${cleanQueryTerm(input.title)}` : null,
    cleanQueryTerm(input.author) ? `inauthor:${cleanQueryTerm(input.author)}` : null,
  ]
    .filter((part): part is string => Boolean(part))
    .join(" ");
}

function buildQueryPlan(input: GoogleBooksSearchInput) {
  const isbn = normalizeIsbn(input.isbn);
  const scopedTextQuery = buildScopedTextQuery(input);
  const textQuery = buildTextQuery(input);
  const scopedTitleQuery = buildScopedTextQuery({
    title: input.title,
  });
  const titleQuery = buildTextQuery({
    title: input.title,
  });
  const scopedAuthorQuery = buildScopedTextQuery({
    author: input.author,
  });
  const authorQuery = buildTextQuery({
    author: input.author,
  });
  const queries = [
    isbn ? `isbn:${isbn}` : null,
    scopedTextQuery,
    textQuery,
    scopedTitleQuery,
    titleQuery,
    scopedAuthorQuery,
    authorQuery,
  ].filter((query): query is string => Boolean(query));
  const uniqueQueries = Array.from(new Set(queries));

  if (uniqueQueries.length) {
    return uniqueQueries;
  }

  throw new Error("Provide an ISBN, title, or author to search Google Books.");
}

function normalizeImageUrl(value: string | null | undefined) {
  const text = cleanText(value);
  return text ? text.replace(/^http:/, "https:") : null;
}

function parsePublishedYear(publishedDate: string | null) {
  const match = publishedDate?.match(/^\d{4}/);
  return match ? Number(match[0]) : null;
}

function coverScore(candidate: GoogleBooksCandidate) {
  if (candidate.coverLargeUrl) return 4;
  if (candidate.coverMediumUrl) return 3;
  if (candidate.coverSmallUrl) return 2;
  if (candidate.coverThumbnailUrl) return 1;
  return 0;
}

function sortCandidatesByCoverPriority(candidates: GoogleBooksCandidate[]) {
  return candidates
    .map((candidate, index) => ({
      candidate,
      index,
    }))
    .sort((left, right) => {
      const scoreDifference = coverScore(right.candidate) - coverScore(left.candidate);

      if (scoreDifference !== 0) {
        return scoreDifference;
      }

      return left.index - right.index;
    })
    .map(({ candidate }) => candidate);
}

export function normalizeGoogleBooksVolume(volume: GoogleBooksVolume): GoogleBooksCandidate | null {
  const volumeInfo = volume.volumeInfo;
  const title = cleanText(volumeInfo?.title);
  const publishedDate = cleanText(volumeInfo?.publishedDate);

  if (!volume.id || !volumeInfo || !title) {
    return null;
  }

  return {
    provider: "google_books",
    providerBookId: volume.id,
    title,
    subtitle: cleanText(volumeInfo.subtitle),
    authors: volumeInfo.authors ?? [],
    publishedYear: parsePublishedYear(publishedDate),
    publishedDate,
    description: cleanText(volumeInfo.description),
    isbn10: getIdentifier(volumeInfo.industryIdentifiers, "ISBN_10"),
    isbn13: getIdentifier(volumeInfo.industryIdentifiers, "ISBN_13"),
    pageCount: volumeInfo.pageCount ?? null,
    language: cleanText(volumeInfo.language),
    coverThumbnailUrl: normalizeImageUrl(volumeInfo.imageLinks?.thumbnail),
    coverSmallUrl: normalizeImageUrl(volumeInfo.imageLinks?.small),
    coverMediumUrl: normalizeImageUrl(volumeInfo.imageLinks?.medium),
    coverLargeUrl: normalizeImageUrl(
      volumeInfo.imageLinks?.extraLarge ?? volumeInfo.imageLinks?.large,
    ),
    canonicalUrl: normalizeImageUrl(volumeInfo.canonicalVolumeLink ?? volumeInfo.infoLink),
  };
}

export async function searchGoogleBooks(input: GoogleBooksSearchInput) {
  const queries = buildQueryPlan(input);
  const maxResults = Math.min(Math.max(input.maxResults ?? 10, 1), 20);
  const apiKey = process.env.GOOGLE_BOOKS_API_KEY?.trim();

  for (const [index, query] of queries.entries()) {
    const params = new URLSearchParams({
      maxResults: String(maxResults),
      printType: "books",
      q: query,
    });

    if (apiKey) {
      params.set("key", apiKey);
    }

    const response = await fetch(`${GOOGLE_BOOKS_VOLUMES_URL}?${params.toString()}`, {
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      const hasFallback = index < queries.length - 1;

      if (response.status >= 500 && hasFallback) {
        continue;
      }

      if (response.status >= 500) {
        return [];
      }

      throw new Error(`Google Books lookup failed with status ${response.status}.`);
    }

    const payload = (await response.json()) as GoogleBooksResponse;
    const candidates = sortCandidatesByCoverPriority(
      (payload.items ?? [])
      .map(normalizeGoogleBooksVolume)
      .filter((item): item is GoogleBooksCandidate => Boolean(item)),
    );

    if (candidates.length) {
      return candidates;
    }
  }

  return [];
}

export async function lookupGoogleBookByIsbn(isbn: string) {
  return searchGoogleBooks({
    isbn,
    maxResults: 5,
  });
}
