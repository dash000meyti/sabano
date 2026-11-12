import { NextResponse, type NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

const intl = createMiddleware(routing);

export default function proxy(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  if (pathname === '/admin' || pathname.startsWith('/admin/')) {
    // Cheap pre-check so the login page can send the user back where they were going.
    // Real session validation happens in requireUser().
    if (pathname !== '/admin/login' && !req.cookies.has('sabano_admin')) {
      const url = req.nextUrl.clone();
      url.pathname = '/admin/login';
      url.search = `?next=${encodeURIComponent(pathname + search)}`;
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }
  return intl(req);
}

export const config = {
  // Everything except API, media, Next internals and files with an extension.
  // The Persian RSS feed (/news/rss.xml) has an extension but still needs locale rewriting.
  matcher: ['/((?!api|admin|media|_next|_vercel|.*\\..*).*)', '/news/rss.xml', '/admin', '/admin/:path*'],
};
