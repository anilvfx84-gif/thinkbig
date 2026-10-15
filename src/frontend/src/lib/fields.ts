import { Field, IdeaSort, IdeaStatus, Stage } from "@/backend";

export interface FieldOption {
  value: Field;
  label: string;
  blurb: string;
}

/** Fixed field/category list, in editorial order. */
export const FIELD_OPTIONS: FieldOption[] = [
  {
    value: Field.business,
    label: "Business",
    blurb: "Ventures, markets, and operations",
  },
  {
    value: Field.agriculture,
    label: "Agriculture",
    blurb: "Farming, food systems, and land",
  },
  {
    value: Field.medicine,
    label: "Medicine",
    blurb: "Care, devices, and health science",
  },
  {
    value: Field.mechanicalEngineering,
    label: "Mechanical Engineering",
    blurb: "Machines, robotics, and manufacturing",
  },
  {
    value: Field.bio,
    label: "Bio",
    blurb: "Biotech, biology, and life science",
  },
  {
    value: Field.technology,
    label: "Technology",
    blurb: "Software, hardware, and networks",
  },
  {
    value: Field.education,
    label: "Education",
    blurb: "Learning, training, and schools",
  },
  {
    value: Field.energy,
    label: "Energy",
    blurb: "Power, storage, and sustainability",
  },
  {
    value: Field.other,
    label: "Other",
    blurb: "Everything else worth building",
  },
];

export const FIELD_LABELS: Record<Field, string> = FIELD_OPTIONS.reduce(
  (acc, option) => {
    acc[option.value] = option.label;
    return acc;
  },
  {} as Record<Field, string>,
);

export function fieldLabel(field: Field | null | undefined): string {
  if (!field) return "Uncategorized";
  return FIELD_LABELS[field] ?? "Other";
}

export interface StageOption {
  value: Stage;
  label: string;
  description: string;
}

export const STAGE_OPTIONS: StageOption[] = [
  {
    value: Stage.concept,
    label: "Concept",
    description: "An idea taking shape",
  },
  {
    value: Stage.prototype,
    label: "Prototype",
    description: "Built and being tested",
  },
  {
    value: Stage.readyToLaunch,
    label: "Ready to Launch",
    description: "Prepared to scale",
  },
];

export const STAGE_LABELS: Record<Stage, string> = STAGE_OPTIONS.reduce(
  (acc, option) => {
    acc[option.value] = option.label;
    return acc;
  },
  {} as Record<Stage, string>,
);

export function stageLabel(stage: Stage | null | undefined): string {
  if (!stage) return "Concept";
  return STAGE_LABELS[stage] ?? "Concept";
}

export const STATUS_LABELS: Record<IdeaStatus, string> = {
  [IdeaStatus.draft]: "Draft",
  [IdeaStatus.published]: "Published",
};

export function statusLabel(status: IdeaStatus | null | undefined): string {
  if (!status) return "Draft";
  return STATUS_LABELS[status] ?? "Draft";
}

export const SORT_OPTIONS: { value: IdeaSort; label: string }[] = [
  { value: IdeaSort.newest, label: "Newest" },
  { value: IdeaSort.mostViewed, label: "Most viewed" },
];

export function sortLabel(sort: IdeaSort | null | undefined): string {
  if (sort === IdeaSort.mostViewed) return "Most viewed";
  return "Newest";
}
