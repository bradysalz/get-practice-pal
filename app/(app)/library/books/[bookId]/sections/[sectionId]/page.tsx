import { notFound } from "next/navigation";
import { SectionDetailPage } from "@/components/library-detail-pages";
import { getLibrarySnapshot } from "@/lib/data/library";

export default async function LibrarySectionPage({
  params,
}: {
  params: Promise<{ bookId: string; sectionId: string }>;
}) {
  const { bookId, sectionId } = await params;
  const snapshot = await getLibrarySnapshot();
  const book = snapshot.books.find((item) => item.id === bookId);

  if (!book) {
    notFound();
  }

  const section = book.sections?.find((item) => item.id === sectionId);

  if (!section) {
    notFound();
  }

  return <SectionDetailPage book={book} section={section} />;
}
