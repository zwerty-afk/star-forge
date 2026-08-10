"use client";

import { useMemo, useState } from "react";
import { BookGrid } from "./BookGrid";
import { allBooks } from "@/lib/demoData";

export function DiscoverBrowser({ categories }: { categories: string[] }) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    let books = allBooks;
    if (activeCategory) books = books.filter((b) => b.categories.includes(activeCategory));
    if (query.trim()) {
      const q = query.toLowerCase();
      books = books.filter(
        (b) => b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q)
      );
    }
    return books;
  }, [activeCategory, query]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <label className="relative w-full sm:max-w-xs">
          <span className="sr-only">Search by title or author</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title or author"
            className="w-full rounded-full border border-border bg-surface px-4 py-2.5 text-sm text-foreground placeholder:text-muted focus-visible:outline-2 focus-visible:outline-accent"
          />
        </label>
        <div className="flex flex-wrap gap-2 overflow-x-auto scrollbar-thin -mx-1 px-1 sm:mx-0 sm:px-0">
          <CategoryChip label="All" active={activeCategory === null} onClick={() => setActiveCategory(null)} />
          {categories.map((c) => (
            <CategoryChip key={c} label={c} active={activeCategory === c} onClick={() => setActiveCategory(c)} />
          ))}
        </div>
      </div>

      <BookGrid books={filtered} emptyLabel="No books match that search. Try a different title or author." />
    </div>
  );
}

function CategoryChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium border transition-colors ${
        active
          ? "bg-accent text-white border-accent"
          : "bg-surface text-muted border-border hover:text-foreground hover:border-accent/40"
      }`}
    >
      {label}
    </button>
  );
}
