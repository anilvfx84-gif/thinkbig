import { BrowsePage } from "@/pages/BrowsePage";
import { DashboardPage } from "@/pages/DashboardPage";
import { HomePage } from "@/pages/HomePage";
import { IdeaDetailPage } from "@/pages/IdeaDetailPage";
import { IdeaEditorPage } from "@/pages/IdeaEditorPage";
import { InterestsPage } from "@/pages/InterestsPage";
import { ProfilePage } from "@/pages/ProfilePage";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";

const rootRoute = createRootRoute({
  component: () => <Outlet />,
});

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});

const browseRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/browse",
  component: BrowsePage,
});

const ideaDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/ideas/$id",
  component: IdeaDetailPage,
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard",
  component: DashboardPage,
});

const ideaNewRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/ideas/new",
  component: IdeaEditorPage,
});

const ideaEditRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/ideas/$id/edit",
  component: IdeaEditorPage,
});

const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/profile",
  component: ProfilePage,
});

const interestsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/interests",
  component: InterestsPage,
});

const routeTree = rootRoute.addChildren([
  homeRoute,
  browseRoute,
  ideaDetailRoute,
  dashboardRoute,
  ideaNewRoute,
  ideaEditRoute,
  profileRoute,
  interestsRoute,
]);

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
