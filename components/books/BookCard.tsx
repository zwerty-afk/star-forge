import Link from "next/link";
import type { BookResult } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";

export function BookCard({ book }: { book: BookResult }) {
  const initials = book.title
    .split(" ")
    .filter((w) => /^[A-Za-z]/.test(w))
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <Link href={`/book/${book.id}`} className="group block">
      <Card className="p-4 h-full flex flex-col gap-3 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_1px_2px_rgb(var(--shadow-color)/0.04),0_16px_32px_-12px_rgb(var(--shadow-color)/0.16)]">
        <div className="flex gap-3">
          <div
            className="w-14 h-20 rounded-lg shrink-0 flex items-center justify-center text-white font-serif text-lg shadow-sm"
            style={{ background: `linear-gradient(155deg, ${book.coverColor}, color-mix(in srgb, ${book.coverColor} 60%, black))` }}
            aria-hidden="true"
          >
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-serif text-base leading-snug text-foreground truncate group-hover:text-accent transition-colors">
              {book.title}
            </h3>
            <p className="text-sm text-muted mt-0.5 truncate">{book.author}</p>
            <div className="flex flex-wrap gap-1.5 mt-2">
              <Badge tone="accent">{book.categories[0]}</Badge>
              <Badge tone={book.available ? "accent" : "danger"}>
                {book.available ? "Available" : "Checked out"}
              </Badge>
            </div>
          </div>
        </div>
        {book.reason && (
          <p className="text-xs text-muted leading-relaxed border-t border-border pt-2.5 line-clamp-2">
            {book.reason}
          </p>
        )}
      </Card>
    </Link>
  );
}
