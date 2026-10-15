# Project Guidance

## User Preferences

- Two distinct account types: Idea Seller and Idea Buyer
- Ideas are organized by field/category (business, agriculture, medicine, mechanical engineering, bio, and all kinds of fields)
- Sellers publish ideas; buyers choose ideas and contact sellers to invest or form a business group

## Verified Commands

- **typecheck**: `pnpm typecheck`
- **fix**: `pnpm fix`
- **build**: `pnpm build`

## Learnings

- With [canisters.backend.migrations] check-limit=1, a fresh project must have exactly one pending migration; fold the initial 00000000_000000.mo into the later timestamped migration (OldActor={}) and delete the initial file.
- OQL manual-mode entities over Map<K,V> use map.toEntityManual(name, typeName, primaryKey) with .payload(...) per column; Option and variant fields cannot auto-derive and must be converted to primitive sentinels in .payload.
- A getApiDoc mixin must be a top-level mixin () { ... } with only the query function; returning the Markdown literal directly avoids the stable-state trap of a top-level let.
- TanStack Router 1.131 code-based routing: createRootRoute + createRoute + addChildren + createRouter; routes here declare no validateSearch, so parse location.search manually for URL-reflected filter state.
- useActor(createActor) from @caffeineai/core-infrastructure returns { actor, isFetching }; gate queries with enabled: !!actor && !isFetching.
- Backend enums (Field, Stage, IdeaStatus, AccountRole, IdeaSort) are runtime values — import them as values from @/backend, never import type; test fixtures must use AccountRole.seller / AccountRole.buyer, not string literals.
- Motoko timestamps are nanosecond bigints; divide by 1_000_000n before new Date().
- Vitest + jsdom tests need the @testing-library/jest-dom matcher types in the type-check scope (ambient declaration or setup file), or pnpm typecheck fails on toBeInTheDocument/toBeChecked/toHaveAttribute.
- Backend IdeaFilter.field is a single optional Field, so multi-field selection must be filtered client-side after the server query.
- Local preflight cannot complete Internet Identity sign-in (the II canister call is blocked at the browser boundary), so authenticated flows are not verifiable in local testing.
