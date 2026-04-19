import { requireSupabaseClient, requireUser } from "@/lib/auth/session";
import type { GoogleBooksCandidate } from "@/lib/data/google-books";
import type { ExternalBook, ExternalBookUpsert } from "@/lib/data/types";

type ExternalBookRow = {
  id: string;
  created_by_user_id: string | null;
  provider: string;
  provider_book_id: string;
  isbn_10: string | null;
  isbn_13: string | null;
  title: string;
  subtitle: string | null;
  authors: string[] | null;
  published_year: number | null;
  published_date: string | null;
  description: string | null;
  language: string | null;
  page_count: number | null;
  cover_thumbnail_url: string | null;
  cover_small_url: string | null;
  cover_medium_url: string | null;
  cover_large_url: string | null;
  canonical_url: string | null;
  raw_metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
};

function toExternalBook(row: ExternalBookRow): ExternalBook {
  return {
    id: row.id,
    createdByUserId: row.created_by_user_id,
    provider: row.provider,
    providerBookId: row.provider_book_id,
    isbn10: row.isbn_10,
    isbn13: row.isbn_13,
    title: row.title,
    subtitle: row.subtitle,
    authors: row.authors ?? [],
    publishedYear: row.published_year,
    publishedDate: row.published_date,
    description: row.description,
    language: row.language,
    pageCount: row.page_count,
    coverThumbnailUrl: row.cover_thumbnail_url,
    coverSmallUrl: row.cover_small_url,
    coverMediumUrl: row.cover_medium_url,
    coverLargeUrl: row.cover_large_url,
    canonicalUrl: row.canonical_url,
    rawMetadata: row.raw_metadata ?? {},
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toExternalBookRow(input: ExternalBookUpsert) {
  return {
    provider: input.provider,
    provider_book_id: input.providerBookId,
    isbn_10: input.isbn10 ?? null,
    isbn_13: input.isbn13 ?? null,
    title: input.title,
    subtitle: input.subtitle ?? null,
    authors: input.authors ?? [],
    published_year: input.publishedYear ?? null,
    published_date: input.publishedDate ?? null,
    description: input.description ?? null,
    language: input.language ?? null,
    page_count: input.pageCount ?? null,
    cover_thumbnail_url: input.coverThumbnailUrl ?? null,
    cover_small_url: input.coverSmallUrl ?? null,
    cover_medium_url: input.coverMediumUrl ?? null,
    cover_large_url: input.coverLargeUrl ?? null,
    canonical_url: input.canonicalUrl ?? null,
    raw_metadata: input.rawMetadata ?? {},
  };
}

export async function upsertExternalBook(input: ExternalBookUpsert) {
  const client = await requireSupabaseClient();
  const user = await requireUser();
  const existing = await findExternalBookByProviderId(input.provider, input.providerBookId);

  if (existing) {
    return existing;
  }

  const { data, error } = await client
    .from("external_books")
    .insert({
      ...toExternalBookRow(input),
      created_by_user_id: user.id,
    })
    .select()
    .single();

  if (error) throw error;
  return toExternalBook(data as ExternalBookRow);
}

export async function findExternalBookByProviderId(provider: string, providerBookId: string) {
  const client = await requireSupabaseClient();
  const { data, error } = await client
    .from("external_books")
    .select()
    .eq("provider", provider)
    .eq("provider_book_id", providerBookId)
    .maybeSingle();

  if (error) throw error;
  return data ? toExternalBook(data as ExternalBookRow) : null;
}

export async function findExternalBooksByIsbn(isbn: string) {
  const client = await requireSupabaseClient();
  const normalizedIsbn = isbn.trim();
  const { data, error } = await client
    .from("external_books")
    .select()
    .or(`isbn_10.eq.${normalizedIsbn},isbn_13.eq.${normalizedIsbn}`)
    .order("title");

  if (error) throw error;
  return ((data ?? []) as ExternalBookRow[]).map(toExternalBook);
}

export function externalBookUpsertFromGoogleBooksCandidate(
  candidate: GoogleBooksCandidate,
): ExternalBookUpsert {
  return {
    provider: candidate.provider,
    providerBookId: candidate.providerBookId,
    isbn10: candidate.isbn10,
    isbn13: candidate.isbn13,
    title: candidate.title,
    subtitle: candidate.subtitle,
    authors: candidate.authors,
    publishedYear: candidate.publishedYear,
    publishedDate: candidate.publishedDate,
    description: candidate.description,
    language: candidate.language,
    pageCount: candidate.pageCount,
    coverThumbnailUrl: candidate.coverThumbnailUrl,
    coverSmallUrl: candidate.coverSmallUrl,
    coverMediumUrl: candidate.coverMediumUrl,
    coverLargeUrl: candidate.coverLargeUrl,
    canonicalUrl: candidate.canonicalUrl,
    rawMetadata: candidate,
  };
}
