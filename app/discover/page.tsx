import { Navigation } from "@/components/layout/Navigation";
import { DiscoverBrowser } from "@/components/books/DiscoverBrowser";
import { allBooks } from "@/lib/demoData";
import { listAllCategories } from "@/lib/services/books";

export default function DiscoverPage() {
  const categories = listAllCategories();
  return (
    <>
      <Navigation />
      <main className="flex-1">
        <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-12 pb-4">
          <h1 className="font-serif text-3xl sm:text-4xl text-foreground">Discover the collection</h1>
          <p className="text-muted mt-2 max-w-xl">
            Browse {allBooks.length} books across {categories.length} categories, or head back home and just ask.
          </p>
        </section>
        <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-16">
          <DiscoverBrowser categories={categories} />
        </section>
      </main>
    </>
  );
}
