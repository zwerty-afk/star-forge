import type { BookResult } from "@/lib/types";
import { BookCard } from "./BookCard";

export function BookGrid({ books, emptyLabel }: { books: BookResult[]; emptyLabel?: string }) {
  if (books.length === 0) {
    return <p className="text-sm text-muted text-center py-6">{emptyLabel ?? "No books to show yet."}</p>;
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {books.map((book, i) => (
        <div key={book.id} className="animate-fade-in-up" style={{ animationDelay: `${i * 40}ms` }}>
          <BookCard book={book} />
        </div>
      ))}
    </div>
  );
}
