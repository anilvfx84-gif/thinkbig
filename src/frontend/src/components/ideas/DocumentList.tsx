import { formatDate } from "@/lib/format";
import type { IdeaDocument } from "@/types";
import { FileText } from "lucide-react";

interface DocumentListProps {
  documents: IdeaDocument[];
  emptyLabel?: string;
}

export function DocumentList({
  documents,
  emptyLabel = "No documents attached yet.",
}: DocumentListProps) {
  if (documents.length === 0) {
    return (
      <p
        className="text-sm text-muted-foreground"
        data-ocid="idea.documents_empty_state"
      >
        {emptyLabel}
      </p>
    );
  }

  return (
    <ul className="space-y-2" data-ocid="idea.documents_list">
      {documents.map((document, index) => (
        <li key={document.id.toString()}>
          <a
            href={document.url}
            target="_blank"
            rel="noreferrer"
            data-ocid={`idea.document_item.${index + 1}`}
            className="group flex items-center gap-3 rounded-md border border-border bg-card px-4 py-3 transition-smooth hover:border-accent/50 hover:shadow-subtle"
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground transition-colors group-hover:text-accent">
              <FileText className="size-4" aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium text-foreground">
                {document.name || "Untitled document"}
              </span>
              <span className="block font-mono text-xs text-muted-foreground">
                {document.contentType || "file"} ·{" "}
                {formatDate(document.uploadedAt)}
              </span>
            </span>
          </a>
        </li>
      ))}
    </ul>
  );
}
