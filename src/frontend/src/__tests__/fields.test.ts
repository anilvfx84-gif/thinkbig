import { Field, IdeaSort, IdeaStatus, Stage } from "@/backend";
import {
  FIELD_OPTIONS,
  SORT_OPTIONS,
  fieldLabel,
  sortLabel,
  stageLabel,
  statusLabel,
} from "@/lib/fields";
import { describe, expect, it } from "vitest";

describe("field catalogue", () => {
  it("exposes exactly the fixed field list from the requirements", () => {
    expect(FIELD_OPTIONS.map((option) => option.value)).toEqual([
      Field.business,
      Field.agriculture,
      Field.medicine,
      Field.mechanicalEngineering,
      Field.bio,
      Field.technology,
      Field.education,
      Field.energy,
      Field.other,
    ]);
  });

  it("labels every field with a human-readable name", () => {
    expect(fieldLabel(Field.agriculture)).toBe("Agriculture");
    expect(fieldLabel(Field.mechanicalEngineering)).toBe(
      "Mechanical Engineering",
    );
    expect(fieldLabel(Field.other)).toBe("Other");
  });

  it("falls back to Uncategorized for a missing field", () => {
    expect(fieldLabel(null)).toBe("Uncategorized");
    expect(fieldLabel(undefined)).toBe("Uncategorized");
  });

  it("labels the three stages and the two statuses", () => {
    expect(stageLabel(Stage.concept)).toBe("Concept");
    expect(stageLabel(Stage.prototype)).toBe("Prototype");
    expect(stageLabel(Stage.readyToLaunch)).toBe("Ready to Launch");
    expect(statusLabel(IdeaStatus.draft)).toBe("Draft");
    expect(statusLabel(IdeaStatus.published)).toBe("Published");
  });

  it("offers newest and most-viewed sort options", () => {
    expect(SORT_OPTIONS.map((option) => option.value)).toEqual([
      IdeaSort.newest,
      IdeaSort.mostViewed,
    ]);
    expect(sortLabel(IdeaSort.mostViewed)).toBe("Most viewed");
    expect(sortLabel(IdeaSort.newest)).toBe("Newest");
  });
});
