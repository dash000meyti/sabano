'use client';

import { useState } from 'react';

export function CopyPath({ path }: { path: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        void navigator.clipboard?.writeText(path);
        setDone(true);
        setTimeout(() => setDone(false), 1500);
      }}
      className="rounded-lg px-2 py-1 text-xs font-bold text-accent hover:bg-accent-soft"
    >
      {done ? 'کپی شد' : 'کپی نشانی'}
    </button>
  );
}
