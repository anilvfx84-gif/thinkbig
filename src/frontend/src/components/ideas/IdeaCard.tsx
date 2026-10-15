import { Badge } from "@/components/ui/badge";
import { fieldLabel, stageLabel } from "@/lib/fields";
import { formatCount, formatFunding, formatRelative } from "@/lib/format";
import type { Idea } from "@/types";
import { Link } from "@tanstack/react-router";
import { Eye, MapPin, Users } from "lucide-react";

interface IdeaCardProps {
  idea: Idea;
  index: number;
}

export function IdeaCard({ idea, index }: IdeaCardProps) {
  return (
    <Link
      to="/ideas/$id"
      params={{ id: idea.id.toString() }}
      data-ocid={`browse.idea_card.${index + 1}`}
      className="group flex h-full flex-col rounded-lg border border-border bg-card p-5 shadow-subtle transition-smooth hover:-translate-y-0.5 hover:shadow-lift focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      <div className="flex items-center justify-between gap-3">
        <span className="font-mono text-[0.7rem] font-medium uppercase tracking-[0.18em] text-accent">
          {fieldLabel(idea.field)}
        </span>
        <Badge
          variant="secondary"
          className="rounded-full px-2.5 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wider"
        >
          {stageLabel(idea.stage)}
        </Badge>
      </div>

      <h3 className="mt-3 font-display text-xl font-semibold leading-snug tracking-tight text-foreground transition-colors group-hover:text-accent">
        {idea.title}
      </h3>

      <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-muted-foreground">
        {idea.summary}
      </p>

      <div className="mt-5 flex items-end justify-between gap-3 border-t border-border pt-4">
        <div>
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground">
            Funding target
          </p>
          <p className="mt-0.5 font-mono text-lg font-semibold tabular text-foreground">
            {formatFunding(idea.fundingTarget)}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Eye className="size-3.5" aria-hidden="true" />
            {formatCount(idea.viewCount)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Users className="size-3.5" aria-hidden="true" />
            {formatCount(idea.interestCount)}
          </span>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-2 text-xs text-muted-foreground">
        <span className="inline-flex min-w-0 items-center gap-1.5">
          <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
          <span className="truncate">{idea.location || "Location open"}</span>
        </span>
        <span className="shrink-0 font-mono">
          {formatRelative(idea.createdAt)}
        </span>
      </div>
    </Link>
  );
}
