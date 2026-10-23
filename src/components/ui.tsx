import { ArrowLeft, Compass } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface EyebrowProps {
  children?: ReactNode;
}

interface BadgeProps {
  children?: ReactNode;
}

interface BackLinkProps {
  to: string;
  children?: ReactNode;
}

interface MissingContentProps {
  title: string;
  to?: string;
  label?: string;
}

export function Eyebrow({ children }: EyebrowProps) { return <p className="eyebrow">{children}</p>; }
export function Badge({ children }: BadgeProps) { return <span className="badge">{children}</span>; }
export function BackLink({ to, children }: BackLinkProps) {
  return <Link to={to} className="back-link"><ArrowLeft size={15} aria-hidden="true" />{children}</Link>;
}
export function MissingContent({ title, to = '/', label = 'Back to your tours' }: MissingContentProps) {
  return <section className="missing"><Compass size={42} aria-hidden="true" /><h1>{title}</h1><p>This stop isn’t in the preview library.</p><BackLink to={to}>{label}</BackLink></section>;
}
