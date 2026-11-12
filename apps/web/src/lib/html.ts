/** Adds stable ids to <h2>/<h3> in sanitized article HTML and returns a table of contents. */
export function withHeadingIds(html: string): { html: string; toc: { id: string; text: string; level: 2 | 3 }[] } {
  const toc: { id: string; text: string; level: 2 | 3 }[] = [];
  let n = 0;
  const out = html.replace(/<h([23])(\s[^>]*)?>([\s\S]*?)<\/h\1>/g, (_m, level: string, attrs: string | undefined, inner: string) => {
    n += 1;
    const id = `section-${n}`;
    const text = inner.replace(/<[^>]+>/g, '').trim();
    toc.push({ id, text, level: Number(level) as 2 | 3 });
    const cleanAttrs = (attrs ?? '').replace(/\sid="[^"]*"/, '');
    return `<h${level} id="${id}"${cleanAttrs}>${inner}</h${level}>`;
  });
  return { html: out, toc };
}
