import RichText from './RichText';
import type { Locale } from '@/i18n/config';
import type { RichSegment } from '@/i18n/dictionaries';

/** Keep inline command tokens intact while adding paragraph breaks after sentences. */
export default function RichTextBlocks({ segments, locale, className = '' }: {
  segments: readonly RichSegment[]; locale: Locale; className?: string;
}) {
  const blocks: RichSegment[][] = [];
  let current: RichSegment[] = [];
  let length = 0;
  for (const segment of segments) {
    if (typeof segment !== 'string') { current.push(segment); length += segment.code.length; continue; }
    for (const part of new Intl.Segmenter(locale, { granularity: 'sentence' }).segment(segment)) {
      current.push(part.segment); length += part.segment.length;
      if (length >= 160 && /[.!?。]\s*$/u.test(part.segment)) { blocks.push(current); current = []; length = 0; }
    }
  }
  if (current.length) blocks.push(current);
  return <div className={`document-text ${className}`}>{blocks.map((block, index) => <p key={index}><RichText segments={block} /></p>)}</div>;
}
