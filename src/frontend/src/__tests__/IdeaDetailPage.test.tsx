import { AccountRole, Field } from "@/backend";
import { IdeaDetailPage } from "@/pages/IdeaDetailPage";
import type { Idea, UserProfile } from "@/types";
import {
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  type MockBackend,
  TestProviders,
  createMockBackend,
  makeDocument,
  makeIdea,
  makeProfile,
} from "./test-utils";

const backend: { current: MockBackend } = { current: createMockBackend() };
const auth: { isAuthenticated: boolean } = { isAuthenticated: true };

vi.mock("@/lib/backend", () => ({
  useBackendActor: () => ({ actor: backend.current, isFetching: false }),
}));

vi.mock("@caffeineai/core-infrastructure", () => ({
  useInternetIdentity: () => ({
    isAuthenticated: auth.isAuthenticated,
    isInitializing: false,
    isLoggingIn: false,
    login: vi.fn(),
    clear: vi.fn(),
  }),
}));

// Valid principal text: `Principal.fromText` rejects arbitrary strings, and the
// detail page parses the owner id before calling `getProfile`.
const sellerPrincipal = "aaaaa-aa";
const buyerPrincipal = "2vxsx-fae";

const sellerProfile: UserProfile = makeProfile({
  id: { toString: () => sellerPrincipal } as unknown as UserProfile["id"],
  displayName: "Ada Seller",
  bio: "Climate investor.",
  contactEmail: "ada@example.com",
  roles: [AccountRole.seller],
});

const buyerProfile: UserProfile = makeProfile({
  id: { toString: () => buyerPrincipal } as unknown as UserProfile["id"],
  displayName: "Bob Buyer",
  roles: [AccountRole.buyer],
});

const idea: Idea = makeIdea({
  id: 7n,
  title: "Solar micro-grid",
  summary: "Clean power for clinics.",
  description: "A grid for rural clinics.",
  businessPlan: "Market, model, traction.",
  field: Field.agriculture,
  stage: "prototype" as Idea["stage"],
  fundingTarget: 250_000n,
  location: "Nairobi",
  owner: { toString: () => sellerPrincipal } as unknown as Idea["owner"],
  documents: [makeDocument({ id: 1n, name: "Pitch deck" })],
});

function renderDetail(id = "7") {
  const rootRoute = createRootRoute();
  const detailRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/ideas/$id",
    component: IdeaDetailPage,
  });
  const router = createRouter({
    routeTree: rootRoute.addChildren([detailRoute]),
    history: createMemoryHistory({ initialEntries: [`/ideas/${id}`] }),
  });
  render(
    <TestProviders>
      <RouterProvider router={router} />
    </TestProviders>,
  );
  return router;
}

beforeEach(() => {
  backend.current = createMockBackend();
  auth.isAuthenticated = true;
});

describe("IdeaDetailPage", () => {
  it("renders the full idea with description, business plan, documents, and seller profile", async () => {
    backend.current.getIdea = vi.fn(async () => idea);
    backend.current.getProfile = vi.fn(async () => sellerProfile);
    backend.current.getCallerProfile = vi.fn(async () => buyerProfile);

    renderDetail();

    expect(await screen.findByText("Solar micro-grid")).toBeInTheDocument();
    expect(screen.getByText("A grid for rural clinics.")).toBeInTheDocument();
    expect(screen.getByText("Market, model, traction.")).toBeInTheDocument();
    expect(screen.getByText("Pitch deck")).toBeInTheDocument();
    expect(screen.getByText("Ada Seller")).toBeInTheDocument();
    expect(screen.getByText("ada@example.com")).toBeInTheDocument();
    expect(screen.getByText("$250,000")).toBeInTheDocument();
  });

  it("records a view once when the detail page opens", async () => {
    const recordView = vi.fn(async () => idea);
    backend.current.getIdea = vi.fn(async () => idea);
    backend.current.getProfile = vi.fn(async () => sellerProfile);
    backend.current.getCallerProfile = vi.fn(async () => buyerProfile);
    backend.current.recordIdeaView = recordView;

    renderDetail();

    await screen.findByText("Solar micro-grid");
    await waitFor(() => {
      expect(recordView).toHaveBeenCalledWith(7n);
    });
    expect(recordView).toHaveBeenCalledTimes(1);
  });

  it("lets a buyer express interest and sends the message to the backend", async () => {
    const expressInterest = vi.fn(async () => ({
      id: 1n,
      createdAt: 0n,
      message: "I want in.",
      buyer: { toString: () => buyerPrincipal } as never,
      ideaId: 7n,
    }));
    backend.current.getIdea = vi.fn(async () => idea);
    backend.current.getProfile = vi.fn(async () => sellerProfile);
    backend.current.getCallerProfile = vi.fn(async () => buyerProfile);
    backend.current.expressInterest = expressInterest;

    renderDetail();

    await screen.findByText("Solar micro-grid");
    await userEvent.click(
      screen.getByRole("button", { name: "Express interest" }),
    );
    await userEvent.type(screen.getByLabelText("Your message"), "I want in.");
    await userEvent.click(
      screen.getByRole("button", { name: "Send interest" }),
    );

    await waitFor(() => {
      expect(expressInterest).toHaveBeenCalledWith(7n, "I want in.");
    });
  });

  it("offers a mailto contact link to the seller's email", async () => {
    backend.current.getIdea = vi.fn(async () => idea);
    backend.current.getProfile = vi.fn(async () => sellerProfile);
    backend.current.getCallerProfile = vi.fn(async () => buyerProfile);

    renderDetail();

    const contact = await screen.findByRole("link", {
      name: /Contact seller/i,
    });
    expect(contact).toHaveAttribute(
      "href",
      expect.stringContaining("mailto:ada@example.com"),
    );
  });

  it("shows a sign-in prompt to an unauthenticated visitor", async () => {
    auth.isAuthenticated = false;
    backend.current.getIdea = vi.fn(async () => idea);
    backend.current.getProfile = vi.fn(async () => sellerProfile);
    backend.current.getCallerProfile = vi.fn(async () => null);

    renderDetail();

    expect(
      await screen.findByRole("button", {
        name: "Sign in to express interest",
      }),
    ).toBeInTheDocument();
  });

  it("shows an error state when the idea cannot be loaded", async () => {
    backend.current.getIdea = vi.fn(async () => null);
    backend.current.getProfile = vi.fn(async () => null);
    backend.current.getCallerProfile = vi.fn(async () => null);

    renderDetail();

    expect(await screen.findByText("Idea not found")).toBeInTheDocument();
  });
});
