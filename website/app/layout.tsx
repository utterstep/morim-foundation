import type { Metadata } from 'next';
import './globals.css';
import './sections.css';
import './motion.css';
import './hero-context.css';
import './mobile.css';
import './floating-header.css';
import './hero-options.css';
import './hero-floating.css';
export const metadata: Metadata = {
  title: 'Morim — Foundation for Teachers Growth',
  icons: { icon: '/assets/imgRectangle113.png' },
  description:
    'We help teachers shape the next generation of children through practice, mentorship, and fellowship programs.',
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
