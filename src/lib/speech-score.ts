export function normalizeSpeechText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function scoreSpeechMatch(
  expected: string,
  spoken: string
): { percent: number; wordMatch: number; charMatch: number } {
  const normExpected = normalizeSpeechText(expected);
  const normSpoken = normalizeSpeechText(spoken);

  if (!normExpected) {
    return { percent: 0, wordMatch: 0, charMatch: 0 };
  }
  if (!normSpoken) {
    return { percent: 0, wordMatch: 0, charMatch: 0 };
  }

  const expectedWords = normExpected.split(" ");
  const spokenWords = normSpoken.split(" ");
  const spokenSet = new Set(spokenWords);
  const matchedWords = expectedWords.filter((w) => spokenSet.has(w)).length;
  const wordMatch = Math.round((matchedWords / expectedWords.length) * 100);

  const charMatch = Math.round(
    (characterOverlap(normExpected, normSpoken) / normExpected.length) * 100
  );

  const percent = Math.round(wordMatch * 0.6 + charMatch * 0.4);
  return { percent, wordMatch, charMatch };
}

function characterOverlap(a: string, b: string): number {
  const freqA = new Map<string, number>();
  for (const ch of a.replace(/\s/g, "")) {
    freqA.set(ch, (freqA.get(ch) ?? 0) + 1);
  }
  let matched = 0;
  for (const ch of b.replace(/\s/g, "")) {
    const count = freqA.get(ch) ?? 0;
    if (count > 0) {
      matched++;
      freqA.set(ch, count - 1);
    }
  }
  return matched;
}
