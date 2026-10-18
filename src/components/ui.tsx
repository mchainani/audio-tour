import { ArrowLeft, Compass } from 'lucide-react';
import type { PropsWithChildren } from 'react';
import { Link } from 'react-router-dom';

export function Eyebrow({ children }: PropsWithChildren) { return <p className="eyebrow">{children}</p>; }
export function Badge({ children }: PropsWithChildren) { return <span className="badge">{children}</span>; }
export function BackLink({ to, children }: PropsWithChildren<{ to: string }>) {
  return <Link to={to} className="back-link"><ArrowLeft size={15} aria-hidden="true" />{children}</Link>;
}
export function MissingContent({ title, to = '/', label = 'Back to your tours' }: { title: string; to?: string; label?: string }) {
  return <section className="missing"><Compass size={42} aria-hidden="true" /><h1>{title}</h1><p>This stop isn’t in the preview library.</p><BackLink to={to}>{label}</BackLink></section>;
}
