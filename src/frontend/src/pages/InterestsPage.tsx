import { Layout } from "@/components/Layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useIdea } from "@/hooks/useIdeas";
import { useMyInterests } from "@/hooks/useInterests";
import { fieldLabel, stageLabel } from "@/lib/fields";
import { formatFunding, formatRelative } from "@/lib/format";
import type { Interest } from "@/types";
import { isBuyer } from "@/types";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Compass } from "lucide-react";

export function InterestsPage() {
  const { isAuthenticated, login } = useInternetIdentity();
  const { data: interests, isLoading, isError, refetch } = useMyInterests();

  if (!isAuthenticated) {
    return (
      <Layout>
        <div
          className="mx-auto max-w-2xl px-4 py-24 text-center sm:px-6"
          data-ocid="interests.auth_gate"
        >
          <h1 className="font-display text-3xl font-semibold text-foreground">
            My interests
          </h1>
          <p className="mt-3 text-muted-foreground">
            Sign in to see the ideas you have expressed interest in.
          </p>
          <Button
            type="button"
            className="mt-6 rounded-full"
            onClick={() => login()}
            data-ocid="interests.signin_button"
          >
            Sign in
          </Button>
        </div>
      </Layout>
    );
  }

  const list = interests ?? [];

  return (
    <Layout>
      <section className="border-b border-border bg-muted/40">
        <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 md:py-16">
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.24em] text-accent">
            Buyer desk
          </p>
          <h1 className="mt-4 font-display text-4xl font-bold tracking-tight text-foreground md:text-5xl">
            My interests
          </h1>
          <div className="mt-5 h-px w-32 origin-left animate-rule-grow bg-accent" />
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">
            Every idea you have reached out about, with the message you sent.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 md:py-14">
        {isLoading ? (
          <div className="space-y-4" data-ocid="interests.loading_state">
            {Array.from({ length: 3 }, (_, i) => `skeleton-${i}`).map((id) => (
              <div
                key={id}
                className="rounded-lg border border-border bg-card p-6"
              >
                <Skeleton className="h-5 w-1/3" />
                <Skeleton className="mt-3 h-4 w-2/3" />
              </div>
            ))}
          </div>
        ) : isError ? (
          <div
            className="rounded-lg border border-border bg-card p-10 text-center"
            data-ocid="interests.error_state"
          >
            <h2 className="font-display text-xl font-semibold text-foreground">
              Could not load your interests
            </h2>
            <Button
              type="button"
              onClick={() => void refetch()}
              className="mt-5 rounded-full"
              data-ocid="interests.retry_button"
            >
              Try again
            </Button>
          </div>
        ) : list.length === 0 ? (
          <div
            className="rounded-lg border border-dashed border-border bg-card p-12 text-center"
            data-ocid="interests.empty_state"
          >
            <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <Compass className="size-6" aria-hidden="true" />
            </span>
            <h2 className="mt-4 font-display text-2xl font-semibold text-foreground">
              No interests yet
            </h2>
            <p className="mx-auto mt-2 max-w-md text-muted-foreground">
              Browse the ledger and express interest in the ventures that fit
              your thesis.
            </p>
            <Button asChild className="mt-6 rounded-full">
              <Link to="/browse">
                Browse ideas
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </Button>
          </div>
        ) : (
          <ul className="space-y-4">
            {list.map((interest, index) => (
              <InterestRow
                key={interest.id.toString()}
                interest={interest}
                index={index}
              />
            ))}
          </ul>
        )}
      </section>
    </Layout>
  );
}

function InterestRow({
  interest,
  index,
}: { interest: Interest; index: number }) {
  const { data: idea, isLoading } = useIdea(interest.ideaId.toString());

  if (isLoading) {
    return (
      <li className="rounded-lg border border-border bg-card p-6">
        <Skeleton className="h-5 w-1/3" />
        <Skeleton className="mt-3 h-4 w-2/3" />
      </li>
    );
  }

  if (!idea) {
    return (
      <li
        className="rounded-lg border border-border bg-card p-6 text-sm text-muted-foreground"
        data-ocid={`interests.item.${index + 1}`}
      >
        This idea is no longer available.
      </li>
    );
  }

  return (
    <li
      className="rounded-lg border border-border bg-card p-6 shadow-subtle transition-smooth hover:shadow-lift"
      data-ocid={`interests.item.${index + 1}`}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-accent">
          {fieldLabel(idea.field)}
        </span>
        <Badge
          variant="secondary"
          className="rounded-full px-2.5 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wider"
        >
          {stageLabel(idea.stage)}
        </Badge>
        <span className="font-mono text-xs text-muted-foreground">
          {formatRelative(interest.createdAt)}
        </span>
      </div>

      <Link
        to="/ideas/$id"
        params={{ id: idea.id.toString() }}
        className="mt-3 block font-display text-xl font-semibold text-foreground transition-colors hover:text-accent"
        data-ocid={`interests.idea_link.${index + 1}`}
      >
        {idea.title}
      </Link>

      <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
        {idea.summary}
      </p>

      <div className="mt-4 rounded-md border border-border bg-muted/40 p-4">
        <p className="font-mono text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Your message
        </p>
        <p className="mt-1.5 whitespace-pre-line text-sm leading-relaxed text-foreground/90">
          {interest.message}
        </p>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <span className="font-mono text-sm tabular text-muted-foreground">
          {formatFunding(idea.fundingTarget)}
        </span>
        <Button asChild variant="outline" size="sm" className="rounded-full">
          <Link to="/ideas/$id" params={{ id: idea.id.toString() }}>
            View idea
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </Button>
      </div>
    </li>
  );
}
