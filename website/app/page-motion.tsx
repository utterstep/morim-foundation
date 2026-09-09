'use client';

import { useEffect, useLayoutEffect, useRef } from 'react';
import { startPageMotion } from '@/lib/page-motion';
import { startCardDepth } from '@/lib/card-depth';

export function PageMotion() {
  useEffect(() => {
    const root = document.getElementById('top');
    if (!root) return;
    const stopMotion = startPageMotion(root);
    const stopDepth = startCardDepth(root);
    return () => {
      stopMotion();
      stopDepth();
    };
  }, []);
  return null;
}

// Keep list geometry stable while filters update, without delaying the results.
export function useProgramMotion(location: string | null) {
  const list = useRef<HTMLDivElement>(null);
  const before = useRef<{ height: number; tops: Map<string, number> } | null>(
    null,
  );
  const active = useRef<Animation[]>([]);
  const cancel = () => {
    active.current.forEach((animation) => animation.cancel());
    active.current = [];
  };
  const capture = () => {
    cancel();
    const element = list.current;
    if (
      !element ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    )
      return;
    before.current = {
      height: element.getBoundingClientRect().height,
      tops: new Map(
        Array.from(
          element.querySelectorAll<HTMLElement>('[data-program]'),
          (row) => [row.dataset.program!, row.offsetTop],
        ),
      ),
    };
  };

  useLayoutEffect(() => {
    const element = list.current;
    const previous = before.current;
    before.current = null;
    if (
      !element ||
      !previous ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    )
      return;
    const duration = 240;
    const height = element.getBoundingClientRect().height;
    if (Math.abs(previous.height - height) > 1) {
      active.current.push(
        element.animate(
          [{ height: `${previous.height}px` }, { height: `${height}px` }],
          { duration, easing: 'ease-out' },
        ),
      );
    }
    element.querySelectorAll<HTMLElement>('[data-program]').forEach((row) => {
      const oldTop = previous.tops.get(row.dataset.program!);
      active.current.push(
        row.animate(
          [
            {
              opacity: oldTop === undefined ? 0 : 1,
              translate: `0 ${oldTop === undefined ? 8 : oldTop - row.offsetTop}px`,
            },
            { opacity: 1, translate: '0 0' },
          ],
          { duration, easing: 'ease-out' },
        ),
      );
    });
  }, [location]);

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const stop = () => {
      if (preference.matches) cancel();
    };
    preference.addEventListener('change', stop);
    return () => {
      cancel();
      preference.removeEventListener('change', stop);
    };
  }, []);
  return { list, capture };
}
