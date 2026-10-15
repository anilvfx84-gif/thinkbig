import {
  Field as FieldEnum,
  IdeaStatus as IdeaStatusEnum,
  Stage as StageEnum,
} from "@/backend";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCreateIdea, useIdea, useUpdateIdea } from "@/hooks/useIdeas";
import { FIELD_OPTIONS, STAGE_OPTIONS } from "@/lib/fields";
import type {
  Field,
  IdeaDocument,
  IdeaInput,
  IdeaStatus,
  Stage,
} from "@/types";
import { useNavigate, useParams } from "@tanstack/react-router";
import { FileText, Image as ImageIcon, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

interface DocDraft {
  key: string;
  name: string;
  url: string;
  contentType: string;
}

interface FormState {
  title: string;
  summary: string;
  description: string;
  field: Field;
  businessPlan: string;
  fundingTarget: string;
  stage: Stage;
  location: string;
  documents: DocDraft[];
  images: DocDraft[];
}

const EMPTY_FORM: FormState = {
  title: "",
  summary: "",
  description: "",
  field: FieldEnum.business,
  businessPlan: "",
  fundingTarget: "",
  stage: StageEnum.concept,
  location: "",
  documents: [],
  images: [],
};

let draftCounter = 0;
function newDraftKey(): string {
  draftCounter += 1;
  return `draft-${draftCounter}`;
}

function toDocDrafts(docs: IdeaDocument[]): DocDraft[] {
  return docs.map((doc) => ({
    key: newDraftKey(),
    name: doc.name,
    url: doc.url,
    contentType: doc.contentType,
  }));
}

function toIdeaDocuments(drafts: DocDraft[]): IdeaDocument[] {
  return drafts
    .filter((draft) => draft.url.trim() !== "")
    .map((draft) => ({
      id: 0n,
      name: draft.name.trim() || "Untitled",
      url: draft.url.trim(),
      contentType: draft.contentType.trim() || "application/octet-stream",
      uploadedAt: 0n,
    }));
}

export function IdeaEditorPage() {
  const params = useParams({ strict: false }) as { id?: string };
  const editingId = params.id;
  const isEditing = !!editingId;
  const navigate = useNavigate();

  const { data: existing, isLoading } = useIdea(editingId);
  const createIdea = useCreateIdea();
  const updateIdea = useUpdateIdea();

  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isEditing || !existing || initialized) return;
    setForm({
      title: existing.title,
      summary: existing.summary,
      description: existing.description,
      field: existing.field,
      businessPlan: existing.businessPlan,
      fundingTarget:
        existing.fundingTarget !== undefined
          ? existing.fundingTarget.toString()
          : "",
      stage: existing.stage,
      location: existing.location,
      documents: toDocDrafts(existing.documents),
      images: toDocDrafts(existing.images),
    });
    setInitialized(true);
  }, [isEditing, existing, initialized]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((current) => ({ ...current, [key]: value }));

  const buildInput = (): IdeaInput | null => {
    if (form.title.trim() === "") {
      setError("Give your idea a title.");
      return null;
    }
    if (form.summary.trim() === "") {
      setError("Add a short summary so buyers know what this is.");
      return null;
    }
    const funding =
      form.fundingTarget.trim() === ""
        ? undefined
        : BigInt(Math.max(0, Math.floor(Number(form.fundingTarget))));
    if (funding !== undefined && Number.isNaN(Number(form.fundingTarget))) {
      setError("Funding target must be a number.");
      return null;
    }
    setError(null);
    return {
      title: form.title.trim(),
      summary: form.summary.trim(),
      description: form.description.trim(),
      field: form.field,
      businessPlan: form.businessPlan.trim(),
      fundingTarget: funding,
      stage: form.stage,
      location: form.location.trim(),
      documents: toIdeaDocuments(form.documents),
      images: toIdeaDocuments(form.images),
    };
  };

  const submit = (status: IdeaStatus) => {
    const input = buildInput();
    if (!input) return;
    if (isEditing && editingId) {
      updateIdea.mutate(
        { id: BigInt(editingId), idea: input },
        { onSuccess: () => void navigate({ to: "/dashboard" }) },
      );
    } else {
      createIdea.mutate(
        { idea: input, status },
        { onSuccess: () => void navigate({ to: "/dashboard" }) },
      );
    }
  };

  const pending = createIdea.isPending || updateIdea.isPending;

  if (isEditing && isLoading) {
    return (
      <Layout>
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
          <p className="text-muted-foreground">Loading your idea…</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="border-b border-border bg-muted/40">
        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 md:py-16">
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.24em] text-accent">
            {isEditing ? "Edit idea" : "New idea"}
          </p>
          <h1 className="mt-4 font-display text-4xl font-bold tracking-tight text-foreground md:text-5xl">
            {isEditing ? "Refine your venture" : "Put your idea on the table"}
          </h1>
          <div className="mt-5 h-px w-32 origin-left animate-rule-grow bg-accent" />
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-10 sm:px-6 md:py-14">
        <form
          className="space-y-8"
          onSubmit={(event) => {
            event.preventDefault();
            submit(IdeaStatusEnum.published);
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="idea-title">Title</Label>
            <Input
              id="idea-title"
              value={form.title}
              onChange={(event) => set("title", event.target.value)}
              placeholder="A solar micro-grid for rural clinics"
              data-ocid="editor.title_input"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="idea-summary">Summary</Label>
            <Textarea
              id="idea-summary"
              value={form.summary}
              onChange={(event) => set("summary", event.target.value)}
              placeholder="One or two sentences that capture the opportunity."
              rows={3}
              data-ocid="editor.summary_textarea"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="idea-description">Full description</Label>
            <Textarea
              id="idea-description"
              value={form.description}
              onChange={(event) => set("description", event.target.value)}
              placeholder="Describe the problem, your solution, and why now."
              rows={6}
              data-ocid="editor.description_textarea"
            />
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="idea-field">Field</Label>
              <Select
                value={form.field}
                onValueChange={(value) => set("field", value as Field)}
              >
                <SelectTrigger
                  id="idea-field"
                  className="w-full"
                  data-ocid="editor.field_select"
                >
                  <SelectValue placeholder="Choose a field" />
                </SelectTrigger>
                <SelectContent>
                  {FIELD_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="idea-stage">Stage</Label>
              <Select
                value={form.stage}
                onValueChange={(value) => set("stage", value as Stage)}
              >
                <SelectTrigger
                  id="idea-stage"
                  className="w-full"
                  data-ocid="editor.stage_select"
                >
                  <SelectValue placeholder="Choose a stage" />
                </SelectTrigger>
                <SelectContent>
                  {STAGE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="idea-funding">Funding target (USD)</Label>
              <Input
                id="idea-funding"
                type="number"
                min={0}
                inputMode="numeric"
                value={form.fundingTarget}
                onChange={(event) => set("fundingTarget", event.target.value)}
                placeholder="250000"
                data-ocid="editor.funding_input"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="idea-location">Location</Label>
              <Input
                id="idea-location"
                value={form.location}
                onChange={(event) => set("location", event.target.value)}
                placeholder="Nairobi, Kenya"
                data-ocid="editor.location_input"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="idea-plan">Business plan</Label>
            <Textarea
              id="idea-plan"
              value={form.businessPlan}
              onChange={(event) => set("businessPlan", event.target.value)}
              placeholder="Market, model, traction, team, and the ask."
              rows={10}
              data-ocid="editor.business_plan_textarea"
            />
          </div>

          <DocEditor
            title="Supporting documents"
            description="Add links to decks, spreadsheets, or research."
            icon="document"
            drafts={form.documents}
            onChange={(documents) => set("documents", documents)}
            ocidPrefix="editor.document"
          />

          <DocEditor
            title="Images"
            description="Add image URLs to illustrate the idea."
            icon="image"
            drafts={form.images}
            onChange={(images) => set("images", images)}
            ocidPrefix="editor.image"
          />

          {error ? (
            <p
              className="text-sm text-destructive"
              data-ocid="editor.error_state"
            >
              {error}
            </p>
          ) : null}

          <div className="flex flex-wrap items-center gap-3 border-t border-border pt-6">
            <Button
              type="submit"
              size="lg"
              className="rounded-full"
              disabled={pending}
              data-ocid="editor.publish_button"
            >
              {pending
                ? "Saving…"
                : isEditing
                  ? "Save changes"
                  : "Publish idea"}
            </Button>
            {!isEditing ? (
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="rounded-full"
                disabled={pending}
                onClick={() => submit(IdeaStatusEnum.draft)}
                data-ocid="editor.save_draft_button"
              >
                Save as draft
              </Button>
            ) : null}
            <Button
              type="button"
              variant="ghost"
              size="lg"
              className="rounded-full"
              onClick={() => void navigate({ to: "/dashboard" })}
              data-ocid="editor.cancel_button"
            >
              Cancel
            </Button>
          </div>
        </form>
      </section>
    </Layout>
  );
}

interface DocEditorProps {
  title: string;
  description: string;
  icon: "document" | "image";
  drafts: DocDraft[];
  onChange: (drafts: DocDraft[]) => void;
  ocidPrefix: string;
}

function DocEditor({
  title,
  description,
  icon,
  drafts,
  onChange,
  ocidPrefix,
}: DocEditorProps) {
  const Icon = icon === "image" ? ImageIcon : FileText;

  const add = () =>
    onChange([
      ...drafts,
      { key: newDraftKey(), name: "", url: "", contentType: "" },
    ]);

  const update = (key: string, patch: Partial<DocDraft>) =>
    onChange(
      drafts.map((draft) =>
        draft.key === key ? { ...draft, ...patch } : draft,
      ),
    );

  const remove = (key: string) =>
    onChange(drafts.filter((draft) => draft.key !== key));

  return (
    <fieldset className="rounded-lg border border-border bg-card p-6">
      <legend className="flex items-center gap-2 px-1 font-display text-lg font-semibold text-foreground">
        <Icon className="size-4 text-accent" aria-hidden="true" />
        {title}
      </legend>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>

      <div className="mt-4 space-y-3">
        {drafts.map((draft, index) => (
          <div
            key={draft.key}
            className="grid gap-2 rounded-md border border-border bg-background p-3 sm:grid-cols-[1fr_1.4fr_auto]"
          >
            <Input
              value={draft.name}
              onChange={(event) =>
                update(draft.key, { name: event.target.value })
              }
              placeholder="Name"
              aria-label={`${title} name ${index + 1}`}
              data-ocid={`${ocidPrefix}_name_input.${index + 1}`}
            />
            <Input
              value={draft.url}
              onChange={(event) =>
                update(draft.key, { url: event.target.value })
              }
              placeholder="https://…"
              aria-label={`${title} URL ${index + 1}`}
              data-ocid={`${ocidPrefix}_url_input.${index + 1}`}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={() => remove(draft.key)}
              aria-label={`Remove ${title} entry ${index + 1}`}
              data-ocid={`${ocidPrefix}_remove_button.${index + 1}`}
            >
              <Trash2 className="size-4" aria-hidden="true" />
            </Button>
          </div>
        ))}
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        className="mt-4 rounded-full"
        onClick={add}
        data-ocid={`${ocidPrefix}_add_button`}
      >
        <Plus className="size-4" aria-hidden="true" />
        Add {icon === "image" ? "image" : "document"}
      </Button>
    </fieldset>
  );
}
