import { writeFileSync } from "fs";
import { join } from "path";
import type { Book } from "../lib/types";

interface Seed {
  title: string;
  author: string;
  description: string;
  categories: string[];
  subjects: string[];
  year: number;
  pages: number;
}

const seeds: Seed[] = [
  // Fiction
  { title: "The Alchemist", author: "Paulo Coelho", description: "A shepherd boy named Santiago travels from Spain to the Egyptian desert in search of a treasure, discovering along the way that the real treasure is the journey and self-knowledge it brings.", categories: ["Fiction"], subjects: ["philosophy", "journey", "self-discovery"], year: 1988, pages: 208 },
  { title: "The Kite Runner", author: "Khaled Hosseini", description: "A story of friendship and betrayal set against the backdrop of Afghanistan's turbulent history, following a boy's quest for redemption.", categories: ["Fiction"], subjects: ["friendship", "redemption", "Afghanistan"], year: 2003, pages: 371 },
  { title: "Life of Pi", author: "Yann Martel", description: "A young man survives 227 days stranded on a lifeboat in the Pacific Ocean with a Bengal tiger, blending adventure with meditations on faith and storytelling.", categories: ["Fiction"], subjects: ["survival", "faith", "adventure"], year: 2001, pages: 319 },
  { title: "The Book Thief", author: "Markus Zusak", description: "Narrated by Death, this novel follows a young girl in Nazi Germany who finds solace by stealing books and sharing them with others.", categories: ["Fiction", "History"], subjects: ["World War II", "books", "resilience"], year: 2005, pages: 552 },
  { title: "A Thousand Splendid Suns", author: "Khaled Hosseini", description: "Two women in Afghanistan forge an unlikely bond as they endure decades of hardship, war, and the fight to protect those they love.", categories: ["Fiction"], subjects: ["Afghanistan", "resilience", "friendship"], year: 2007, pages: 367 },
  { title: "The Night Circus", author: "Erin Morgenstern", description: "A magical competition between two illusionists unfolds within a mysterious circus that only opens at night, weaving romance with enchantment.", categories: ["Fiction", "Fantasy"], subjects: ["magic", "romance", "circus"], year: 2011, pages: 387 },
  { title: "Normal People", author: "Sally Rooney", description: "A tender, complicated relationship between two Irish teenagers evolves through school and university, exploring class, intimacy, and communication.", categories: ["Fiction"], subjects: ["relationships", "coming of age"], year: 2018, pages: 273 },
  { title: "The Goldfinch", author: "Donna Tartt", description: "After surviving a bombing that kills his mother, a young boy clings to a stolen painting that shapes the rest of his turbulent life.", categories: ["Fiction"], subjects: ["art", "grief", "coming of age"], year: 2013, pages: 771 },
  { title: "Where the Crawdads Sing", author: "Delia Owens", description: "A girl raised alone in the marshes of North Carolina becomes a murder suspect, in a story blending mystery with nature writing.", categories: ["Fiction"], subjects: ["mystery", "nature", "isolation"], year: 2018, pages: 384 },
  { title: "The Silent Patient", author: "Alex Michaelides", description: "A psychotherapist becomes obsessed with treating a woman who shot her husband and then never spoke again, unraveling a shocking psychological mystery.", categories: ["Fiction"], subjects: ["psychological thriller", "mystery"], year: 2019, pages: 336 },
  { title: "Circe", author: "Madeline Miller", description: "A reimagining of Greek mythology from the perspective of the witch Circe, exploring power, exile, and self-invention.", categories: ["Fiction", "Fantasy"], subjects: ["mythology", "Greek gods", "feminism"], year: 2018, pages: 393 },
  { title: "The Midnight Library", author: "Matt Haig", description: "Between life and death lies a library of infinite books, each one a different version of the life a woman could have lived.", categories: ["Fiction", "Fantasy"], subjects: ["regret", "possibility", "philosophy"], year: 2020, pages: 288 },

  // Science Fiction
  { title: "Dune", author: "Frank Herbert", description: "On the desert planet Arrakis, a young noble becomes entangled in politics, religion, and ecology in humanity's greatest science fiction epic.", categories: ["Science Fiction"], subjects: ["politics", "ecology", "empire"], year: 1965, pages: 412 },
  { title: "Project Hail Mary", author: "Andy Weir", description: "A lone astronaut wakes up with no memory on a solo mission to save humanity, and must use science and ingenuity to survive.", categories: ["Science Fiction"], subjects: ["space", "survival", "problem-solving"], year: 2021, pages: 476 },
  { title: "The Three-Body Problem", author: "Liu Cixin", description: "A secret military project makes contact with an alien civilization, setting off a chain of events that will change humanity's future forever.", categories: ["Science Fiction"], subjects: ["first contact", "physics", "China"], year: 2008, pages: 400 },
  { title: "Snow Crash", author: "Neal Stephenson", description: "In a near-future America run by corporations, a hacker and pizza delivery driver uncovers a dangerous linguistic virus spreading through the metaverse.", categories: ["Science Fiction"], subjects: ["cyberpunk", "virtual reality", "linguistics"], year: 1992, pages: 480 },
  { title: "Ancillary Justice", author: "Ann Leckie", description: "The sole survivor of a starship's destroyed AI seeks revenge across the galaxy, questioning identity, gender, and empire along the way.", categories: ["Science Fiction"], subjects: ["artificial intelligence", "empire", "identity"], year: 2013, pages: 400 },
  { title: "The Martian", author: "Andy Weir", description: "An astronaut stranded alone on Mars must use his ingenuity and scientific knowledge to survive until rescue is possible.", categories: ["Science Fiction"], subjects: ["survival", "space", "engineering"], year: 2011, pages: 369 },
  { title: "Children of Time", author: "Adrian Tchaikovsky", description: "A terraforming experiment accidentally uplifts spiders to sentience, chronicling their civilization's rise as humanity's last survivors approach.", categories: ["Science Fiction"], subjects: ["evolution", "terraforming", "civilization"], year: 2015, pages: 600 },
  { title: "Neuromancer", author: "William Gibson", description: "A washed-up computer hacker is hired for one last job that plunges him into a shadowy conspiracy in cyberspace, the novel that defined cyberpunk.", categories: ["Science Fiction"], subjects: ["cyberpunk", "hacking", "artificial intelligence"], year: 1984, pages: 271 },
  { title: "The Left Hand of Darkness", author: "Ursula K. Le Guin", description: "An envoy visits a planet whose inhabitants have no fixed gender, exploring identity, politics, and the nature of trust in an alien society.", categories: ["Science Fiction"], subjects: ["gender", "anthropology", "politics"], year: 1969, pages: 304 },
  { title: "Klara and the Sun", author: "Kazuo Ishiguro", description: "An artificial friend observes the world with wonder and devotion, raising questions about love, consciousness, and what makes us human.", categories: ["Science Fiction"], subjects: ["artificial intelligence", "consciousness", "love"], year: 2021, pages: 303 },

  // Fantasy
  { title: "The Name of the Wind", author: "Patrick Rothfuss", description: "A legendary figure recounts his youth as a gifted student of magic, chronicling his rise from orphan to arcanist in a richly built world.", categories: ["Fantasy"], subjects: ["magic", "coming of age", "storytelling"], year: 2007, pages: 662 },
  { title: "Mistborn: The Final Empire", author: "Brandon Sanderson", description: "In a world where ash falls from the sky, a young street thief discovers she has the rare power to rebel against a thousand-year-old tyrant.", categories: ["Fantasy"], subjects: ["magic systems", "rebellion", "heist"], year: 2006, pages: 541 },
  { title: "A Game of Thrones", author: "George R. R. Martin", description: "Noble families vie for control of the Iron Throne while an ancient threat stirs beyond a massive wall of ice in the north.", categories: ["Fantasy"], subjects: ["politics", "war", "dragons"], year: 1996, pages: 694 },
  { title: "The Hobbit", author: "J.R.R. Tolkien", description: "A reluctant hobbit is swept into an epic quest to reclaim a dwarven kingdom from a fearsome dragon, told with warmth and wonder.", categories: ["Fantasy"], subjects: ["adventure", "dragons", "quest"], year: 1937, pages: 310 },
  { title: "The Fellowship of the Ring", author: "J.R.R. Tolkien", description: "A hobbit and his companions set out on a perilous journey to destroy a powerful ring before it falls into the hands of a dark lord.", categories: ["Fantasy"], subjects: ["quest", "friendship", "good versus evil"], year: 1954, pages: 423 },
  { title: "The Priory of the Orange Tree", author: "Samantha Shannon", description: "A sprawling standalone fantasy of dragons, queens, and an ancient evil threatening to awaken, told across interconnected kingdoms.", categories: ["Fantasy"], subjects: ["dragons", "queens", "epic fantasy"], year: 2019, pages: 848 },
  { title: "The Way of Kings", author: "Brandon Sanderson", description: "On a war-torn world of storms and ancient magic, a slave, a scholar, and a highprince navigate destinies tied to a returning apocalypse.", categories: ["Fantasy"], subjects: ["epic fantasy", "war", "destiny"], year: 2010, pages: 1007 },
  { title: "Uprooted", author: "Naomi Novik", description: "A young woman is taken by a reclusive wizard to serve him, discovering her own latent magical power while a corrupted forest threatens her village.", categories: ["Fantasy"], subjects: ["magic", "folklore", "coming of age"], year: 2015, pages: 435 },
  { title: "The Lies of Locke Lamora", author: "Scott Lynch", description: "A gifted con artist and his gang of thieves pull off elaborate heists in a fantastical city, until a rival threatens everything they've built.", categories: ["Fantasy"], subjects: ["heist", "thieves", "adventure"], year: 2006, pages: 499 },
  { title: "Harry Potter and the Sorcerer's Stone", author: "J.K. Rowling", description: "An orphaned boy discovers he is a wizard and enrolls at a magical school, beginning a journey of friendship, courage, and self-discovery.", categories: ["Fantasy"], subjects: ["magic", "school", "friendship"], year: 1997, pages: 309 },

  // History
  { title: "Sapiens: A Brief History of Humankind", author: "Yuval Noah Harari", description: "A sweeping account of how Homo sapiens came to dominate the planet, tracing the cognitive, agricultural, and scientific revolutions.", categories: ["History"], subjects: ["anthropology", "civilization", "evolution"], year: 2011, pages: 443 },
  { title: "Guns, Germs, and Steel", author: "Jared Diamond", description: "An exploration of why some civilizations conquered others, tracing the roles of geography, agriculture, and disease in shaping history.", categories: ["History"], subjects: ["geography", "civilization", "conquest"], year: 1997, pages: 480 },
  { title: "The Silk Roads", author: "Peter Frankopan", description: "A retelling of world history centered on the trade routes connecting East and West, revealing their enduring influence on global power.", categories: ["History"], subjects: ["trade", "globalization", "empire"], year: 2015, pages: 636 },
  { title: "SPQR: A History of Ancient Rome", author: "Mary Beard", description: "A vivid history of ancient Rome from its founding myths to the empire's peak, told with clarity and a scholar's precision.", categories: ["History"], subjects: ["Rome", "ancient history", "politics"], year: 2015, pages: 606 },
  { title: "The Wright Brothers", author: "David McCullough", description: "The story of two self-taught bicycle mechanics from Ohio who achieved humanity's first powered flight through relentless experimentation.", categories: ["History"], subjects: ["aviation", "invention", "biography"], year: 2015, pages: 320 },
  { title: "A People's History of the United States", author: "Howard Zinn", description: "An alternative account of American history told from the perspective of workers, women, and marginalized communities rather than the powerful.", categories: ["History"], subjects: ["United States", "social history", "politics"], year: 1980, pages: 729 },
  { title: "The Guns of August", author: "Barbara W. Tuchman", description: "A gripping narrative of the first month of World War I, detailing the diplomatic failures and decisions that plunged Europe into catastrophe.", categories: ["History"], subjects: ["World War I", "diplomacy", "military history"], year: 1962, pages: 511 },
  { title: "Indian Summer: The Secret History of the End of an Empire", author: "Alex von Tunzelmann", description: "A dramatic account of the final years of British rule in India and the tumultuous birth of India and Pakistan as independent nations.", categories: ["History"], subjects: ["India", "independence", "British Empire"], year: 2007, pages: 432 },
  { title: "India After Gandhi", author: "Ramachandra Guha", description: "A comprehensive history of India since independence, covering its political struggles, democratic experiments, and social transformations.", categories: ["History"], subjects: ["India", "democracy", "politics"], year: 2007, pages: 928 },
  { title: "The Discovery of India", author: "Jawaharlal Nehru", description: "Written from prison, Nehru's meditation on Indian civilization traces its philosophy, culture, and history across thousands of years.", categories: ["History"], subjects: ["India", "philosophy", "civilization"], year: 1946, pages: 596 },

  // Psychology
  { title: "Thinking, Fast and Slow", author: "Daniel Kahneman", description: "A Nobel laureate explains the two systems that drive human thought, revealing the biases and shortcuts that shape our decisions.", categories: ["Psychology"], subjects: ["cognitive bias", "decision making", "behavioral economics"], year: 2011, pages: 499 },
  { title: "The Body Keeps the Score", author: "Bessel van der Kolk", description: "A groundbreaking exploration of how trauma reshapes the body and brain, and the innovative treatments that can help people heal.", categories: ["Psychology"], subjects: ["trauma", "healing", "neuroscience"], year: 2014, pages: 464 },
  { title: "Quiet: The Power of Introverts", author: "Susan Cain", description: "A compelling case for the value introverts bring to a world that often overvalues extroversion, backed by research and vivid stories.", categories: ["Psychology"], subjects: ["introversion", "personality", "society"], year: 2012, pages: 333 },
  { title: "Man's Search for Meaning", author: "Viktor E. Frankl", description: "A psychiatrist's account of surviving Nazi concentration camps, forming the basis of his theory that finding meaning is key to survival.", categories: ["Psychology"], subjects: ["meaning", "resilience", "existentialism"], year: 1946, pages: 165 },
  { title: "Emotional Intelligence", author: "Daniel Goleman", description: "An influential exploration of why emotional intelligence can matter more than IQ for success in relationships and life.", categories: ["Psychology"], subjects: ["emotions", "self-awareness", "relationships"], year: 1995, pages: 384 },
  { title: "Predictably Irrational", author: "Dan Ariely", description: "A behavioral economist reveals the hidden, systematic ways humans act against their own interests, using engaging experiments as evidence.", categories: ["Psychology"], subjects: ["behavioral economics", "decision making"], year: 2008, pages: 304 },
  { title: "Mindset: The New Psychology of Success", author: "Carol S. Dweck", description: "A psychologist distinguishes between fixed and growth mindsets, showing how our beliefs about ability shape achievement and resilience.", categories: ["Psychology", "Self Development"], subjects: ["growth mindset", "motivation", "achievement"], year: 2006, pages: 276 },
  { title: "Attached", author: "Amir Levine", description: "An accessible guide to attachment theory that explains why we love the way we do and how to build more secure relationships.", categories: ["Psychology"], subjects: ["relationships", "attachment theory"], year: 2010, pages: 304 },
  { title: "Flow: The Psychology of Optimal Experience", author: "Mihaly Csikszentmihalyi", description: "A psychologist explores the state of complete absorption in an activity, and how to cultivate flow for a more fulfilling life.", categories: ["Psychology"], subjects: ["motivation", "happiness", "focus"], year: 1990, pages: 303 },
  { title: "The Psychology of Money", author: "Morgan Housel", description: "Short, engaging lessons on how emotions and behavior — more than knowledge — shape our financial decisions and outcomes.", categories: ["Psychology", "Business"], subjects: ["money", "behavior", "finance"], year: 2020, pages: 256 },

  // Computer Science
  { title: "Structure and Interpretation of Computer Programs", author: "Harold Abelson", description: "A foundational text teaching the principles of computation through Scheme, emphasizing abstraction, recursion, and program design.", categories: ["Computer Science"], subjects: ["programming", "abstraction", "computation"], year: 1985, pages: 657 },
  { title: "Clean Code", author: "Robert C. Martin", description: "A practical guide to writing readable, maintainable code, with principles and techniques for avoiding common pitfalls in software craftsmanship.", categories: ["Computer Science"], subjects: ["software engineering", "best practices"], year: 2008, pages: 464 },
  { title: "Introduction to Algorithms", author: "Thomas H. Cormen", description: "A comprehensive and rigorous textbook covering algorithms and data structures, widely used in university computer science courses.", categories: ["Computer Science"], subjects: ["algorithms", "data structures"], year: 1990, pages: 1312 },
  { title: "Designing Data-Intensive Applications", author: "Martin Kleppmann", description: "A deep dive into the principles behind reliable, scalable, and maintainable systems, covering databases, distributed systems, and data pipelines.", categories: ["Computer Science"], subjects: ["distributed systems", "databases", "scalability"], year: 2017, pages: 616 },
  { title: "The Pragmatic Programmer", author: "David Thomas", description: "A collection of practical tips and philosophies for becoming a more effective, adaptable software developer.", categories: ["Computer Science"], subjects: ["software engineering", "career", "best practices"], year: 1999, pages: 352 },
  { title: "Computer Networking: A Top-Down Approach", author: "James F. Kurose", description: "An accessible introduction to computer networks, starting from application-layer protocols down to the physical transmission of data.", categories: ["Computer Science"], subjects: ["networking", "protocols", "internet"], year: 1999, pages: 864 },
  { title: "Operating System Concepts", author: "Abraham Silberschatz", description: "A classic textbook covering the fundamental concepts of operating systems including processes, memory management, and file systems.", categories: ["Computer Science"], subjects: ["operating systems", "computer architecture"], year: 1983, pages: 976 },
  { title: "Cracking the Coding Interview", author: "Gayle Laakmann McDowell", description: "A practical prep guide for technical interviews, packed with algorithm problems, solutions, and strategies for landing a software job.", categories: ["Computer Science"], subjects: ["interviews", "algorithms", "career"], year: 2008, pages: 687 },
  { title: "Refactoring", author: "Martin Fowler", description: "A catalog of techniques for improving the design of existing code without changing its external behavior, illustrated with real examples.", categories: ["Computer Science"], subjects: ["software design", "code quality"], year: 1999, pages: 448 },
  { title: "You Don't Know JS", author: "Kyle Simpson", description: "A deep, honest exploration of JavaScript's trickiest and most misunderstood parts, aimed at developers who want true mastery of the language.", categories: ["Computer Science"], subjects: ["JavaScript", "programming languages"], year: 2014, pages: 278 },

  // Artificial Intelligence
  { title: "Artificial Intelligence: A Modern Approach", author: "Stuart Russell", description: "The definitive AI textbook, covering search, logic, machine learning, and reasoning under uncertainty in a comprehensive and rigorous way.", categories: ["Artificial Intelligence", "Computer Science"], subjects: ["machine learning", "reasoning", "search algorithms"], year: 1995, pages: 1152 },
  { title: "Life 3.0", author: "Max Tegmark", description: "A physicist explores what it means to be human in an age of artificial intelligence, examining both the promise and the peril of AI's rise.", categories: ["Artificial Intelligence"], subjects: ["AI safety", "future", "ethics"], year: 2017, pages: 384 },
  { title: "You Look Like a Thing and I Love You", author: "Janelle Shane", description: "A lighthearted, deeply accessible introduction to how AI actually works, told through the hilarious and sometimes bizarre things it gets wrong.", categories: ["Artificial Intelligence"], subjects: ["machine learning", "beginner-friendly", "humor"], year: 2019, pages: 288 },
  { title: "Deep Learning", author: "Ian Goodfellow", description: "The comprehensive technical reference on deep learning, covering neural networks, optimization, and modern architectures for researchers and students.", categories: ["Artificial Intelligence", "Computer Science"], subjects: ["neural networks", "deep learning", "mathematics"], year: 2016, pages: 800 },
  { title: "Hello World: Being Human in the Age of Algorithms", author: "Hannah Fry", description: "An engaging, non-technical look at how algorithms already shape our lives — from justice to medicine — and what that means for society.", categories: ["Artificial Intelligence"], subjects: ["algorithms", "society", "beginner-friendly"], year: 2018, pages: 256 },
  { title: "The Alignment Problem", author: "Brian Christian", description: "An exploration of the effort to make AI systems behave as intended, blending technical explanation with the human stakes of getting it wrong.", categories: ["Artificial Intelligence"], subjects: ["AI safety", "ethics", "machine learning"], year: 2020, pages: 476 },
  { title: "AI Superpowers", author: "Kai-Fu Lee", description: "A leading AI expert compares the US and China's approaches to artificial intelligence and forecasts how AI will reshape the global economy.", categories: ["Artificial Intelligence", "Business"], subjects: ["geopolitics", "economy", "future of work"], year: 2018, pages: 272 },
  { title: "Superintelligence", author: "Nick Bostrom", description: "A philosopher examines what happens if machine intelligence surpasses human intelligence, and the strategies needed to navigate that future safely.", categories: ["Artificial Intelligence", "Philosophy"], subjects: ["AI safety", "future", "philosophy"], year: 2014, pages: 352 },
  { title: "Machine Learning Yearning", author: "Andrew Ng", description: "A practical, beginner-friendly guide to structuring machine learning projects, written by one of the field's most prominent educators.", categories: ["Artificial Intelligence"], subjects: ["machine learning", "beginner-friendly", "practical"], year: 2018, pages: 118 },
  { title: "The Master Algorithm", author: "Pedro Domingos", description: "An accessible tour of the five major schools of machine learning and the quest for a single algorithm that could learn anything.", categories: ["Artificial Intelligence"], subjects: ["machine learning", "beginner-friendly"], year: 2015, pages: 352 },

  // Business
  { title: "Zero to One", author: "Peter Thiel", description: "A contrarian guide to building a startup that creates something genuinely new, rather than competing in an existing market.", categories: ["Business"], subjects: ["startups", "innovation", "entrepreneurship"], year: 2014, pages: 224 },
  { title: "Good to Great", author: "Jim Collins", description: "A research-driven study of what separates companies that make a sustained leap to greatness from those that merely remain good.", categories: ["Business"], subjects: ["leadership", "management", "strategy"], year: 2001, pages: 320 },
  { title: "The Lean Startup", author: "Eric Ries", description: "A methodology for building startups through validated learning, rapid experimentation, and iterative product releases.", categories: ["Business"], subjects: ["startups", "product development", "entrepreneurship"], year: 2011, pages: 336 },
  { title: "Shoe Dog", author: "Phil Knight", description: "Nike's founder recounts the improbable, risk-filled early years of building one of the world's most iconic brands.", categories: ["Business"], subjects: ["entrepreneurship", "memoir", "brand building"], year: 2016, pages: 400 },
  { title: "Thinking in Bets", author: "Annie Duke", description: "A former professional poker player teaches how to make smarter decisions by embracing uncertainty rather than fearing it.", categories: ["Business", "Psychology"], subjects: ["decision making", "risk", "probability"], year: 2018, pages: 288 },
  { title: "Never Split the Difference", author: "Chris Voss", description: "A former FBI hostage negotiator shares field-tested negotiation tactics applicable to business deals and everyday life.", categories: ["Business"], subjects: ["negotiation", "communication"], year: 2016, pages: 288 },
  { title: "The Innovator's Dilemma", author: "Clayton M. Christensen", description: "A landmark study of why successful companies fail to adapt to disruptive innovation, and what leaders can do about it.", categories: ["Business"], subjects: ["innovation", "strategy", "disruption"], year: 1997, pages: 286 },
  { title: "Principles", author: "Ray Dalio", description: "A hedge fund founder distills the life and work principles that guided his personal and professional decision-making.", categories: ["Business"], subjects: ["management", "decision making", "life philosophy"], year: 2017, pages: 592 },
  { title: "Built to Last", author: "Jim Collins", description: "A study of visionary companies that have thrived over generations, identifying the habits and values that set them apart.", categories: ["Business"], subjects: ["leadership", "corporate culture"], year: 1994, pages: 368 },
  { title: "Freakonomics", author: "Steven D. Levitt", description: "An economist and journalist explore the hidden side of everything, applying economic thinking to unexpected everyday questions.", categories: ["Business", "Economics"], subjects: ["economics", "incentives", "curiosity"], year: 2005, pages: 320 },

  // Philosophy
  { title: "Meditations", author: "Marcus Aurelius", description: "The private journal of a Roman emperor, offering timeless Stoic reflections on virtue, mortality, and living a good life.", categories: ["Philosophy"], subjects: ["stoicism", "ethics", "self-reflection"], year: 180, pages: 254 },
  { title: "The Republic", author: "Plato", description: "A foundational work of Western philosophy exploring justice, the ideal state, and the nature of the philosopher-king through Socratic dialogue.", categories: ["Philosophy"], subjects: ["justice", "politics", "ethics"], year: -375, pages: 416 },
  { title: "Beyond Good and Evil", author: "Friedrich Nietzsche", description: "A provocative critique of traditional morality and philosophy, challenging readers to rethink truth, power, and human values.", categories: ["Philosophy"], subjects: ["morality", "ethics", "critique"], year: 1886, pages: 240 },
  { title: "The Myth of Sisyphus", author: "Albert Camus", description: "A foundational text of absurdist philosophy, examining whether life is worth living in a universe that offers no inherent meaning.", categories: ["Philosophy"], subjects: ["absurdism", "existentialism", "meaning"], year: 1942, pages: 212 },
  { title: "Letters from a Stoic", author: "Seneca", description: "A collection of practical philosophical letters offering Stoic guidance on how to live well, endure hardship, and face death with equanimity.", categories: ["Philosophy"], subjects: ["stoicism", "ethics", "wisdom"], year: 65, pages: 254 },
  { title: "Being and Time", author: "Martin Heidegger", description: "A dense, foundational work of 20th-century philosophy exploring the meaning of being through the lens of human existence.", categories: ["Philosophy"], subjects: ["existentialism", "ontology"], year: 1927, pages: 589 },
  { title: "The Consolations of Philosophy", author: "Alain de Botton", description: "An accessible introduction to six philosophers and how their ideas can console us through life's common frustrations and misfortunes.", categories: ["Philosophy"], subjects: ["beginner-friendly", "practical philosophy"], year: 2000, pages: 272 },
  { title: "Sophie's World", author: "Jostein Gaarder", description: "A novel that doubles as an accessible history of Western philosophy, following a teenage girl's mysterious philosophical education.", categories: ["Philosophy", "Fiction"], subjects: ["beginner-friendly", "history of ideas"], year: 1991, pages: 518 },
  { title: "Man and His Symbols", author: "Carl Jung", description: "Jung's final work, written for a general audience, introduces his theories of the unconscious, archetypes, and dream symbolism.", categories: ["Philosophy", "Psychology"], subjects: ["unconscious", "symbolism", "beginner-friendly"], year: 1964, pages: 320 },
  { title: "The Tao Te Ching", author: "Lao Tzu", description: "An ancient Chinese text offering poetic wisdom on living in harmony with the natural flow of the universe.", categories: ["Philosophy"], subjects: ["Taoism", "wisdom", "spirituality"], year: -400, pages: 96 },

  // Self Development
  { title: "Atomic Habits", author: "James Clear", description: "A practical, science-backed guide to building good habits and breaking bad ones through small, incremental changes.", categories: ["Self Development"], subjects: ["habits", "productivity", "behavior change"], year: 2018, pages: 320 },
  { title: "The 7 Habits of Highly Effective People", author: "Stephen R. Covey", description: "A classic framework for personal and professional effectiveness built around character ethics rather than quick fixes.", categories: ["Self Development"], subjects: ["productivity", "leadership", "character"], year: 1989, pages: 372 },
  { title: "Deep Work", author: "Cal Newport", description: "An argument for the value of focused, distraction-free work in an increasingly distracted world, with practical strategies to cultivate it.", categories: ["Self Development"], subjects: ["focus", "productivity", "work"], year: 2016, pages: 296 },
  { title: "Grit", author: "Angela Duckworth", description: "A psychologist argues that passion and sustained perseverance, more than talent, are the true drivers of long-term success.", categories: ["Self Development", "Psychology"], subjects: ["perseverance", "motivation", "success"], year: 2016, pages: 352 },
  { title: "The Power of Now", author: "Eckhart Tolle", description: "A spiritual guide to living fully in the present moment, freeing oneself from the grip of past regret and future anxiety.", categories: ["Self Development"], subjects: ["mindfulness", "spirituality", "presence"], year: 1997, pages: 236 },
  { title: "Can't Hurt Me", author: "David Goggins", description: "A former Navy SEAL's raw memoir on overcoming immense adversity through relentless mental toughness and discipline.", categories: ["Self Development"], subjects: ["resilience", "discipline", "memoir"], year: 2018, pages: 364 },
  { title: "Essentialism", author: "Greg McKeown", description: "A guide to focusing only on what truly matters, cutting out the nonessential to pursue a more meaningful and productive life.", categories: ["Self Development"], subjects: ["focus", "minimalism", "productivity"], year: 2014, pages: 260 },
  { title: "The Subtle Art of Not Giving a F*ck", author: "Mark Manson", description: "A counterintuitive approach to living a good life by choosing what to care about, rather than chasing constant positivity.", categories: ["Self Development"], subjects: ["mindset", "values", "happiness"], year: 2016, pages: 224 },
  { title: "How to Win Friends and Influence People", author: "Dale Carnegie", description: "A timeless classic on building genuine relationships, effective communication, and influencing others through empathy and respect.", categories: ["Self Development"], subjects: ["communication", "relationships"], year: 1936, pages: 291 },
  { title: "Daring Greatly", author: "Brené Brown", description: "A researcher explores how embracing vulnerability can transform how we live, love, parent, and lead.", categories: ["Self Development", "Psychology"], subjects: ["vulnerability", "courage", "connection"], year: 2012, pages: 320 },

  // Literature
  { title: "One Hundred Years of Solitude", author: "Gabriel García Márquez", description: "The multigenerational saga of the Buendía family in the mythical town of Macondo, a landmark of magical realism.", categories: ["Literature"], subjects: ["magical realism", "family", "Latin America"], year: 1967, pages: 417 },
  { title: "Crime and Punishment", author: "Fyodor Dostoevsky", description: "A poor former student in St. Petersburg commits murder and grapples with guilt, morality, and redemption in this psychological masterpiece.", categories: ["Literature"], subjects: ["morality", "psychology", "Russia"], year: 1866, pages: 671 },
  { title: "Beloved", author: "Toni Morrison", description: "A former slave is haunted by the ghost of the daughter she killed to save from slavery, in a devastating meditation on trauma and memory.", categories: ["Literature"], subjects: ["slavery", "trauma", "memory"], year: 1987, pages: 324 },
  { title: "Pride and Prejudice", author: "Jane Austen", description: "A witty exploration of manners, marriage, and misunderstanding centered on the spirited Elizabeth Bennet and the proud Mr. Darcy.", categories: ["Literature"], subjects: ["romance", "society", "wit"], year: 1813, pages: 279 },
  { title: "One Flew Over the Cuckoo's Nest", author: "Ken Kesey", description: "A rebellious patient in a mental institution challenges the oppressive authority of the ward's tyrannical head nurse.", categories: ["Literature"], subjects: ["institutions", "rebellion", "freedom"], year: 1962, pages: 325 },
  { title: "The Brothers Karamazov", author: "Fyodor Dostoevsky", description: "A philosophical novel about faith, doubt, and morality, following three brothers implicated in their father's murder.", categories: ["Literature", "Philosophy"], subjects: ["faith", "morality", "family"], year: 1880, pages: 824 },
  { title: "Midnight's Children", author: "Salman Rushdie", description: "A child born at the exact moment of India's independence finds his life mysteriously intertwined with his nation's turbulent history.", categories: ["Literature"], subjects: ["India", "magical realism", "independence"], year: 1981, pages: 533 },
  { title: "The God of Small Things", author: "Arundhati Roy", description: "A lyrical, nonlinear story of twins in Kerala whose lives are shaped by forbidden love and rigid social boundaries.", categories: ["Literature"], subjects: ["India", "family", "caste"], year: 1997, pages: 340 },
  { title: "Things Fall Apart", author: "Chinua Achebe", description: "A powerful portrait of a Nigerian village leader whose world is upended by the arrival of European colonialism.", categories: ["Literature"], subjects: ["colonialism", "Africa", "tradition"], year: 1958, pages: 209 },
  { title: "1984", author: "George Orwell", description: "A haunting vision of a totalitarian future where the state controls truth, thought, and history through surveillance and propaganda.", categories: ["Literature", "Science Fiction"], subjects: ["dystopia", "surveillance", "totalitarianism"], year: 1949, pages: 328 },

  // Economics
  { title: "The Wealth of Nations", author: "Adam Smith", description: "The foundational text of modern economics, introducing ideas like the division of labor and the invisible hand of the market.", categories: ["Economics"], subjects: ["free markets", "classical economics"], year: 1776, pages: 1152 },
  { title: "Capital in the Twenty-First Century", author: "Thomas Piketty", description: "A sweeping analysis of wealth and income inequality across centuries, arguing that capital tends to grow faster than the economy.", categories: ["Economics"], subjects: ["inequality", "capital", "history"], year: 2013, pages: 696 },
  { title: "Poor Economics", author: "Abhijit V. Banerjee", description: "Nobel laureates rethink the fight against global poverty using rigorous field experiments to identify what actually works.", categories: ["Economics"], subjects: ["poverty", "development economics"], year: 2011, pages: 303 },
  { title: "The Undercover Economist", author: "Tim Harford", description: "An accessible introduction to economic thinking, revealing the hidden logic behind everyday decisions and prices.", categories: ["Economics"], subjects: ["beginner-friendly", "markets"], year: 2005, pages: 264 },
  { title: "Nudge", author: "Richard H. Thaler", description: "Behavioral economists show how subtle changes in choice architecture can help people make better decisions without restricting freedom.", categories: ["Economics", "Psychology"], subjects: ["behavioral economics", "public policy"], year: 2008, pages: 312 },
  { title: "This Time Is Different", author: "Carmen M. Reinhart", description: "A sweeping historical analysis of financial crises across eight centuries, revealing recurring patterns behind economic collapse.", categories: ["Economics"], subjects: ["financial crises", "history"], year: 2009, pages: 512 },
  { title: "23 Things They Don't Tell You About Capitalism", author: "Ha-Joon Chang", description: "An economist challenges popular myths about free markets, making the case for a more nuanced understanding of capitalism.", categories: ["Economics"], subjects: ["capitalism", "public policy"], year: 2010, pages: 304 },
  { title: "Basic Economics", author: "Thomas Sowell", description: "A clear, jargon-free introduction to economic principles and how they play out in real-world policy and everyday life.", categories: ["Economics"], subjects: ["beginner-friendly", "policy"], year: 2000, pages: 705 },
  { title: "Misbehaving", author: "Richard H. Thaler", description: "A pioneer of behavioral economics recounts the field's rise, showing how real human behavior departs from rational economic models.", categories: ["Economics", "Psychology"], subjects: ["behavioral economics", "memoir"], year: 2015, pages: 415 },
  { title: "Doughnut Economics", author: "Kate Raworth", description: "A reimagining of economics for the 21st century, proposing a model that meets human needs within the planet's ecological limits.", categories: ["Economics"], subjects: ["sustainability", "economic theory"], year: 2017, pages: 320 },

  // Biology
  { title: "The Selfish Gene", author: "Richard Dawkins", description: "A landmark work explaining evolution from the gene's perspective, arguing that genes are the true units of natural selection.", categories: ["Biology"], subjects: ["evolution", "genetics"], year: 1976, pages: 360 },
  { title: "The Gene: An Intimate History", author: "Siddhartha Mukherjee", description: "A sweeping history of genetics, from Mendel's pea plants to modern gene editing, told with narrative flair and personal reflection.", categories: ["Biology"], subjects: ["genetics", "history of science"], year: 2016, pages: 608 },
  { title: "The Immortal Life of Henrietta Lacks", author: "Rebecca Skloot", description: "The story of the cells taken without consent from a poor Black woman that became one of the most important tools in medicine.", categories: ["Biology"], subjects: ["medical ethics", "cells", "biography"], year: 2010, pages: 381 },
  { title: "The Sixth Extinction", author: "Elizabeth Kolbert", description: "A journalist investigates the ongoing mass extinction caused by human activity, blending field reporting with scientific analysis.", categories: ["Biology"], subjects: ["extinction", "ecology", "climate"], year: 2014, pages: 319 },
  { title: "I Contain Multitudes", author: "Ed Yong", description: "An exploration of the microbes living inside every organism, revealing how they shape health, evolution, and behavior.", categories: ["Biology"], subjects: ["microbiome", "beginner-friendly"], year: 2016, pages: 355 },
  { title: "Why We Sleep", author: "Matthew Walker", description: "A sleep scientist explains the vital role of sleep in health and cognition, and the dangers of chronic sleep deprivation.", categories: ["Biology", "Psychology"], subjects: ["sleep", "health", "neuroscience"], year: 2017, pages: 368 },
  { title: "The Emperor of All Maladies", author: "Siddhartha Mukherjee", description: "A Pulitzer Prize-winning biography of cancer, tracing its history from ancient descriptions to modern treatment breakthroughs.", categories: ["Biology"], subjects: ["cancer", "medicine", "history"], year: 2010, pages: 592 },
  { title: "Silent Spring", author: "Rachel Carson", description: "A groundbreaking exposé on the environmental damage caused by pesticides, credited with launching the modern environmental movement.", categories: ["Biology"], subjects: ["environment", "ecology", "activism"], year: 1962, pages: 368 },
  { title: "The Botany of Desire", author: "Michael Pollan", description: "An exploration of four plants and how they evolved to appeal to human desires, told from the surprising perspective of plants themselves.", categories: ["Biology"], subjects: ["plants", "evolution", "agriculture"], year: 2001, pages: 271 },
  { title: "Lab Girl", author: "Hope Jahren", description: "A geobiologist's memoir intertwines her scientific career with a love letter to the secret lives of plants.", categories: ["Biology"], subjects: ["memoir", "plants", "science career"], year: 2016, pages: 290 },

  // Mathematics
  { title: "Fermat's Enigma", author: "Simon Singh", description: "The gripping story of the 350-year quest to prove Fermat's Last Theorem, culminating in Andrew Wiles's celebrated solution.", categories: ["Mathematics"], subjects: ["number theory", "history of math"], year: 1997, pages: 315 },
  { title: "How to Lie with Statistics", author: "Darrell Huff", description: "A classic, accessible guide to the ways statistics can mislead, teaching readers to think critically about numbers and charts.", categories: ["Mathematics"], subjects: ["statistics", "beginner-friendly", "critical thinking"], year: 1954, pages: 142 },
  { title: "A Mathematician's Apology", author: "G.H. Hardy", description: "A renowned mathematician's meditation on the beauty and purpose of pure mathematics, written near the end of his career.", categories: ["Mathematics", "Philosophy"], subjects: ["beauty of math", "memoir"], year: 1940, pages: 153 },
  { title: "The Man Who Knew Infinity", author: "Robert Kanigel", description: "The extraordinary story of self-taught Indian mathematician Srinivasa Ramanujan and his remarkable contributions to number theory.", categories: ["Mathematics"], subjects: ["biography", "India", "number theory"], year: 1991, pages: 438 },
  { title: "Gödel, Escher, Bach", author: "Douglas Hofstadter", description: "A Pulitzer Prize-winning exploration of the connections between mathematics, art, and music, centered on self-reference and formal systems.", categories: ["Mathematics", "Philosophy"], subjects: ["logic", "consciousness", "formal systems"], year: 1979, pages: 777 },
  { title: "How Not to Be Wrong", author: "Jordan Ellenberg", description: "A mathematician shows how mathematical thinking underlies everyday reasoning, using accessible, real-world examples.", categories: ["Mathematics"], subjects: ["beginner-friendly", "practical math"], year: 2014, pages: 480 },
  { title: "The Joy of X", author: "Steven Strogatz", description: "A friendly guided tour through mathematics from basic arithmetic to calculus, designed for readers with no advanced background.", categories: ["Mathematics"], subjects: ["beginner-friendly", "overview"], year: 2012, pages: 336 },
  { title: "Prime Obsession", author: "John Derbyshire", description: "An accessible account of the Riemann Hypothesis, one of mathematics' greatest unsolved problems, alternating with historical narrative.", categories: ["Mathematics"], subjects: ["number theory", "unsolved problems"], year: 2003, pages: 422 },
  { title: "Infinite Powers", author: "Steven Strogatz", description: "A celebration of calculus and its role in shaping the modern world, from GPS to medicine, told with clarity and enthusiasm.", categories: ["Mathematics"], subjects: ["calculus", "beginner-friendly"], year: 2019, pages: 366 },
  { title: "The Man Who Counted", author: "Malba Tahan", description: "A charming collection of mathematical puzzles wrapped in the tale of a traveling Persian mathematician's adventures.", categories: ["Mathematics", "Fiction"], subjects: ["puzzles", "beginner-friendly", "storytelling"], year: 1938, pages: 244 },
];

const locations = [
  "Fiction — Floor 1 — Shelf A1", "Fiction — Floor 1 — Shelf A2", "Fiction — Floor 1 — Shelf B1",
  "Science Fiction — Floor 1 — Shelf C1", "Fantasy — Floor 1 — Shelf C2",
  "History — Floor 2 — Shelf A1", "History — Floor 2 — Shelf A2",
  "Psychology — Floor 2 — Shelf B1", "Computer Science — Floor 2 — Shelf D1",
  "Artificial Intelligence — Floor 2 — Shelf D2", "Business — Floor 3 — Shelf A1",
  "Philosophy — Floor 3 — Shelf B1", "Self Development — Floor 3 — Shelf B2",
  "Literature — Floor 1 — Shelf B2", "Economics — Floor 3 — Shelf A2",
  "Biology — Floor 2 — Shelf C1", "Mathematics — Floor 2 — Shelf C2",
];

const coverColors = [
  "#2563eb", "#7c3aed", "#db2777", "#dc2626", "#ea580c",
  "#d97706", "#65a30d", "#059669", "#0891b2", "#4f46e5",
  "#9333ea", "#c2410c", "#0d9488", "#4338ca", "#be123c",
];

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

const books: Book[] = seeds.map((seed, i) => {
  const id = slugify(`${seed.title}-${seed.author}`) || `book-${i}`;
  const h = hashString(id);
  return {
    id,
    title: seed.title,
    author: seed.author,
    description: seed.description,
    categories: seed.categories,
    subjects: seed.subjects,
    year: seed.year,
    pages: seed.pages,
    available: h % 5 !== 0, // ~80% available
    location: locations[h % locations.length],
    coverColor: coverColors[h % coverColors.length],
  };
});

const outPath = join(__dirname, "..", "data", "books.json");
writeFileSync(outPath, JSON.stringify(books, null, 2), "utf-8");
console.log(`Generated ${books.length} books -> ${outPath}`);
