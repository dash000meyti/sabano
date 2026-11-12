/** Rough reading time from HTML: strips tags and counts words (min 1). */
export function readingMinutes(html: string, wordsPerMinute = 200): number {
  const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  if (!text) return 1;
  // CJK has no spaces: count characters / 2 as a word estimate.
  const cjk = (text.match(/[㐀-鿿]/g) ?? []).length;
  const words = text.split(' ').length + Math.round(cjk / 2);
  return Math.max(1, Math.round(words / wordsPerMinute));
}
