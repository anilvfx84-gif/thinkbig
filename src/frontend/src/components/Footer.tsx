import { Link } from "@tanstack/react-router";
import { Lightbulb } from "lucide-react";

const FOOTER_LINKS = [
  { to: "/browse", label: "Browse ideas" },
  { to: "/dashboard", label: "Seller dashboard" },
  { to: "/interests", label: "My interests" },
  { to: "/profile", label: "Profile" },
] as const;

export function Footer() {
  const year = new Date().getFullYear();
  const hostname =
    typeof window !== "undefined" ? window.location.hostname : "";

  return (
    <footer className="border-t border-border bg-secondary/60">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-[1.5fr_1fr_1fr]">
        <div className="max-w-sm">
          <div className="flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Lightbulb className="size-4" aria-hidden="true" />
            </span>
            <span className="font-display text-lg font-semibold text-foreground">
              ThinkBig
            </span>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            A marketplace where idea sellers publish their ventures and buyers
            invest, partner, and build the next company together.
          </p>
        </div>

        <div>
          <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-foreground">
            Explore
          </h2>
          <ul className="mt-3 space-y-2">
            {FOOTER_LINKS.map((link) => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  className="text-sm text-muted-foreground transition-colors hover:text-accent"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-foreground">
            Fields
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Business, Agriculture, Medicine, Mechanical Engineering, Bio,
            Technology, Education, Energy, and more.
          </p>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-muted-foreground sm:flex-row sm:px-6">
          <p>
            © {year}. Built with love using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(hostname)}`}
              target="_blank"
              rel="noreferrer"
              className="font-medium text-foreground underline-offset-4 hover:text-accent hover:underline"
            >
              caffeine.ai
            </a>
          </p>
          <p className="font-mono uppercase tracking-wider">
            Ideas meet capital
          </p>
        </div>
      </div>
    </footer>
  );
}
