import { Layout } from "@/components/Layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useDeleteIdea,
  useMyIdeas,
  usePublishIdea,
  useUnpublishIdea,
} from "@/hooks/useIdeas";
import { useInterestsForIdea } from "@/hooks/useInterests";
import { useCallerProfile, useProfile } from "@/hooks/useProfile";
import { fieldLabel, stageLabel, statusLabel } from "@/lib/fields";
import { formatCount, formatFunding, formatRelative } from "@/lib/format";
import type { Idea, Interest } from "@/types";
import { isSeller } from "@/types";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { Link } from "@tanstack/react-router";
import { Eye, Mail, Pencil, Plus, Trash2, Upload, Users } from "lucide-react";
import { useState } from "react";

export function DashboardPage() {
  const { isAuthenticated, login } = useInternetIdentity();
  const { data: profile } = useCallerProfile();
  const { data: ideas, isLoading, isError, refetch } = useMyIdeas();
  const publish = usePublishIdea();
  const unpublish = useUnpublishIdea();
  const remove = useDeleteIdea();
  const [expanded, setExpanded] = useState<string | null>(null);

  if (!isAuthenticated) {
    return (
      <Layout>
        <div
          className="mx-auto max-w-2xl px-4 py-24 text-center sm:px-6"
          data-ocid="dashboard.auth_gate"
        >
          <h1 className="font-display text-3xl font-semibold text-foreground">
            Seller dashboard
          </h1>
          <p className="mt-3 text-muted-foreground">
            Sign in to manage your ideas, drafts, and interested buyers.
          </p>
          <Button
            type="button"
            className="mt-6 rounded-full"
            onClick={() => login()}
            data-ocid="dashboard.signin_button"
          >
            Sign in
          </Button>
        </div>
      </Layout>
    );
  }

  if (!isSeller(profile)) {
    return (
      <Layout>
        <div
          className="mx-auto max-w-2xl px-4 py-24 text-center sm:px-6"
          data-ocid="dashboard.role_gate"
        >
          <h1 className="font-display text-3xl font-semibold text-foreground">
            Seller dashboard
          </h1>
          <p className="mt-3 text-muted-foreground">
            This area is for idea sellers. Add the seller role from your profile
            to publish ideas.
          </p>
          <Button asChild className="mt-6 rounded-full">
            <Link to="/profile">Go to profile</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  const list = ideas ?? [];

  return (
    <Layout>
      <section className="border-b border-border bg-muted/40">
        <div className="mx-auto flex max-w-6xl flex-wrap items-end justify-between gap-4 px-4 py-12 sm:px-6 md:py-16">
          <div>
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.24em] text-accent">
              Seller desk
            </p>
            <h1 className="mt-4 font-display text-4xl font-bold tracking-tight text-foreground md:text-5xl">
              Your ideas
            </h1>
            <div className="mt-5 h-px w-32 origin-left animate-rule-grow bg-accent" />
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">
              Draft, publish, and track every venture you have put on the table.
            </p>
          </div>
          <Button
            asChild
            size="lg"
            className="rounded-full"
            data-ocid="dashboard.new_idea_button"
          >
            <Link to="/ideas/new">
              <Plus className="size-4" aria-hidden="true" />
              New idea
            </Link>
          </Button>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 md:py-14">
        {isLoading ? (
          <div className="space-y-4" data-ocid="dashboard.loading_state">
            {Array.from({ length: 3 }, (_, i) => `skeleton-${i}`).map((id) => (
              <div
                key={id}
                className="rounded-lg border border-border bg-card p-6"
              >
                <Skeleton className="h-6 w-1/3" />
                <Skeleton className="mt-3 h-4 w-2/3" />
                <Skeleton className="mt-5 h-9 w-48" />
              </div>
            ))}
          </div>
        ) : isError ? (
          <div
            className="rounded-lg border border-border bg-card p-10 text-center"
            data-ocid="dashboard.error_state"
          >
            <h2 className="font-display text-xl font-semibold text-foreground">
              Could not load your ideas
            </h2>
            <Button
              type="button"
              onClick={() => void refetch()}
              className="mt-5 rounded-full"
              data-ocid="dashboard.retry_button"
            >
              Try again
            </Button>
          </div>
        ) : list.length === 0 ? (
          <div
            className="rounded-lg border border-dashed border-border bg-card p-12 text-center"
            data-ocid="dashboard.empty_state"
          >
            <h2 className="font-display text-2xl font-semibold text-foreground">
              No ideas yet
            </h2>
            <p className="mx-auto mt-2 max-w-md text-muted-foreground">
              Publish your first venture to start meeting buyers and investors.
            </p>
            <Button asChild className="mt-6 rounded-full">
              <Link to="/ideas/new">
                <Plus className="size-4" aria-hidden="true" />
                Create your first idea
              </Link>
            </Button>
          </div>
        ) : (
          <ul className="space-y-4">
            {list.map((idea, index) => (
              <DashboardRow
                key={idea.id.toString()}
                idea={idea}
                index={index}
                expanded={expanded === idea.id.toString()}
                onToggle={() =>
                  setExpanded((current) =>
                    current === idea.id.toString() ? null : idea.id.toString(),
                  )
                }
                onPublish={() => publish.mutate(idea.id)}
                onUnpublish={() => unpublish.mutate(idea.id)}
                onDelete={() => remove.mutate(idea.id)}
                busy={
                  publish.isPending || unpublish.isPending || remove.isPending
                }
              />
            ))}
          </ul>
        )}
      </section>
    </Layout>
  );
}

interface DashboardRowProps {
  idea: Idea;
  index: number;
  expanded: boolean;
  onToggle: () => void;
  onPublish: () => void;
  onUnpublish: () => void;
  onDelete: () => void;
  busy: boolean;
}

function DashboardRow({
  idea,
  index,
  expanded,
  onToggle,
  onPublish,
  onUnpublish,
  onDelete,
  busy,
}: DashboardRowProps) {
  const published = idea.status === "published";
  return (
    <li
      className="rounded-lg border border-border bg-card shadow-subtle"
      data-ocid={`dashboard.idea_item.${index + 1}`}
    >
      <div className="flex flex-col gap-4 p-6 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant={published ? "default" : "secondary"}
              className="rounded-full px-2.5 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wider"
            >
              {statusLabel(idea.status)}
            </Badge>
            <span className="font-mono text-xs uppercase tracking-[0.16em] text-accent">
              {fieldLabel(idea.field)}
            </span>
            <span className="text-xs text-muted-foreground">
              {stageLabel(idea.stage)}
            </span>
          </div>
          <h2 className="mt-3 font-display text-xl font-semibold text-foreground">
            {idea.title}
          </h2>
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
            {idea.summary}
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-xs tabular text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Eye className="size-3.5" aria-hidden="true" />
              {formatCount(idea.viewCount)} views
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Users className="size-3.5" aria-hidden="true" />
              {formatCount(idea.interestCount)} interested
            </span>
            <span>{formatFunding(idea.fundingTarget)}</span>
            <span>Updated {formatRelative(idea.updatedAt)}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 md:flex-col md:items-stretch">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-full"
            onClick={onToggle}
            data-ocid={`dashboard.interested_button.${index + 1}`}
          >
            <Users className="size-4" aria-hidden="true" />
            {expanded ? "Hide buyers" : "Interested buyers"}
          </Button>
          <Button
            asChild
            variant="outline"
            size="sm"
            className="rounded-full"
            data-ocid={`dashboard.edit_button.${index + 1}`}
          >
            <Link to="/ideas/$id/edit" params={{ id: idea.id.toString() }}>
              <Pencil className="size-4" aria-hidden="true" />
              Edit
            </Link>
          </Button>
          {published ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-full"
              disabled={busy}
              onClick={onUnpublish}
              data-ocid={`dashboard.unpublish_button.${index + 1}`}
            >
              Unpublish
            </Button>
          ) : (
            <Button
              type="button"
              size="sm"
              className="rounded-full"
              disabled={busy}
              onClick={onPublish}
              data-ocid={`dashboard.publish_button.${index + 1}`}
            >
              <Upload className="size-4" aria-hidden="true" />
              Publish
            </Button>
          )}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="rounded-full text-destructive hover:bg-destructive/10 hover:text-destructive"
            disabled={busy}
            onClick={onDelete}
            data-ocid={`dashboard.delete_button.${index + 1}`}
          >
            <Trash2 className="size-4" aria-hidden="true" />
            Delete
          </Button>
        </div>
      </div>

      {expanded ? <InterestedBuyers ideaId={idea.id.toString()} /> : null}
    </li>
  );
}

function InterestedBuyers({ ideaId }: { ideaId: string }) {
  const { data: interests, isLoading } = useInterestsForIdea(ideaId);

  if (isLoading) {
    return (
      <div className="border-t border-border px-6 py-5">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="mt-3 h-4 w-2/3" />
      </div>
    );
  }

  const list = interests ?? [];
  if (list.length === 0) {
    return (
      <div
        className="border-t border-border px-6 py-5 text-sm text-muted-foreground"
        data-ocid="dashboard.buyers_empty_state"
      >
        No buyers have expressed interest yet.
      </div>
    );
  }

  return (
    <div className="border-t border-border bg-muted/30 px-6 py-5">
      <h3 className="font-mono text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        Interested buyers
      </h3>
      <ul className="mt-4 space-y-3">
        {list.map((interest, index) => (
          <BuyerRow
            key={interest.id.toString()}
            interest={interest}
            index={index}
          />
        ))}
      </ul>
    </div>
  );
}

function BuyerRow({ interest, index }: { interest: Interest; index: number }) {
  const { data: buyer } = useProfile(interest.buyer.toString());
  return (
    <li
      className="rounded-md border border-border bg-card p-4"
      data-ocid={`dashboard.buyer_item.${index + 1}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-medium text-foreground">
          {buyer?.displayName || "ThinkBig buyer"}
        </p>
        <span className="font-mono text-xs text-muted-foreground">
          {formatRelative(interest.createdAt)}
        </span>
      </div>
      {buyer?.bio ? (
        <p className="mt-1 text-sm text-muted-foreground">{buyer.bio}</p>
      ) : null}
      <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-foreground/90">
        {interest.message}
      </p>
      {buyer?.contactEmail ? (
        <a
          href={`mailto:${buyer.contactEmail}?subject=${encodeURIComponent(
            "Re: your interest on ThinkBig",
          )}`}
          className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-accent underline-offset-4 hover:underline"
          data-ocid={`dashboard.buyer_email_link.${index + 1}`}
        >
          <Mail className="size-3.5" aria-hidden="true" />
          {buyer.contactEmail}
        </a>
      ) : null}
    </li>
  );
}
