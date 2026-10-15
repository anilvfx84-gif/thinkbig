import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useExpressInterest } from "@/hooks/useInterests";
import { useState } from "react";

interface InterestDialogProps {
  ideaId: bigint;
  ideaTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InterestDialog({
  ideaId,
  ideaTitle,
  open,
  onOpenChange,
}: InterestDialogProps) {
  const [message, setMessage] = useState("");
  const expressInterest = useExpressInterest();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const captured = message.trim();
    if (!captured) return;
    setMessage("");
    expressInterest.mutate(
      { ideaId, message: captured },
      {
        onSuccess: () => onOpenChange(false),
        onError: () =>
          setMessage((current) => (current === "" ? captured : current)),
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent data-ocid="interest.dialog">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            Express interest
          </DialogTitle>
          <DialogDescription>
            Tell the seller why you want to invest in or build “{ideaTitle}”.
            They will see your profile and this message.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="interest-message">Your message</Label>
            <Textarea
              id="interest-message"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="What draws you to this idea, and how would you like to be involved?"
              rows={5}
              required
              data-ocid="interest.message_textarea"
            />
          </div>

          {expressInterest.isError ? (
            <p
              className="text-sm text-destructive"
              data-ocid="interest.error_state"
            >
              Could not send your interest. Please try again.
            </p>
          ) : null}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              data-ocid="interest.cancel_button"
              className="rounded-full"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={expressInterest.isPending || message.trim() === ""}
              data-ocid="interest.submit_button"
              className="rounded-full"
            >
              {expressInterest.isPending ? "Sending…" : "Send interest"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
