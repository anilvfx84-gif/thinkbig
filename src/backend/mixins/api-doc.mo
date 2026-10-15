/// Static, human- and agent-readable documentation of the public backend API.
/// This mixin declares only `getApiDoc`; it reads no actor state.
mixin () {
  public query func getApiDoc() : async Text {
    "# Idea Marketplace Backend API\n\n" #
    "## Purpose\n\n" #
    "This canister backs a two-sided idea marketplace. **Idea Sellers** register a profile, " #
    "publish ideas (each assigned to one field/category), attach a business plan and supporting " #
    "documents/images, and set an optional funding target, stage, and location. **Idea Buyers** " #
    "browse published ideas, filter and search them, open a full detail view, and express interest " #
    "in an idea, which records the buyer against that idea and increments its interest count. " #
    "Sellers can then list the buyers interested in each of their ideas.\n\n" #
    "## Authentication\n\n" #
    "All state-changing methods and all per-user reads require a signed (non-anonymous) caller. " #
    "The caller principal is taken from the Internet Computer message, never from a parameter. " #
    "The app's frontend pins an Internet Identity derivation origin, published at " #
    "`/.well-known/ii-derivation-origin` when available; an agent already holding the user's " #
    "Internet Identity authorization derives the correct per-app principal against that origin " #
    "(for example `icp identity link web <name> --app <host>`). Such a delegation acts with the " #
    "user's full authority in this app until it expires.\n\n" #
    "## Authorization and registration\n\n" #
    "Authorization is role-based and managed by the authorization mixin. A caller must be " #
    "registered before any role-guarded method succeeds. Registration happens only when a caller " #
    "signs in through the app's own frontend; a principal that never did so is unregistered even " #
    "when it belongs to the app's owner, and a signed-in caller derived against a different origin " #
    "is a different principal than the one the frontend registered. A direct API caller registers " #
    "by calling `_initialize_access_control` once as a signed-in caller before any role-guarded " #
    "call, including guarded queries. The first initializer receives the admin role; subsequent " #
    "callers receive the user role. An unregistered or anonymous caller receives the trap " #
    "`Unauthorized: Only users can perform this action` on guarded endpoints.\n\n" #
    "Guarded methods (require the `user` role): `getCallerProfile`, `saveCallerProfile`, " #
    "`addCallerRole`, `createIdea`, `updateIdea`, `publishIdea`, `unpublishIdea`, `deleteIdea`, " #
    "`listMyIdeas`, `expressInterest`, `listInterestsForIdea`, `listMyInterests`.\n\n" #
    "Unguarded methods (any caller, including anonymous): `getProfile`, `getIdea`, " #
    "`listPublishedIdeas`, `recordIdeaView`, `getApiDoc`.\n\n" #
    "Ownership rules: `updateIdea`, `publishIdea`, `unpublishIdea`, and `deleteIdea` only affect " #
    "an idea owned by the caller; a non-owner receives `null` (or `false` for `deleteIdea`) and " #
    "the idea is left unchanged. `listInterestsForIdea` traps with " #
    "`Unauthorized: Only the idea owner can view its interests` unless the caller owns the idea.\n\n" #
    "## Units and encodings\n\n" #
    "- `Timestamp` is `Int`, nanoseconds since the Unix epoch (IC `Time.now()`).\n" #
    "- `UserId` is a `Principal`; `IdeaId`, `InterestId`, and `DocumentId` are `Nat`.\n" #
    "- `fundingTarget` is `?Nat`; `null` means no target was set.\n" #
    "- `field` is one of `#business`, `#agriculture`, `#medicine`, `#mechanicalEngineering`, " #
    "`#bio`, `#technology`, `#education`, `#energy`, `#other`.\n" #
    "- `stage` is one of `#concept`, `#prototype`, `#readyToLaunch`.\n" #
    "- `status` is `#draft` or `#published`.\n" #
    "- `roles` is a list of `#seller` / `#buyer`; a user may hold both.\n" #
    "- `documents` and `images` are lists of `IdeaDocument` records (`id`, `name`, `url`, " #
    "`contentType`, `uploadedAt`); `url` is an external URL string.\n\n" #
    "## Lifecycle and polling\n\n" #
    "An idea is created with an explicit `status` (`#draft` or `#published`). Only `#published` " #
    "ideas appear in `listPublishedIdeas` and can receive interest. `publishIdea` and " #
    "`unpublishIdea` transition status; `deleteIdea` removes the idea permanently. " #
    "`recordIdeaView` increments `viewCount` and `expressInterest` increments `interestCount`; " #
    "both are update calls, so a client that wants a fresh count must re-read the idea after the " #
    "call resolves. There is no server-side push or subscription: poll `getIdea`, " #
    "`listPublishedIdeas`, `listMyIdeas`, or `listMyInterests` to observe changes.\n\n" #
    "## Mutation retry safety\n\n" #
    "`createIdea` and `expressInterest` are not idempotent: each successful call allocates a new " #
    "id and appends a new record, so retrying after an ambiguous failure can create duplicates. " #
    "`expressInterest` additionally traps with " #
    "`You have already expressed interest in this idea` when the same buyer already has an " #
    "interest on that idea, which makes a retry of an already-applied call fail rather than " #
    "duplicate. `saveCallerProfile`, `addCallerRole`, `updateIdea`, `publishIdea`, " #
    "`unpublishIdea`, and `deleteIdea` are idempotent in effect: repeating them converges to the " #
    "same state. `recordIdeaView` is not idempotent by design (each call counts as a view).\n\n" #
    "## Errors and traps\n\n" #
    "Failures are reported as traps (rejected calls), not as `Result` values:\n" #
    "- `Unauthorized: Only users can perform this action` - caller is unregistered or anonymous.\n" #
    "- `Unauthorized: Only the idea owner can view its interests` - non-owner calling " #
    "`listInterestsForIdea`.\n" #
    "- `Idea not found` - `expressInterest` or `listInterestsForIdea` on an unknown idea id.\n" #
    "- `Idea is not published` - `expressInterest` on a draft idea.\n" #
    "- `You have already expressed interest in this idea` - duplicate interest by the same buyer.\n\n" #
    "Methods that return `?Idea` or `?UserProfile` use `null` for a missing record rather than " #
    "trapping. `updateIdea`, `publishIdea`, `unpublishIdea`, and `recordIdeaView` return `null` " #
    "when the idea does not exist or is not owned by the caller.\n\n" #
    "## Non-obvious gotchas\n\n" #
    "- `getProfile` is unguarded and returns any user's public profile, including their contact " #
    "email; treat contact details as shared with the other side of the marketplace.\n" #
    "- `listPublishedIdeas` applies its filter in memory and always excludes non-published ideas, " #
    "regardless of the filter argument.\n" #
    "- `listMyIdeas` returns the caller's ideas in every status, including drafts.\n" #
    "- `recordIdeaView` accepts any caller and does not require the idea to be published.\n" #
    "- `getApiDoc` is a static document and does not reflect runtime state.\n";
  };
};
