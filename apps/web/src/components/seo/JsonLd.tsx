import { serializeLd } from '@/lib/jsonld';

/** Renders one or more JSON-LD blocks. */
export function JsonLd({ data }: { data: unknown | unknown[] }) {
  const list = Array.isArray(data) ? data : [data];
  return (
    <>
      {list.map((d, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeLd(d) }} />
      ))}
    </>
  );
}
