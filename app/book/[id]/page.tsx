import { notFound } from "next/navigation";
import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { BookDetails } from "@/components/books/BookDetails";
import { getBookById, recommendSimilarBooks } from "@/lib/services/books";

export default async function BookPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const book = await getBookById(id);
  if (!book) notFound();
  const { results: related } = await recommendSimilarBooks(id, 4);

  return (
    <>
      <Navigation />
      <main className="flex-1">
        <BookDetails book={book} related={related} />
      </main>
      <Footer />
    </>
  );
}
