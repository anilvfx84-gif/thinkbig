import {
  Field as FieldEnum,
  IdeaSort as IdeaSortEnum,
  Stage as StageEnum,
} from "@/backend";
import { Layout } from "@/components/Layout";
import { FUNDING_MAX, FilterRail } from "@/components/ideas/FilterRail";
import { IdeaCard } from "@/components/ideas/IdeaCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { usePublishedIdeas } from "@/hooks/useIdeas";
import { SORT_OPTIONS } from "@/lib/fields";
import type { Field, IdeaFilter, IdeaSort, Stage } from "@/types";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { useMemo, useState } from "react";

interface BrowseSearch {
  q: string;
  fields: Field[];
  stage: Stage | null;
  min: number;
  max: number;
  sort: IdeaSort;
}

const FIELD_VALUES = new Set<string>(Object.values(FieldEnum));
const STAGE_VALUES = new Set<string>(Object.values(StageEnum));

function parseSearch(raw: Record<string, unknown>): BrowseSearch {
  const q = typeof raw.q === "string" ? raw.q : "";
  const fieldsRaw = typeof raw.fields === "string" ? raw.fields.split(",") : [];
  const fields = fieldsRaw.filter((value): value is Field =>
    FIELD_VALUES.has(value),
  );
  const stageRaw = typeof raw.stage === "string" ? raw.stage : "";
  const stage = STAGE_VALUES.has(stageRaw) ? (stageRaw as Stage) : null;
  const min = Number.isFinite(Number(raw.min)) ? Number(raw.min) : 0;
  const max = Number.isFinite(Number(raw.max)) ? Number(raw.max) : FUNDING_MAX;
  const sort =
    raw.sort === IdeaSortEnum.mostViewed
      ? IdeaSortEnum.mostViewed
      : IdeaSortEnum.newest;
  return { q, fields, stage, min, max, sort };
}

function toSearchRecord(search: BrowseSearch): Record<string, string> {
  const record: Record<string, string> = {};
  if (search.q) record.q = search.q;
  if (search.fields.length > 0) record.fields = search.fields.join(",");
  if (search.stage) record.stage = search.stage;
  if (search.min > 0) record.min = String(search.min);
  if (search.max < FUNDING_MAX) record.max = String(search.max);
  if (search.sort !== IdeaSortEnum.newest) record.sort = search.sort;
  return record;
}

export function BrowsePage() {
  const navigate = useNavigate();
  const rawSearch = useRouterState({
    select: (state) => state.location.search as Record<string, unknown>,
  });
  const search = useMemo(() => parseSearch(rawSearch), [rawSearch]);
  const [keyword, setKeyword] = useState(search.q);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const filter: IdeaFilter = useMemo(() => {
    const result: IdeaFilter = { sort: search.sort };
    if (search.fields.length === 1) result.field = search.fields[0];
    if (search.stage) result.stage = search.stage;
    if (search.q) result.search = search.q;
    if (search.min > 0) result.minFunding = BigInt(search.min);
    if (search.max < FUNDING_MAX) result.maxFunding = BigInt(search.max);
    return result;
  }, [search]);

  const {
    data: ideas,
    isLoading,
    isError,
    refetch,
  } = usePublishedIdeas(filter);

  const update = (patch: Partial<BrowseSearch>) => {
    const next = { ...search, ...patch };
    void navigate({
      to: "/browse",
      search: toSearchRecord(next),
      replace: true,
    });
  };

  const toggleField = (field: Field) => {
    const fields = search.fields.includes(field)
      ? search.fields.filter((value) => value !== field)
      : [...search.fields, field];
    update({ fields });
  };

  const submitKeyword = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    update({ q: keyword.trim() });
  };

  const reset = () => {
    setKeyword("");
    void navigate({ to: "/browse", search: {}, replace: true });
  };

  const activeCount =
    search.fields.length +
    (search.stage ? 1 : 0) +
    (search.min > 0 || search.max < FUNDING_MAX ? 1 : 0) +
    (search.q ? 1 : 0);

  const visible = useMemo(() => {
    if (!ideas) return [];
    if (search.fields.length <= 1) return ideas;
    return ideas.filter((idea) => search.fields.includes(idea.field));
  }, [ideas, search.fields]);

  const rail = (
    <FilterRail
      fields={search.fields}
      stage={search.stage}
      minFunding={search.min}
      maxFunding={search.max}
      onToggleField={toggleField}
      onStageChange={(stage) => update({ stage })}
      onFundingChange={([min, max]) => update({ min, max })}
      onReset={reset}
      activeCount={activeCount}
    />
  );

  return (
    <Layout>
      <section className="border-b border-border bg-muted/40">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 md:py-16">
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.24em] text-accent">
            The ledger
          </p>
          <h1 className="mt-4 font-display text-4xl font-bold tracking-tight text-foreground md:text-5xl">
            Browse published ideas
          </h1>
          <div className="mt-5 h-px w-32 origin-left animate-rule-grow bg-accent" />
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            Every venture on the table, across every field. Filter, sort, and
            open the ones worth your capital.
          </p>

          <form
            onSubmit={submitKeyword}
            className="mt-8 flex max-w-2xl items-center gap-2"
          >
            <div className="relative flex-1">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                placeholder="Search by title or summary…"
                aria-label="Search ideas"
                data-ocid="browse.search_input"
                className="h-11 rounded-full pl-9"
              />
            </div>
            <Button
              type="submit"
              className="h-11 rounded-full px-6"
              data-ocid="browse.search_button"
            >
              Search
            </Button>
          </form>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 md:py-14">
        <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
          <div className="hidden lg:block">
            <div className="sticky top-24">{rail}</div>
          </div>

          <div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p
                className="font-mono text-sm text-muted-foreground"
                data-ocid="browse.result_count"
              >
                {isLoading
                  ? "Loading…"
                  : `${visible.length} ${visible.length === 1 ? "idea" : "ideas"}`}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="rounded-full lg:hidden"
                  onClick={() => setMobileFiltersOpen((open) => !open)}
                  data-ocid="browse.filter_toggle"
                >
                  <SlidersHorizontal className="size-4" aria-hidden="true" />
                  Filters
                  {activeCount > 0 ? ` (${activeCount})` : ""}
                </Button>
                <fieldset
                  className="flex items-center gap-1 rounded-full border border-border bg-card p-1"
                  aria-label="Sort ideas"
                >
                  {SORT_OPTIONS.map((option) => {
                    const active = search.sort === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => update({ sort: option.value })}
                        aria-pressed={active}
                        data-ocid={`browse.sort_tab.${option.value}`}
                        className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                          active
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </fieldset>
              </div>
            </div>

            {mobileFiltersOpen ? (
              <div className="mt-5 lg:hidden">{rail}</div>
            ) : null}

            {activeCount > 0 ? (
              <div className="mt-5 flex flex-wrap items-center gap-2">
                {search.q ? (
                  <FilterChip
                    label={`“${search.q}”`}
                    onRemove={() => {
                      setKeyword("");
                      update({ q: "" });
                    }}
                  />
                ) : null}
                {search.fields.map((field) => (
                  <FilterChip
                    key={field}
                    label={field}
                    onRemove={() => toggleField(field)}
                  />
                ))}
                {search.stage ? (
                  <FilterChip
                    label={search.stage}
                    onRemove={() => update({ stage: null })}
                  />
                ) : null}
                {search.min > 0 || search.max < FUNDING_MAX ? (
                  <FilterChip
                    label="Funding range"
                    onRemove={() => update({ min: 0, max: FUNDING_MAX })}
                  />
                ) : null}
              </div>
            ) : null}

            <div className="mt-6">
              {isLoading ? (
                <div
                  className="grid gap-6 sm:grid-cols-2"
                  data-ocid="browse.loading_state"
                >
                  {Array.from({ length: 4 }, (_, i) => `skeleton-${i}`).map(
                    (id) => (
                      <div
                        key={id}
                        className="rounded-lg border border-border bg-card p-5"
                      >
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="mt-4 h-6 w-3/4" />
                        <Skeleton className="mt-3 h-4 w-full" />
                        <Skeleton className="mt-2 h-4 w-5/6" />
                        <Skeleton className="mt-6 h-8 w-32" />
                      </div>
                    ),
                  )}
                </div>
              ) : isError ? (
                <div
                  className="rounded-lg border border-border bg-card p-10 text-center"
                  data-ocid="browse.error_state"
                >
                  <h2 className="font-display text-xl font-semibold text-foreground">
                    Could not load ideas
                  </h2>
                  <p className="mt-2 text-muted-foreground">
                    Something went wrong reaching the marketplace.
                  </p>
                  <Button
                    type="button"
                    onClick={() => void refetch()}
                    className="mt-5 rounded-full"
                    data-ocid="browse.retry_button"
                  >
                    Try again
                  </Button>
                </div>
              ) : visible.length === 0 ? (
                <div
                  className="rounded-lg border border-dashed border-border bg-card p-12 text-center"
                  data-ocid="browse.empty_state"
                >
                  <h2 className="font-display text-xl font-semibold text-foreground">
                    No ideas match these filters
                  </h2>
                  <p className="mx-auto mt-2 max-w-md text-muted-foreground">
                    Try widening the funding range, clearing a field, or
                    searching a different keyword.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={reset}
                    className="mt-5 rounded-full"
                    data-ocid="browse.empty_reset_button"
                  >
                    Clear all filters
                  </Button>
                </div>
              ) : (
                <div className="grid gap-6 sm:grid-cols-2">
                  {visible.map((idea, index) => (
                    <IdeaCard
                      key={idea.id.toString()}
                      idea={idea}
                      index={index}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}

function FilterChip({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-xs font-medium capitalize text-accent">
      {label}
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${label} filter`}
        className="rounded-full p-0.5 transition-colors hover:bg-accent/20"
      >
        <X className="size-3" aria-hidden="true" />
      </button>
    </span>
  );
}
