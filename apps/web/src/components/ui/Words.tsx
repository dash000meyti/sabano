import { cn } from '@sabano/ui';

type Props = {
  text: string;
  className?: string;
  /** 'reveal' = staggered blur/slide in on view; 'lit' = brighten word-by-word while scrolling */
  mode?: 'reveal' | 'intro' | 'lit' | 'lit-dark';
  /** Extra delay in ms before the first word */
  delay?: number;
  as?: 'span' | 'p' | 'h1' | 'h2' | 'h3';
  id?: string;
  wordClassName?: (word: string, index: number, total: number) => string | undefined;
};

/** Splits text into word spans (keeps ZWNJ-joined Persian words intact). Screen readers get the plain text. */
export function Words({ text, className, mode = 'reveal', delay = 0, as: As = 'span', id, wordClassName }: Props) {
  const words = text.split(/\s+/).filter(Boolean);
  const attrs =
    mode === 'reveal'
      ? { 'data-words': '' }
      : {};
  return (
    <As
      id={id}
      className={cn(mode === 'intro' && 'intro', (mode === 'lit' || mode === 'lit-dark') && 'lit', mode === 'lit-dark' && 'lit-dark', className)}
      {...attrs}
      style={{ '--base': delay } as React.CSSProperties}
    >
      <span className="sr-only">{text}</span>
      <span aria-hidden>
        {words.map((w, i) => (
          <span key={i}>
            <span className={cn('w', wordClassName?.(w, i, words.length))} style={{ '--i': i } as React.CSSProperties}>
              {w}
            </span>
            {i < words.length - 1 ? ' ' : null}
          </span>
        ))}
      </span>
    </As>
  );
}
