import { notFound } from 'next/navigation';

/** Unknown /admin/* URLs get the panel's own 404 instead of Next's unstyled one. */
export default function AdminCatchAll() {
  notFound();
}
