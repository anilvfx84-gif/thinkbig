import type { Interest } from "@/backend";
import { useBackendActor } from "@/lib/backend";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const interestKeys = {
  forIdea: (id: string) => ["interests", "idea", id] as const,
  mine: ["interests", "mine"] as const,
};

/** Buyers who have expressed interest in a given idea (seller view). */
export function useInterestsForIdea(ideaId: string | null | undefined) {
  const { actor, isFetching } = useBackendActor();

  return useQuery<Interest[]>({
    queryKey: interestKeys.forIdea(ideaId ?? "unknown"),
    queryFn: async () => {
      if (!actor || !ideaId) return [];
      return actor.listInterestsForIdea(BigInt(ideaId));
    },
    enabled: !!actor && !isFetching && !!ideaId,
  });
}

/** Ideas the signed-in buyer has expressed interest in. */
export function useMyInterests() {
  const { actor, isFetching } = useBackendActor();

  return useQuery<Interest[]>({
    queryKey: interestKeys.mine,
    queryFn: async () => {
      if (!actor) return [];
      return actor.listMyInterests();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useExpressInterest() {
  const { actor } = useBackendActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: { ideaId: bigint; message: string }) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.expressInterest(input.ideaId, input.message);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["interests"] });
      void queryClient.invalidateQueries({ queryKey: ["ideas"] });
      void queryClient.invalidateQueries({ queryKey: ["idea"] });
    },
  });
}
