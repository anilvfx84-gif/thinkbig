import { AccountRole } from "@/backend";
import { HomePage } from "@/pages/HomePage";
import type { UserProfile } from "@/types";
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

const sellerProfile: UserProfile = makeProfile({
  displayName: "Ada Seller",
  roles: [AccountRole.seller],
});

const buyerProfile: UserProfile = makeProfile({
  displayName: "Bob Buyer",
  roles: [AccountRole.buyer],
});

function renderHome() {
  const rootRoute = createRootRoute();
  const homeRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/",
    component: HomePage,
  });
  const dashboardRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/dashboard",
    component: () => <div>Dashboard route</div>,
  });
  const browseRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/browse",
    component: () => <div>Browse route</div>,
  });
  const router = createRouter({
    routeTree: rootRoute.addChildren([homeRoute, dashboardRoute, browseRoute]),
    history: createMemoryHistory({ initialEntries: ["/"] }),
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

describe("HomePage role selection", () => {
  it("renders both role choices", async () => {
    backend.current.getCallerProfile = vi.fn(async () => null);

    renderHome();

    expect(await screen.findByText("I'm an Idea Seller")).toBeInTheDocument();
    expect(screen.getByText("I'm an Idea Buyer")).toBeInTheDocument();
  });

  it("creates a seller profile and navigates to the dashboard", async () => {
    const saveProfile = vi.fn(async () => sellerProfile);
    backend.current.getCallerProfile = vi.fn(async () => null);
    backend.current.saveCallerProfile = saveProfile;

    const router = renderHome();

    await screen.findByText("I'm an Idea Seller");
    await userEvent.click(screen.getByTestId("home.role_button.1"));

    await waitFor(() => {
      expect(saveProfile).toHaveBeenCalledWith("", "", "", [
        AccountRole.seller,
      ]);
    });
    await waitFor(() => {
      expect(router.state.location.pathname).toBe("/dashboard");
    });
  });

  it("creates a buyer profile and navigates to browse", async () => {
    const saveProfile = vi.fn(async () => buyerProfile);
    backend.current.getCallerProfile = vi.fn(async () => null);
    backend.current.saveCallerProfile = saveProfile;

    const router = renderHome();

    await screen.findByText("I'm an Idea Buyer");
    await userEvent.click(screen.getByTestId("home.role_button.2"));

    await waitFor(() => {
      expect(saveProfile).toHaveBeenCalledWith("", "", "", [AccountRole.buyer]);
    });
    await waitFor(() => {
      expect(router.state.location.pathname).toBe("/browse");
    });
  });

  it("adds the missing role for an existing profile instead of replacing it", async () => {
    const addRole = vi.fn(async () => sellerProfile);
    backend.current.getCallerProfile = vi.fn(async () => buyerProfile);
    backend.current.addCallerRole = addRole;

    const router = renderHome();

    await screen.findByText("I'm an Idea Seller");
    await userEvent.click(screen.getByTestId("home.role_button.1"));

    await waitFor(() => {
      expect(addRole).toHaveBeenCalledWith(AccountRole.seller);
    });
    await waitFor(() => {
      expect(router.state.location.pathname).toBe("/dashboard");
    });
  });

  it("navigates directly when the profile already holds the chosen role", async () => {
    const addRole = vi.fn(async () => sellerProfile);
    backend.current.getCallerProfile = vi.fn(async () => sellerProfile);
    backend.current.addCallerRole = addRole;

    const router = renderHome();

    await screen.findByText("I'm an Idea Seller");
    await userEvent.click(screen.getByTestId("home.role_button.1"));

    await waitFor(() => {
      expect(router.state.location.pathname).toBe("/dashboard");
    });
    expect(addRole).not.toHaveBeenCalled();
  });
});
