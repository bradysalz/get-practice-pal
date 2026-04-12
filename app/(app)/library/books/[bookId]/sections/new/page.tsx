import { notFound } from "next/navigation";
import { SectionDetailPage } from "@/components/library-detail-pages";
import { getLibrarySnapshot } from "@/lib/data/library";

export default async function LibraryNewSectionPage({
  params,
}: {
  params: Promise<{ bookId: string }>;
}) {
  const { bookId } = await params;
  const snapshot = await getLibrarySnapshot();
  const book = snapshot.books.find((item) => item.id === bookId);

  if (!book) {
    notFound();
  }

  return <SectionDetailPage book={book} />;
}
