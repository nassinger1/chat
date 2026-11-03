import type { PropsWithChildren } from "react";
import { Link } from "react-router-dom";
import "./styles.css";

type AuthCardProps = PropsWithChildren<{
  title: string;
  subtitle: string;
  footerLabel: string;
  footerTo: string;
}>;

export function AuthCard({
  title,
  subtitle,
  footerLabel,
  footerTo,
  children,
}: AuthCardProps) {
  return (
    <main className="auth-card">
      <section className="card">
        <div className="content">
          <h1>{title}</h1>
          <p>{subtitle}</p>
          {children}
        </div>
        <Link className="footer" to={footerTo}>
          {footerLabel}
        </Link>
      </section>
    </main>
  );
}
