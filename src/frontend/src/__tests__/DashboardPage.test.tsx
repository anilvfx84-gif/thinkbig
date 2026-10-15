import { AccountRole, Field } from "@/backend";
import { DashboardPage } from "@/pages/DashboardPage";
import type { Idea, UserProfile } from "@/types";
import {
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  type MockBackend,
  TestProviders,
  createMockBackend,
  makeIdea,
  makeInterest,
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

// Valid principal text: the dashboard parses buyer ids before `getProfile`.
const buyerPrincipal = "2vxsx-fae";

const sellerProfile: UserProfile = makeProfile({
  displayName: "Ada Seller",
  roles: [AccountRole.seller],
});

const buyerProfile: UserProfile = makeProfile({
  id: { toString: () => buyerPrincipal } as unknown as UserProfile["id"],
  displayName: "Bob Buyer",
  bio: "Angel investor.",
  contactEmail: "bob@example.com",
  roles: [AccountRole.buyer],
});

const draftIdea: Idea = makeIdea({
  id: 1n,
  title: "Solar micro-grid",
  summary: "Clean power for clinics.",
  field: Field.agriculture,
  status: "draft" as Idea["status"],
  viewCount: 3n,
  interestCount: 1n,
});

const publishedIdea: Idea = makeIdea({
  id: 2n,
  title: "Edge compute",
  summary: "Compute at the edge.",
  field: Field.technology,
  status: "published" as Idea["status"],
});

function renderDashboard() {
  const rootRoute = createRootRoute();
  const dashboardRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/dashboard",
    component: DashboardPage,
  });
  const router = createRouter({
    routeTree: rootRoute.addChildren([dashboardRoute]),
    history: createMemoryHistory({ initialEntries: ["/dashboard"] }),
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

describe("DashboardPage", () => {
  it("lists the seller's ideas with status, field, and counts", async () => {
    backend.current.getCallerProfile = vi.fn(async () => sellerProfile);
    backend.current.listMyIdeas = vi.fn(async () => [draftIdea, publishedIdea]);

    renderDashboard();

    expect(await screen.findByText("Solar micro-grid")).toBeInTheDocument();
    expect(screen.getByText("Edge compute")).toBeInTheDocument();

    const draftRow = screen.getByTestId("dashboard.idea_item.1");
    expect(within(draftRow).getByText("Draft")).toBeInTheDocument();
    expect(within(draftRow).getByText("Agriculture")).toBeInTheDocument();
    expect(within(draftRow).getByText("3 views")).toBeInTheDocument();
    expect(within(draftRow).getByText("1 interested")).toBeInTheDocument();

    const publishedRow = screen.getByTestId("dashboard.idea_item.2");
    expect(within(publishedRow).getByText("Published")).toBeInTheDocument();
    expect(within(publishedRow).getByText("Technology")).toBeInTheDocument();
  });

  it("publishes a draft through the backend", async () => {
    const publish = vi.fn(async () => publishedIdea);
    backend.current.getCallerProfile = vi.fn(async () => sellerProfile);
    backend.current.listMyIdeas = vi.fn(async () => [draftIdea]);
    backend.current.publishIdea = publish;

    renderDashboard();

    await screen.findByText("Solar micro-grid");
    await userEvent.click(screen.getByTestId("dashboard.publish_button.1"));

    await waitFor(() => {
      expect(publish).toHaveBeenCalledWith(1n);
    });
  });

  it("unpublishes a published idea through the backend", async () => {
    const unpublish = vi.fn(async () => draftIdea);
    backend.current.getCallerProfile = vi.fn(async () => sellerProfile);
    backend.current.listMyIdeas = vi.fn(async () => [publishedIdea]);
    backend.current.unpublishIdea = unpublish;

    renderDashboard();

    await screen.findByText("Edge compute");
    await userEvent.click(screen.getByTestId("dashboard.unpublish_button.1"));

    await waitFor(() => {
      expect(unpublish).toHaveBeenCalledWith(2n);
    });
  });

  it("shows the interested buyers with their profile and message", async () => {
    backend.current.getCallerProfile = vi.fn(async () => sellerProfile);
    backend.current.listMyIdeas = vi.fn(async () => [draftIdea]);
    backend.current.listInterestsForIdea = vi.fn(async () => [
      makeInterest({
        id: 1n,
        ideaId: 1n,
        message: "I want in.",
        buyer: { toString: () => buyerPrincipal } as never,
      }),
    ]);
    backend.current.getProfile = vi.fn(async () => buyerProfile);

    renderDashboard();

    await screen.findByText("Solar micro-grid");
    await userEvent.click(screen.getByTestId("dashboard.interested_button.1"));

    expect(await screen.findByText("Bob Buyer")).toBeInTheDocument();
    expect(screen.getByText("Angel investor.")).toBeInTheDocument();
    expect(screen.getByText("I want in.")).toBeInTheDocument();
    expect(screen.getByText("bob@example.com")).toBeInTheDocument();
  });

  it("shows an empty state when the seller has no ideas", async () => {
    backend.current.getCallerProfile = vi.fn(async () => sellerProfile);
    backend.current.listMyIdeas = vi.fn(async () => []);

    renderDashboard();

    expect(await screen.findByText("No ideas yet")).toBeInTheDocument();
  });

  it("gates the dashboard behind sign-in", async () => {
    auth.isAuthenticated = false;

    renderDashboard();

    expect(
      await screen.findByTestId("dashboard.auth_gate"),
    ).toBeInTheDocument();
    expect(screen.getByTestId("dashboard.signin_button")).toBeInTheDocument();
  });

  it("gates the dashboard behind the seller role", async () => {
    backend.current.getCallerProfile = vi.fn(async () => buyerProfile);

    renderDashboard();

    expect(
      await screen.findByTestId("dashboard.role_gate"),
    ).toBeInTheDocument();
  });
});
