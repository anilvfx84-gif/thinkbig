import { Layout } from "@/components/Layout";
import { DocumentList } from "@/components/ideas/DocumentList";
import { InterestDialog } from "@/components/ideas/InterestDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useIdea, useRecordIdeaView } from "@/hooks/useIdeas";
import { useCallerProfile, useProfile } from "@/hooks/useProfile";
import { fieldLabel, stageLabel } from "@/lib/fields";
import { formatCount, formatDate, formatFundingFull } from "@/lib/format";
import { isBuyer } from "@/types";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { Link, useParams } from "@tanstack/react-router";
import {
  ArrowLeft,
  CalendarDays,
  Eye,
  Mail,
  MapPin,
  Users,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

export function IdeaDetailPage() {
  const { id } = useParams({ from: "/ideas/$id" });
  const { isAuthenticated, login } = useInternetIdentity();
  const { data: idea, isLoading, isError } = useIdea(id);
  const { data: seller } = useProfile(idea?.owner.toString());
  const { data: callerProfile } = useCallerProfile();
  const recordView = useRecordIdeaView();
  const recordViewMutate = recordView.mutate;
  const [dialogOpen, setDialogOpen] = useState(false);
  const recordedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!idea || recordedRef.current === id) return;
    recordedRef.current = id;
    recordViewMutate(idea.id);
  }, [idea, id, recordViewMutate]);

  if (isLoading) {
    return (
      <Layout>
        <div
          className="mx-auto max-w-4xl px-4 py-16 sm:px-6"
          data-ocid="idea.loading_state"
        >
          <Skeleton className="h-5 w-32" />
          <Skeleton className="mt-6 h-12 w-3/4" />
          <Skeleton className="mt-4 h-5 w-full" />
          <Skeleton className="mt-2 h-5 w-5/6" />
          <Skeleton className="mt-10 h-64 w-full" />
        </div>
      </Layout>
    );
  }

  if (isError || !idea) {
    return (
      <Layout>
        <div
          className="mx-auto max-w-2xl px-4 py-24 text-center sm:px-6"
          data-ocid="idea.error_state"
        >
          <h1 className="font-display text-3xl font-semibold text-foreground">
            Idea not found
          </h1>
          <p className="mt-3 text-muted-foreground">
            This idea may have been unpublished or removed by its seller.
          </p>
          <Button asChild className="mt-6 rounded-full">
            <Link to="/browse">Back to browse</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  const isOwner = callerProfile?.id.toString() === idea.owner.toString();
  const canExpress = isAuthenticated && isBuyer(callerProfile) && !isOwner;
  const mailto = seller?.contactEmail
    ? `mailto:${seller.contactEmail}?subject=${encodeURIComponent(
        `Interest in “${idea.title}” on ThinkBig`,
      )}`
    : null;

  return (
    <Layout>
      <article className="mx-auto max-w-4xl px-4 py-10 sm:px-6 md:py-14">
        <Link
          to="/browse"
          data-ocid="idea.back_link"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-accent"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to browse
        </Link>

        <header className="mt-6">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-accent">
              {fieldLabel(idea.field)}
            </span>
            <Badge
              variant="secondary"
              className="rounded-full px-2.5 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wider"
            >
              {stageLabel(idea.stage)}
            </Badge>
            {idea.status === "draft" ? (
              <Badge
                variant="outline"
                className="rounded-full px-2.5 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wider"
              >
                Draft
              </Badge>
            ) : null}
          </div>

          <h1 className="mt-4 font-display text-4xl font-bold leading-tight tracking-tight text-foreground md:text-5xl">
            {idea.title}
          </h1>
          <div className="mt-5 h-px w-32 origin-left animate-rule-grow bg-accent" />
          <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
            {idea.summary}
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="size-4" aria-hidden="true" />
              {idea.location || "Location open"}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="size-4" aria-hidden="true" />
              {formatDate(idea.createdAt)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Eye className="size-4" aria-hidden="true" />
              {formatCount(idea.viewCount)} views
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Users className="size-4" aria-hidden="true" />
              {formatCount(idea.interestCount)} interested
            </span>
          </div>
        </header>

        <div className="mt-10 grid gap-8 md:grid-cols-[1fr_260px]">
          <div className="min-w-0 space-y-10">
            <section data-ocid="idea.description_section">
              <h2 className="font-display text-2xl font-semibold text-foreground">
                The idea
              </h2>
              <p className="mt-4 whitespace-pre-line leading-relaxed text-foreground/90">
                {idea.description || "No description provided."}
              </p>
            </section>

            <section data-ocid="idea.business_plan_section">
              <h2 className="font-display text-2xl font-semibold text-foreground">
                Business plan
              </h2>
              <div className="mt-4 whitespace-pre-line rounded-lg border border-border bg-card p-6 leading-relaxed text-foreground/90">
                {idea.businessPlan || "No business plan provided yet."}
              </div>
            </section>

            {idea.images.length > 0 ? (
              <section data-ocid="idea.images_section">
                <h2 className="font-display text-2xl font-semibold text-foreground">
                  Images
                </h2>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  {idea.images.map((image, index) => (
                    <a
                      key={image.id.toString()}
                      href={image.url}
                      target="_blank"
                      rel="noreferrer"
                      data-ocid={`idea.image_item.${index + 1}`}
                      className="overflow-hidden rounded-lg border border-border bg-muted"
                    >
                      <img
                        src={image.url}
                        alt={image.name || `${idea.title} image ${index + 1}`}
                        loading="lazy"
                        className="h-48 w-full object-cover transition-transform duration-300 hover:scale-[1.02]"
                      />
                    </a>
                  ))}
                </div>
              </section>
            ) : null}

            <section data-ocid="idea.documents_section">
              <h2 className="font-display text-2xl font-semibold text-foreground">
                Documents
              </h2>
              <div className="mt-4">
                <DocumentList documents={idea.documents} />
              </div>
            </section>
          </div>

          <aside className="space-y-6">
            <div className="rounded-lg border border-border bg-card p-6 shadow-subtle">
              <p className="font-mono text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Funding target
              </p>
              <p className="mt-2 font-mono text-3xl font-semibold tabular text-foreground">
                {formatFundingFull(idea.fundingTarget)}
              </p>

              <div className="mt-6 space-y-3">
                {canExpress ? (
                  <Button
                    type="button"
                    className="w-full rounded-full"
                    onClick={() => setDialogOpen(true)}
                    data-ocid="idea.express_interest_button"
                  >
                    Express interest
                  </Button>
                ) : !isAuthenticated ? (
                  <Button
                    type="button"
                    className="w-full rounded-full"
                    onClick={() => login()}
                    data-ocid="idea.signin_button"
                  >
                    Sign in to express interest
                  </Button>
                ) : isOwner ? (
                  <Button
                    asChild
                    variant="outline"
                    className="w-full rounded-full"
                    data-ocid="idea.edit_button"
                  >
                    <Link
                      to="/ideas/$id/edit"
                      params={{ id: idea.id.toString() }}
                    >
                      Edit this idea
                    </Link>
                  </Button>
                ) : null}

                {mailto ? (
                  <Button
                    asChild
                    variant="outline"
                    className="w-full rounded-full"
                    data-ocid="idea.contact_seller_button"
                  >
                    <a href={mailto}>
                      <Mail className="size-4" aria-hidden="true" />
                      Contact seller
                    </a>
                  </Button>
                ) : null}
              </div>
            </div>

            <div
              className="rounded-lg border border-border bg-card p-6 shadow-subtle"
              data-ocid="idea.seller_profile"
            >
              <p className="font-mono text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Seller
              </p>
              <p className="mt-2 font-display text-xl font-semibold text-foreground">
                {seller?.displayName || "ThinkBig seller"}
              </p>
              {seller?.bio ? (
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {seller.bio}
                </p>
              ) : null}
              {seller?.contactEmail ? (
                <a
                  href={mailto ?? undefined}
                  className="mt-3 inline-block break-all text-sm font-medium text-accent underline-offset-4 hover:underline"
                  data-ocid="idea.seller_email_link"
                >
                  {seller.contactEmail}
                </a>
              ) : null}
            </div>
          </aside>
        </div>
      </article>

      <InterestDialog
        ideaId={idea.id}
        ideaTitle={idea.title}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </Layout>
  );
}
