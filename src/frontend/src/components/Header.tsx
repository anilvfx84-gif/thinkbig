import { Button } from "@/components/ui/button";
import { useCallerProfile } from "@/hooks/useProfile";
import { isBuyer, isSeller } from "@/types";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Lightbulb, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";

interface NavItem {
  to: string;
  label: string;
  show: boolean;
}

export function Header() {
  const { isAuthenticated, isInitializing, isLoggingIn, login, clear } =
    useInternetIdentity();
  const { data: profile } = useCallerProfile();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems: NavItem[] = [
    { to: "/browse", label: "Browse", show: true },
    { to: "/dashboard", label: "Dashboard", show: isSeller(profile) },
    { to: "/interests", label: "My Interests", show: isBuyer(profile) },
    { to: "/profile", label: "Profile", show: isAuthenticated },
  ];

  const handleAuth = () => {
    if (isAuthenticated) {
      clear();
      void navigate({ to: "/" });
    } else {
      login();
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          to="/"
          className="group flex items-center gap-2.5"
          data-ocid="header.logo_link"
        >
          <span className="flex size-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Lightbulb className="size-5" aria-hidden="true" />
          </span>
          <span className="font-display text-xl font-semibold tracking-tight text-foreground">
            ThinkBig
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
          {navItems
            .filter((item) => item.show)
            .map((item) => {
              const active =
                pathname === item.to || pathname.startsWith(`${item.to}/`);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  data-ocid={`header.nav.${item.label.toLowerCase().replace(/\s+/g, "_")}`}
                  className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    active
                      ? "text-accent"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
        </nav>

        <div className="flex items-center gap-2">
          {isAuthenticated && profile ? (
            <span className="hidden text-sm text-muted-foreground sm:inline">
              {profile.displayName}
            </span>
          ) : null}
          <Button
            type="button"
            variant={isAuthenticated ? "outline" : "default"}
            size="sm"
            onClick={handleAuth}
            disabled={isInitializing || isLoggingIn}
            data-ocid="header.auth_button"
            className="rounded-full"
          >
            {isInitializing
              ? "Loading…"
              : isLoggingIn
                ? "Signing in…"
                : isAuthenticated
                  ? "Sign out"
                  : "Sign in"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((open) => !open)}
            data-ocid="header.menu_toggle"
          >
            {mobileOpen ? (
              <X className="size-5" />
            ) : (
              <Menu className="size-5" />
            )}
          </Button>
        </div>
      </div>

      {mobileOpen ? (
        <nav
          className="border-t border-border bg-card px-4 py-3 md:hidden"
          aria-label="Mobile"
        >
          <ul className="flex flex-col gap-1">
            {navItems
              .filter((item) => item.show)
              .map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    onClick={() => setMobileOpen(false)}
                    data-ocid={`header.mobile_nav.${item.label.toLowerCase().replace(/\s+/g, "_")}`}
                    className="block rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            {isAuthenticated ? (
              <li>
                <button
                  type="button"
                  onClick={() => {
                    setMobileOpen(false);
                    handleAuth();
                  }}
                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                  data-ocid="header.mobile_signout_button"
                >
                  <LogOut className="size-4" aria-hidden="true" />
                  Sign out
                </button>
              </li>
            ) : null}
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
