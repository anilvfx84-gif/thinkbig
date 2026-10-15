import { Field, IdeaSort } from "@/backend";
import { BrowsePage } from "@/pages/BrowsePage";
import type { Idea } from "@/types";
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
} from "./test-utils";

const backend: { current: MockBackend } = { current: createMockBackend() };

vi.mock("@/lib/backend", () => ({
  useBackendActor: () => ({ actor: backend.current, isFetching: false }),
}));

vi.mock("@caffeineai/core-infrastructure", () => ({
  useInternetIdentity: () => ({
    isAuthenticated: false,
    isInitializing: false,
    isLoggingIn: false,
    login: vi.fn(),
    clear: vi.fn(),
  }),
}));

function renderBrowse(initialEntry = "/browse") {
  const rootRoute = createRootRoute();
  const browseRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/browse",
    component: BrowsePage,
  });
  const router = createRouter({
    routeTree: rootRoute.addChildren([browseRoute]),
    history: createMemoryHistory({ initialEntries: [initialEntry] }),
  });
  render(
    <TestProviders>
      <RouterProvider router={router} />
    </TestProviders>,
  );
  return router;
}

const agricultureIdea = makeIdea({
  id: 1n,
  title: "Solar micro-grid",
  summary: "Clean power for clinics.",
  field: Field.agriculture,
  stage: "prototype" as Idea["stage"],
  fundingTarget: 250_000n,
});

const technologyIdea = makeIdea({
  id: 2n,
  title: "Edge compute",
  summary: "Compute at the edge.",
  field: Field.technology,
  stage: "concept" as Idea["stage"],
  fundingTarget: 1_000_000n,
});

beforeEach(() => {
  backend.current = createMockBackend();
});

describe("BrowsePage", () => {
  it("renders published ideas as cards with title, field, stage, and funding", async () => {
    backend.current.listPublishedIdeas = vi.fn(async () => [
      agricultureIdea,
      technologyIdea,
    ]);
    renderBrowse();

    expect(await screen.findByText("Solar micro-grid")).toBeInTheDocument();
    expect(screen.getByText("Edge compute")).toBeInTheDocument();
    expect(screen.getByText("2 ideas")).toBeInTheDocument();

    const agricultureCard = screen.getByTestId("browse.idea_card.1");
    expect(
      within(agricultureCard).getByText("Agriculture"),
    ).toBeInTheDocument();
    expect(within(agricultureCard).getByText("Prototype")).toBeInTheDocument();
    expect(within(agricultureCard).getByText("$250K")).toBeInTheDocument();

    const technologyCard = screen.getByTestId("browse.idea_card.2");
    expect(within(technologyCard).getByText("Technology")).toBeInTheDocument();
    expect(within(technologyCard).getByText("$1M")).toBeInTheDocument();
  });

  it("shows an empty state when no ideas match", async () => {
    backend.current.listPublishedIdeas = vi.fn(async () => []);
    renderBrowse();

    expect(
      await screen.findByText("No ideas match these filters"),
    ).toBeInTheDocument();
  });

  it("passes the field filter to the backend and reflects it in the URL", async () => {
    const listPublished = vi.fn(async () => [agricultureIdea]);
    backend.current.listPublishedIdeas = listPublished;
    const router = renderBrowse();

    await screen.findByText("Solar micro-grid");
    await userEvent.click(
      screen.getByRole("checkbox", { name: "Agriculture" }),
    );

    await waitFor(() => {
      expect(listPublished).toHaveBeenLastCalledWith(
        expect.objectContaining({ field: Field.agriculture }),
      );
    });
    await waitFor(() => {
      expect(router.state.location.search).toMatchObject({
        fields: "agriculture",
      });
    });
  });

  it("restores the field filter from the URL on load", async () => {
    const listPublished = vi.fn(async () => [agricultureIdea]);
    backend.current.listPublishedIdeas = listPublished;
    renderBrowse("/browse?fields=agriculture");

    await waitFor(() => {
      expect(listPublished).toHaveBeenCalledWith(
        expect.objectContaining({ field: Field.agriculture }),
      );
    });
    expect(screen.getByRole("checkbox", { name: "Agriculture" })).toBeChecked();
  });

  it("sends the keyword search to the backend", async () => {
    const listPublished = vi.fn(async () => [agricultureIdea]);
    backend.current.listPublishedIdeas = listPublished;
    renderBrowse();

    await screen.findByText("Solar micro-grid");
    await userEvent.type(
      screen.getByRole("textbox", { name: "Search ideas" }),
      "solar",
    );
    await userEvent.click(screen.getByRole("button", { name: "Search" }));

    await waitFor(() => {
      expect(listPublished).toHaveBeenLastCalledWith(
        expect.objectContaining({ search: "solar" }),
      );
    });
  });

  it("sends the most-viewed sort to the backend", async () => {
    const listPublished = vi.fn(async () => [agricultureIdea]);
    backend.current.listPublishedIdeas = listPublished;
    renderBrowse();

    await screen.findByText("Solar micro-grid");
    await userEvent.click(screen.getByRole("button", { name: "Most viewed" }));

    await waitFor(() => {
      expect(listPublished).toHaveBeenLastCalledWith(
        expect.objectContaining({ sort: IdeaSort.mostViewed }),
      );
    });
  });
});
