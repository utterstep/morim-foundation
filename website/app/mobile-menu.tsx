'use client';
import { useEffect, useState } from 'react';
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetTitle,
  SheetDescription,
  SheetClose,
} from '@/components/ui/sheet';

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 701px)');
    const close = () => {
      if (desktop.matches) setOpen(false);
    };
    desktop.addEventListener('change', close);
    return () => desktop.removeEventListener('change', close);
  }, []);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger className="mobile-menu-trigger">Menu</SheetTrigger>
      <SheetContent
        className="mobile-menu-panel"
        side="right"
        showCloseButton={false}
      >
        <div className="mobile-menu-heading">
          <SheetTitle>morim foundation</SheetTitle>
          <SheetClose className="mobile-menu-close">Close</SheetClose>
        </div>
        <SheetDescription className="sr-only">
          Explore the foundation and its programs.
        </SheetDescription>
        <nav aria-label="Mobile navigation">
          {[
            ['Approach', 'approach'],
            ['Teachers', 'fellowship'],
            ['School Leaders', 'leaders'],
            ['Team', 'team'],
            ['FAQ', 'faq'],
            ['Get in touch', 'contact'],
          ].map(([label, id]) => (
            <a key={id} href={`#${id}`} onClick={() => setOpen(false)}>
              {label}
            </a>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
