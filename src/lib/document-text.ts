import type { Locale } from '../i18n/config';

/** Preserve the text and sentence order, adding only reading-sized paragraph breaks. */
export function documentParagraphs(text: string, locale: Locale): readonly string[] {
  const explicit = text.split(/\n\s*\n/u).map((part) => part.trim()).filter(Boolean);
  return explicit.flatMap((part) => {
    if (part.length < 300) return [part];
    const sentences = [...new Intl.Segmenter(locale, { granularity: 'sentence' }).segment(part)];
    const blocks: string[] = [];
    let block = '';
    let count = 0;
    for (const sentence of sentences) {
      block += sentence.segment;
      count++;
      if (block.length >= 180 || count >= 2) {
        blocks.push(block.trim()); block = ''; count = 0;
      }
    }
    if (block.trim()) blocks.push(block.trim());
    return blocks;
  });
}
