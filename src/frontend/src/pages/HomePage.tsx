import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import {
  useAddRole,
  useCallerProfile,
  useSaveProfile,
} from "@/hooks/useProfile";
import { FIELD_OPTIONS } from "@/lib/fields";
import { isBuyer, isSeller } from "@/types";
import type { AccountRole } from "@/types";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Compass, Lightbulb, Sparkles } from "lucide-react";

const ROLE_CARDS: {
  role: AccountRole;
  title: string;
  blurb: string;
  icon: typeof Lightbulb;
  destination: "/dashboard" | "/browse";
  cta: string;
}[] = [
  {
    role: "seller" as AccountRole,
    title: "I'm an Idea Seller",
    blurb:
      "Publish your venture, attach the business plan, and meet buyers ready to invest or build with you.",
    icon: Lightbulb,
    destination: "/dashboard",
    cta: "Start selling",
  },
  {
    role: "buyer" as AccountRole,
    title: "I'm an Idea Buyer",
    blurb:
      "Browse ventures across every field, filter by stage and funding, and reach out to the founders.",
    icon: Compass,
    destination: "/browse",
    cta: "Start browsing",
  },
];

export function HomePage() {
  const { isAuthenticated, isInitializing, isLoggingIn, login } =
    useInternetIdentity();
  const { data: profile, isFetched } = useCallerProfile();
  const addRole = useAddRole();
  const saveProfile = useSaveProfile();
  const navigate = useNavigate();

  const chooseRole = (
    role: AccountRole,
    destination: "/dashboard" | "/browse",
  ) => {
    if (!isAuthenticated) {
      login();
      return;
    }
    if (!profile) {
      saveProfile.mutate(
        {
          displayName: "",
          bio: "",
          contactEmail: "",
          roles: [role],
        },
        { onSuccess: () => void navigate({ to: destination }) },
      );
      return;
    }
    if (profile.roles.includes(role)) {
      void navigate({ to: destination });
      return;
    }
    addRole.mutate(role, {
      onSuccess: () => void navigate({ to: destination }),
    });
  };

  const busy = addRole.isPending || saveProfile.isPending;

  return (
    <Layout>
      <section className="relative overflow-hidden border-b border-border bg-gradient-subtle">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 md:py-28">
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.24em] text-accent">
            The marketplace for ideas
          </p>
          <h1 className="mt-5 max-w-3xl font-display text-4xl font-bold leading-[1.05] tracking-tight text-foreground sm:text-5xl md:text-7xl">
            Where bold ideas meet the people who can build them.
          </h1>
          <div className="mt-6 h-px w-40 origin-left animate-rule-grow bg-accent" />
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl">
            ThinkBig connects idea sellers with buyers ready to invest, partner,
            and form the next great business group — across business,
            agriculture, medicine, engineering, and every field in between.
          </p>

          {isAuthenticated && profile ? (
            <div className="mt-8 flex flex-wrap items-center gap-3">
              {isSeller(profile) ? (
                <Button
                  asChild
                  size="lg"
                  className="rounded-full"
                  data-ocid="home.dashboard_link"
                >
                  <Link to="/dashboard">
                    Go to seller dashboard
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </Link>
                </Button>
              ) : null}
              {isBuyer(profile) ? (
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="rounded-full"
                  data-ocid="home.browse_link"
                >
                  <Link to="/browse">
                    Browse ideas
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </Link>
                </Button>
              ) : null}
            </div>
          ) : null}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              Choose your side of the table
            </h2>
            <p className="mt-3 max-w-xl text-muted-foreground">
              Sign in with Internet Identity and pick a role. You can hold both
              and switch between them at any time.
            </p>
          </div>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2 md:gap-8">
          {ROLE_CARDS.map((card, index) => {
            const Icon = card.icon;
            const held = profile ? profile.roles.includes(card.role) : false;
            return (
              <article
                key={card.role}
                data-ocid={`home.role_card.${index + 1}`}
                className="flex flex-col rounded-lg border border-border bg-card p-7 shadow-subtle transition-smooth hover:-translate-y-0.5 hover:shadow-lift"
              >
                <span className="flex size-12 items-center justify-center rounded-md bg-primary text-primary-foreground">
                  <Icon className="size-6" aria-hidden="true" />
                </span>
                <h3 className="mt-5 font-display text-2xl font-semibold tracking-tight text-foreground">
                  {card.title}
                </h3>
                <p className="mt-3 flex-1 leading-relaxed text-muted-foreground">
                  {card.blurb}
                </p>
                <Button
                  type="button"
                  size="lg"
                  variant={index === 0 ? "default" : "outline"}
                  className="mt-7 w-full rounded-full"
                  disabled={busy || isInitializing || isLoggingIn}
                  onClick={() => chooseRole(card.role, card.destination)}
                  data-ocid={`home.role_button.${index + 1}`}
                >
                  {isInitializing || isLoggingIn
                    ? "Connecting…"
                    : held
                      ? `Continue as ${card.role === "seller" ? "seller" : "buyer"}`
                      : card.cta}
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Button>
              </article>
            );
          })}
        </div>

        {isAuthenticated && isFetched && !profile ? (
          <p
            className="mt-6 text-sm text-muted-foreground"
            data-ocid="home.role_hint"
          >
            Pick a role above to finish setting up your account.
          </p>
        ) : null}
      </section>

      <section className="border-y border-border bg-muted/40">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-20">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-accent" aria-hidden="true" />
            <h2 className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Every field, one ledger
            </h2>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-3 lg:grid-cols-5">
            {FIELD_OPTIONS.map((field) => (
              <div key={field.value} className="border-t border-border pt-3">
                <p className="font-display text-lg font-semibold text-foreground">
                  {field.label}
                </p>
                <p className="mt-1 text-sm leading-snug text-muted-foreground">
                  {field.blurb}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24">
        <div className="grid gap-10 md:grid-cols-3">
          {[
            {
              step: "01",
              title: "Publish the idea",
              body: "Sellers write the summary, the full description, and the business plan, then set a funding target and stage.",
            },
            {
              step: "02",
              title: "Discover and filter",
              body: "Buyers search by keyword and narrow by field, stage, and funding range to find the ventures that fit.",
            },
            {
              step: "03",
              title: "Express interest",
              body: "Buyers send a message to the seller, who sees every interested party and their profile in one place.",
            },
          ].map((item) => (
            <div key={item.step}>
              <p className="font-mono text-sm font-semibold text-accent">
                {item.step}
              </p>
              <h3 className="mt-3 font-display text-xl font-semibold text-foreground">
                {item.title}
              </h3>
              <p className="mt-2 leading-relaxed text-muted-foreground">
                {item.body}
              </p>
            </div>
          ))}
        </div>
      </section>
    </Layout>
  );
}
