"use client";

import Link from "next/link";
import type { Book, BookResult } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { BookGrid } from "./BookGrid";
import { useVoiceHandoff } from "@/lib/useVoiceHandoff";

export function BookDetails({ book, related }: { book: Book; related: BookResult[] }) {
  const { askAboutBook } = useVoiceHandoff();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 flex flex-col gap-10">
      <Link href="/discover" className="text-sm text-muted hover:text-accent w-fit">
        ← Back to Discover
      </Link>

      <div className="flex flex-col sm:flex-row gap-6">
        <div
          className="w-32 h-44 sm:w-40 sm:h-56 rounded-xl shrink-0 flex items-center justify-center text-white font-serif text-3xl shadow-lg mx-auto sm:mx-0"
          style={{ background: `linear-gradient(155deg, ${book.coverColor}, color-mix(in srgb, ${book.coverColor} 60%, black))` }}
          aria-hidden="true"
        >
          {book.title
            .split(" ")
            .filter((w) => /^[A-Za-z]/.test(w))
            .slice(0, 2)
            .map((w) => w[0])
            .join("")
            .toUpperCase()}
        </div>

        <div className="flex-1 text-center sm:text-left">
          <h1 className="font-serif text-3xl sm:text-4xl text-foreground text-balance">{book.title}</h1>
          <p className="text-muted mt-1.5">by {book.author}</p>

          <div className="flex flex-wrap gap-2 mt-4 justify-center sm:justify-start">
            {book.categories.map((c) => (
              <Badge key={c} tone="accent">
                {c}
              </Badge>
            ))}
            <Badge tone={book.available ? "accent" : "danger"}>
              {book.available ? "Available now" : "Currently checked out"}
            </Badge>
          </div>

          <dl className="grid grid-cols-3 gap-4 mt-6 max-w-sm mx-auto sm:mx-0 text-center sm:text-left">
            <div>
              <dt className="text-xs text-muted">Year</dt>
              <dd className="font-medium">{book.year}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted">Pages</dt>
              <dd className="font-medium">{book.pages}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted">Location</dt>
              <dd className="font-medium text-xs leading-snug">{book.location}</dd>
            </div>
          </dl>

          <div className="mt-6 flex justify-center sm:justify-start">
            <Button onClick={() => askAboutBook(book)} size="md">
              🎙 Ask about this book
            </Button>
          </div>
        </div>
      </div>

      <div>
        <h2 className="font-serif text-xl text-foreground mb-2">About this book</h2>
        <p className="text-foreground/90 leading-relaxed">{book.description}</p>
      </div>

      {related.length > 0 && (
        <div>
          <h2 className="font-serif text-xl text-foreground mb-3">Readers also liked</h2>
          <BookGrid books={related} />
        </div>
      )}
    </div>
  );
}
