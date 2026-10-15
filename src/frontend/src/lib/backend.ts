import { createActor } from "@/backend";
import { useActor } from "@caffeineai/core-infrastructure";

/**
 * Shared accessor for the backend actor. Call at the top level of a hook —
 * never inside a query or mutation callback.
 */
export function useBackendActor() {
  return useActor(createActor);
}
