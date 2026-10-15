import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { FIELD_OPTIONS, STAGE_OPTIONS } from "@/lib/fields";
import { formatFunding } from "@/lib/format";
import type { Field, Stage } from "@/types";
import { RotateCcw } from "lucide-react";

export const FUNDING_MAX = 5_000_000;

interface FilterRailProps {
  fields: Field[];
  stage: Stage | null;
  minFunding: number;
  maxFunding: number;
  onToggleField: (field: Field) => void;
  onStageChange: (stage: Stage | null) => void;
  onFundingChange: (range: [number, number]) => void;
  onReset: () => void;
  activeCount: number;
}

export function FilterRail({
  fields,
  stage,
  minFunding,
  maxFunding,
  onToggleField,
  onStageChange,
  onFundingChange,
  onReset,
  activeCount,
}: FilterRailProps) {
  return (
    <aside
      className="rounded-lg border border-border bg-card p-5 shadow-subtle"
      data-ocid="browse.filter_panel"
      aria-label="Filter ideas"
    >
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold text-foreground">
          Refine
        </h2>
        {activeCount > 0 ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onReset}
            data-ocid="browse.filter_reset_button"
            className="h-7 gap-1.5 px-2 text-xs text-muted-foreground hover:text-accent"
          >
            <RotateCcw className="size-3.5" aria-hidden="true" />
            Reset
          </Button>
        ) : null}
      </div>

      <fieldset className="mt-5">
        <legend className="font-mono text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Field
        </legend>
        <div className="mt-3 space-y-2.5">
          {FIELD_OPTIONS.map((option) => {
            const checked = fields.includes(option.value);
            const id = `field-${option.value}`;
            return (
              <div key={option.value} className="flex items-center gap-2.5">
                <Checkbox
                  id={id}
                  checked={checked}
                  onCheckedChange={() => onToggleField(option.value)}
                  data-ocid={`browse.field_checkbox.${option.value}`}
                />
                <Label
                  htmlFor={id}
                  className="cursor-pointer text-sm font-normal text-foreground"
                >
                  {option.label}
                </Label>
              </div>
            );
          })}
        </div>
      </fieldset>

      <fieldset className="mt-6 border-t border-border pt-5">
        <legend className="font-mono text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Stage
        </legend>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onStageChange(null)}
            data-ocid="browse.stage_tab.all"
            aria-pressed={stage === null}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
              stage === null
                ? "border-accent bg-accent/10 text-accent"
                : "border-border text-muted-foreground hover:border-accent/50 hover:text-foreground"
            }`}
          >
            Any
          </button>
          {STAGE_OPTIONS.map((option) => {
            const active = stage === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => onStageChange(active ? null : option.value)}
                data-ocid={`browse.stage_tab.${option.value}`}
                aria-pressed={active}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                  active
                    ? "border-accent bg-accent/10 text-accent"
                    : "border-border text-muted-foreground hover:border-accent/50 hover:text-foreground"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </fieldset>

      <fieldset className="mt-6 border-t border-border pt-5">
        <legend className="font-mono text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Funding range
        </legend>
        <div className="mt-4 px-1">
          <Slider
            value={[minFunding, maxFunding]}
            min={0}
            max={FUNDING_MAX}
            step={50_000}
            minStepsBetweenThumbs={1}
            onValueChange={(value) =>
              onFundingChange([value[0] ?? 0, value[1] ?? FUNDING_MAX])
            }
            data-ocid="browse.funding_slider"
            aria-label="Funding range"
          />
        </div>
        <div className="mt-3 flex items-center justify-between font-mono text-xs tabular text-muted-foreground">
          <span>{formatFunding(BigInt(minFunding))}</span>
          <span>
            {maxFunding >= FUNDING_MAX
              ? `${formatFunding(BigInt(FUNDING_MAX))}+`
              : formatFunding(BigInt(maxFunding))}
          </span>
        </div>
      </fieldset>
    </aside>
  );
}
