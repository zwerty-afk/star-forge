import { Navigation } from "@/components/layout/Navigation";
import { VoiceAssistant } from "@/components/voice/VoiceAssistant";

export default function Home() {
  return (
    <>
      <Navigation />
      <main className="flex-1 flex flex-col">
        <section className="max-w-3xl mx-auto text-center px-4 sm:px-6 pt-14 pb-8">
          <h1 className="font-serif text-4xl sm:text-5xl leading-[1.1] text-foreground text-balance">
            Your library,
            <br />
            now you can talk to it.
          </h1>
          <p className="text-muted mt-4 text-base sm:text-lg max-w-xl mx-auto text-balance">
            Describe what you want to read in your own words. Athenaeum listens, searches, and speaks
            back with grounded recommendations from the catalog.
          </p>
        </section>

        <section className="flex-1 px-4 sm:px-6 pb-16">
          <VoiceAssistant />
        </section>
      </main>
    </>
  );
}
