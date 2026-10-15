import type {
  AccountRole,
  Field,
  Idea,
  IdeaDocument,
  IdeaFilter,
  IdeaInput,
  IdeaSort,
  IdeaStatus,
  Interest,
  Stage,
  UserProfile,
} from "@/backend";

export type {
  AccountRole,
  Field,
  Idea,
  IdeaDocument,
  IdeaFilter,
  IdeaInput,
  IdeaSort,
  IdeaStatus,
  Interest,
  Stage,
  UserProfile,
};

/** A profile is "complete" once the user has chosen at least one account role. */
export function hasRole(
  profile: UserProfile | null | undefined,
  role: AccountRole,
): boolean {
  return !!profile && profile.roles.includes(role);
}

export function isSeller(profile: UserProfile | null | undefined): boolean {
  return hasRole(profile, "seller" as AccountRole);
}

export function isBuyer(profile: UserProfile | null | undefined): boolean {
  return hasRole(profile, "buyer" as AccountRole);
}
