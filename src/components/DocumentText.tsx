import type { Locale } from '@/i18n/config';
import { documentParagraphs } from '@/lib/document-text';

export default function DocumentText({ text, locale, className = '' }: {
  text: string; locale: Locale; className?: string;
}) {
  return <div className={`document-text ${className}`}>
    {documentParagraphs(text, locale).map((paragraph, index) => <p key={index}>{paragraph}</p>)}
  </div>;
}
