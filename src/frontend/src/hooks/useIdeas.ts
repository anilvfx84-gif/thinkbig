import type { Idea, IdeaFilter, IdeaInput, IdeaStatus } from "@/backend";
import { useBackendActor } from "@/lib/backend";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const ideaKeys = {
  published: (filter: IdeaFilter) => ["ideas", "published", filter] as const,
  detail: (id: string) => ["idea", id] as const,
  mine: ["ideas", "mine"] as const,
};

/** Published ideas for the buyer feed, filtered and sorted server-side. */
export function usePublishedIdeas(filter: IdeaFilter) {
  const { actor, isFetching } = useBackendActor();

  return useQuery<Idea[]>({
    queryKey: ideaKeys.published(filter),
    queryFn: async () => {
      if (!actor) return [];
      return actor.listPublishedIdeas(filter);
    },
    enabled: !!actor && !isFetching,
  });
}

/** A single idea by id. */
export function useIdea(id: string | null | undefined) {
  const { actor, isFetching } = useBackendActor();

  return useQuery<Idea | null>({
    queryKey: ideaKeys.detail(id ?? "unknown"),
    queryFn: async () => {
      if (!actor || !id) return null;
      return actor.getIdea(BigInt(id));
    },
    enabled: !!actor && !isFetching && !!id,
  });
}

/** The signed-in seller's own ideas, drafts included. */
export function useMyIdeas() {
  const { actor, isFetching } = useBackendActor();

  return useQuery<Idea[]>({
    queryKey: ideaKeys.mine,
    queryFn: async () => {
      if (!actor) return [];
      return actor.listMyIdeas();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateIdea() {
  const { actor } = useBackendActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: { idea: IdeaInput; status: IdeaStatus }) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.createIdea(input.idea, input.status);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["ideas"] });
    },
  });
}

export function useUpdateIdea() {
  const { actor } = useBackendActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: { id: bigint; idea: IdeaInput }) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.updateIdea(input.id, input.idea);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["ideas"] });
      void queryClient.invalidateQueries({ queryKey: ["idea"] });
    },
  });
}

export function usePublishIdea() {
  const { actor } = useBackendActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.publishIdea(id);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["ideas"] });
      void queryClient.invalidateQueries({ queryKey: ["idea"] });
    },
  });
}

export function useUnpublishIdea() {
  const { actor } = useBackendActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.unpublishIdea(id);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["ideas"] });
      void queryClient.invalidateQueries({ queryKey: ["idea"] });
    },
  });
}

export function useDeleteIdea() {
  const { actor } = useBackendActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.deleteIdea(id);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["ideas"] });
    },
  });
}

/** Records a view on an idea. Fire-and-forget from the detail page. */
export function useRecordIdeaView() {
  const { actor } = useBackendActor();

  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.recordIdeaView(id);
    },
  });
}
