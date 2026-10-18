import { Headphones } from 'lucide-react';
import { useLayoutEffect, useRef } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';

export function Screen() {
  const { pathname } = useLocation();
  const main = useRef<HTMLElement>(null);
  useLayoutEffect(() => {
    document.title = `${main.current?.querySelector('h1')?.innerText.replace(/\s+/g, ' ') ?? 'Your tours'} · Audio Tour`;
    window.scrollTo(0, 0);
    main.current?.focus({ preventScroll: true });
  }, [pathname]);

  return (
    <div className="page-shell">
      <a className="skip-link" href="#main">Skip to content</a>
      <header className="site-header">
        <Link to="/" aria-label="Audio Tour home" className="brand">
          <span className="brand-icon"><Headphones size={21} /></span>
          <span>Audio Tour</span>
        </Link>
        <span className="preview-badge"><span />App preview</span>
      </header>
      <main id="main" ref={main} tabIndex={-1}><Outlet /></main>
      <footer className="site-footer"><span>A little more to every place.</span><span>EARLY BUILD · 0.1</span></footer>
    </div>
  );
}
