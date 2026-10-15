import { PocketIc } from "@dfinity/pic";
import type { Actor, CanisterFixture } from "@dfinity/pic";
import { Principal } from "@icp-sdk/core/principal";
import { afterAll, beforeAll, expect, it } from "vitest";

import { idlFactory } from "../../src/frontend/src/declarations/backend.did.js";
import type { _SERVICE } from "../../src/frontend/src/declarations/backend.did";

const PIC_URL = process.env.POCKET_IC_URL ?? "";
const BACKEND_WASM = process.env.BACKEND_WASM ?? "";
// Set only on a converted project: the last pre-EM revision, whose schema this
// app's migration chain replays from. Installing the current wasm onto an empty
// canister there traps IC0503 before any test runs.
const BASELINE_WASM = process.env.BACKEND_WASM_BASELINE;

/**
 * A deterministic, non-anonymous caller. The backend rejects anonymous callers
 * on every guarded method, and a caller must register once via
 * `_initialize_access_control` before any role-guarded call succeeds.
 *
 * `2vxsx-fae` is `Principal.anonymous()` and is rejected, so the caller is a
 * self-authenticating principal derived from a fixed 32-byte key instead.
 */
const CALLER = Principal.selfAuthenticating(new Uint8Array(32).fill(7));

let pic: PocketIc | undefined;
let actor: Actor<_SERVICE>;
let canisterId: CanisterFixture<_SERVICE>["canisterId"];

beforeAll(async () => {
  pic = await PocketIc.create(PIC_URL);
  if (BASELINE_WASM === undefined) {
    ({ actor, canisterId } = await pic.setupCanister<_SERVICE>({
      idlFactory,
      wasm: BACKEND_WASM,
    }));
  } else {
    // `[baseline, current]`, the same install contract the hosted deploy uses for
    // a converted project. The upgrade replays the chain from the legacy schema.
    const installed = await pic.setupCanister<_SERVICE>({
      idlFactory,
      wasm: BASELINE_WASM,
    });
    await pic.upgradeCanister({
      canisterId: installed.canisterId,
      wasm: BACKEND_WASM,
      arg: new Uint8Array(),
    });
    ({ actor, canisterId } = installed);
  }
  // Register the caller so guarded methods are authorized. The first
  // initializer receives the admin role; the app's own frontend does this on
  // first sign-in, and a direct API caller must do it explicitly.
  actor.setPrincipal(CALLER);
  await actor._initialize_access_control();
});

afterAll(async () => {
  // `?.` because `beforeAll` may not have got that far. A failed
  // `PocketIc.create` otherwise stacks "Cannot read properties of undefined"
  // on top of the real error and buries the one line that explains the run.
  await pic?.tearDown();
});

it("answers an empty-state read instead of trapping", async () => {
  await expect(
    actor.listPublishedIdeas({
      field: [],
      sort: [],
      maxFunding: [],
      search: [],
      stage: [],
      minFunding: [],
    }),
  ).resolves.toEqual([]);
  await expect(actor.listMyIdeas()).resolves.toEqual([]);
  await expect(actor.listMyInterests()).resolves.toEqual([]);
  await expect(actor.getCallerProfile()).resolves.toEqual([]);
});

it("round-trips a profile through the real canister", async () => {
  const profile = await actor.saveCallerProfile("Ada", "bio", "ada@example.com", [
    { seller: null },
  ]);
  expect(profile.displayName).toBe("Ada");
  expect(profile.roles).toEqual([{ seller: null }]);
  const read = await actor.getCallerProfile();
  expect(read).toHaveLength(1);
  expect(read[0]?.displayName).toBe("Ada");
});

it("creates, publishes, and reads back an idea", async () => {
  const input = {
    field: { agriculture: null },
    title: "Solar micro-grid",
    documents: [],
    businessPlan: "Market and model.",
    description: "A grid for rural clinics.",
    summary: "Clean power for clinics.",
    stage: { concept: null },
    fundingTarget: [250_000n],
    location: "Nairobi",
    images: [],
  };
  const created = await actor.createIdea(input, { draft: null });
  expect(created.title).toBe("Solar micro-grid");
  expect(created.status).toEqual({ draft: null });

  const published = await actor.publishIdea(created.id);
  expect(published).toHaveLength(1);
  expect(published[0]?.status).toEqual({ published: null });

  const feed = await actor.listPublishedIdeas({
    field: [{ agriculture: null }],
    sort: [],
    maxFunding: [],
    search: [],
    stage: [],
    minFunding: [],
  });
  expect(feed).toHaveLength(1);
  expect(feed[0]?.title).toBe("Solar micro-grid");
});

it("records a buyer's interest and lists it for the seller", async () => {
  const created = await actor.createIdea(
    {
      field: { technology: null },
      title: "Edge compute",
      documents: [],
      businessPlan: "Plan.",
      description: "Desc.",
      summary: "Summary.",
      stage: { prototype: null },
      fundingTarget: [],
      location: "",
      images: [],
    },
    { published: null },
  );

  const interest = await actor.expressInterest(created.id, "I want in.");
  expect(interest.message).toBe("I want in.");
  expect(interest.ideaId).toBe(created.id);

  const forIdea = await actor.listInterestsForIdea(created.id);
  expect(forIdea).toHaveLength(1);
  expect(forIdea[0]?.message).toBe("I want in.");
});
