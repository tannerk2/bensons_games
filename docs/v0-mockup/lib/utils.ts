import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Shuffle array using Fisher-Yates algorithm
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Get random items from array
export function getRandomItems<T>(array: T[], count: number): T[] {
  return shuffleArray(array).slice(0, count);
}

// Split text into words, preserving punctuation
export function splitIntoWords(text: string): string[] {
  return text.split(/\s+/).filter((word) => word.length > 0);
}

// Hide random words from text
export function hideRandomWords(
  text: string,
  percentToHide: number
): { text: string; hiddenWords: string[] } {
  const words = splitIntoWords(text);
  const wordsToHide = Math.ceil(words.length * (percentToHide / 100));
  const indices = shuffleArray([...Array(words.length).keys()]).slice(
    0,
    wordsToHide
  );

  const hiddenWords: string[] = [];
  const resultWords = words.map((word, i) => {
    if (indices.includes(i)) {
      hiddenWords.push(word);
      return "_".repeat(Math.max(3, word.length));
    }
    return word;
  });

  return {
    text: resultWords.join(" "),
    hiddenWords,
  };
}

// Format date for display
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
