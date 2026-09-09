'use client';

import { useEffect, useState, type ReactNode } from 'react';

export function FloatingHeader({ children }: { children: ReactNode }) {
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    // A little hysteresis keeps the header steady near the top of the page.
    const update = () => {
      setCompact((previous) =>
        previous ? window.scrollY > 12 : window.scrollY > 48,
      );
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);

  return (
    <div className="header-shell" data-compact={compact}>
      <header className="site-header">{children}</header>
    </div>
  );
}
