import { Navigation } from "@/components/layout/Navigation";
import { MemoryPanel } from "@/components/memory/MemoryPanel";

export default function MemoryPage() {
  return (
    <>
      <Navigation />
      <main className="flex-1">
        <section className="max-w-3xl mx-auto px-4 sm:px-6 pt-12 pb-16">
          <h1 className="font-serif text-3xl sm:text-4xl text-foreground">My library</h1>
          <p className="text-muted mt-2 max-w-xl">
            What Athenaeum remembers about your taste, used to personalize recommendations. Nothing
            here leaves this browser&apos;s identity — no account or personal data required.
          </p>
          <div className="mt-8">
            <MemoryPanel />
          </div>
        </section>
      </main>
    </>
  );
}
