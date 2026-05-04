import { Link } from "@tanstack/react-router";
import { ShieldCheck, Sparkles, TrendingUp } from "lucide-react";
import logo from "../public/udaan-logo-removebg-preview.png";

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}) {
  return (
    <div className="min-h-screen w-full bg-background lg:grid lg:grid-cols-2">
      {/* Left brand panel */}
      <aside className="relative hidden overflow-hidden bg-gradient-to-br from-primary via-primary to-[oklch(0.55_0.18_155)] p-10 text-primary-foreground lg:flex lg:flex-col lg:justify-between">
        <Link to="/login" className="flex items-center gap-2">
          <img src={logo} alt="Udaan" className="h-10 w-10 rounded-xl object-cover" />
          <span className="text-lg font-bold tracking-tight">Udaan</span>
        </Link>

        <div className="relative z-10 max-w-md">
          <h2 className="text-3xl font-bold leading-tight">
            Run your business with simple, GST-ready billing.
          </h2>
          <p className="mt-3 text-sm text-primary-foreground/80">
            Invoices, inventory, khata and reports — built for Indian small
            businesses. Free to start.
          </p>

          <ul className="mt-8 space-y-4 text-sm">
            {[
              { icon: ShieldCheck, t: "Secure & private", d: "Your data stays yours." },
              { icon: Sparkles, t: "GST invoices in 30s", d: "CGST/SGST auto-calculated." },
              { icon: TrendingUp, t: "Real-time reports", d: "P&L, stock, GSTR summary." },
            ].map((f) => (
              <li key={f.t} className="flex items-start gap-3">
                <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg bg-white/15 backdrop-blur">
                  <f.icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-semibold">{f.t}</p>
                  <p className="text-primary-foreground/75">{f.d}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <p className="text-xs text-primary-foreground/70">
          © {new Date().getFullYear()} Udaan. Made for Bharat.
        </p>

        {/* decorative glow */}
        <div className="pointer-events-none absolute -right-32 -top-32 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-20 h-72 w-72 rounded-full bg-accent/30 blur-3xl" />
      </aside>

      {/* Right form panel */}
      <main className="flex min-h-screen items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md">
          <Link to="/login" className="mb-8 flex items-center gap-2 lg:hidden">
            <img src={logo} alt="Udaan" className="h-9 w-9 rounded-xl object-cover" />
            <span className="text-base font-bold">Udaan</span>
          </Link>

          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{title}</h1>
          {subtitle && (
            <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
          )}

          <div className="mt-8">{children}</div>

          {footer && (
            <div className="mt-6 text-center text-sm text-muted-foreground">
              {footer}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
