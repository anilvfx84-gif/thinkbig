import type { AccountRole, UserProfile } from "@/backend";
import { useBackendActor } from "@/lib/backend";
import { Principal } from "@icp-sdk/core/principal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const profileKeys = {
  caller: ["callerProfile"] as const,
  byId: (id: string) => ["profile", id] as const,
};

/**
 * Reads the signed-in user's profile. `isFetched` is only true once the actor
 * is ready and the query has settled, so callers can distinguish "no profile
 * yet" from "still loading".
 */
export function useCallerProfile() {
  const { actor, isFetching: actorFetching } = useBackendActor();

  const query = useQuery<UserProfile | null>({
    queryKey: profileKeys.caller,
    queryFn: async () => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.getCallerProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

/** Reads any user's public profile by principal string. */
export function useProfile(userId: string | null | undefined) {
  const { actor, isFetching } = useBackendActor();

  return useQuery<UserProfile | null>({
    queryKey: profileKeys.byId(userId ?? "unknown"),
    queryFn: async () => {
      if (!actor || !userId) return null;
      return actor.getProfile(Principal.fromText(userId));
    },
    enabled: !!actor && !isFetching && !!userId,
  });
}

/**
 * Creates or updates the caller's profile. Used both for first-time role
 * selection and for editing profile settings.
 */
export function useSaveProfile() {
  const { actor } = useBackendActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      displayName: string;
      bio: string;
      contactEmail: string;
      roles: AccountRole[];
    }) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.saveCallerProfile(
        input.displayName,
        input.bio,
        input.contactEmail,
        input.roles,
      );
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: profileKeys.caller });
    },
  });
}

/** Adds a role to the caller's profile without replacing existing roles. */
export function useAddRole() {
  const { actor } = useBackendActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (role: AccountRole) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.addCallerRole(role);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: profileKeys.caller });
    },
  });
}
