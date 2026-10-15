import type {
  AccountRole,
  Idea,
  IdeaDocument,
  IdeaFilter,
  IdeaInput,
  IdeaStatus,
  Interest,
  UserProfile,
} from "@/backend";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render } from "@testing-library/react";
import type { ReactElement, ReactNode } from "react";
import { vi } from "vitest";

/**
 * A typed local stand-in for the generated `Backend` actor. Every method the
 * app's hooks call is present, so a missing method is a type error rather than
 * a runtime surprise. Tests override only the methods they exercise.
 */
export interface MockBackend {
  addCallerRole: (role: AccountRole) => Promise<UserProfile>;
  createIdea: (input: IdeaInput, status: IdeaStatus) => Promise<Idea>;
  deleteIdea: (id: bigint) => Promise<boolean>;
  expressInterest: (ideaId: bigint, message: string) => Promise<Interest>;
  getCallerProfile: () => Promise<UserProfile | null>;
  getIdea: (id: bigint) => Promise<Idea | null>;
  getProfile: (user: unknown) => Promise<UserProfile | null>;
  listInterestsForIdea: (ideaId: bigint) => Promise<Interest[]>;
  listMyIdeas: () => Promise<Idea[]>;
  listMyInterests: () => Promise<Interest[]>;
  listPublishedIdeas: (filter: IdeaFilter) => Promise<Idea[]>;
  publishIdea: (id: bigint) => Promise<Idea | null>;
  recordIdeaView: (id: bigint) => Promise<Idea | null>;
  saveCallerProfile: (
    displayName: string,
    bio: string,
    contactEmail: string,
    roles: AccountRole[],
  ) => Promise<UserProfile>;
  unpublishIdea: (id: bigint) => Promise<Idea | null>;
  updateIdea: (id: bigint, input: IdeaInput) => Promise<Idea | null>;
}

export function createMockBackend(
  overrides: Partial<MockBackend> = {},
): MockBackend {
  const base: MockBackend = {
    addCallerRole: vi.fn(async () => makeProfile()),
    createIdea: vi.fn(async (input, status) => makeIdea({ ...input, status })),
    deleteIdea: vi.fn(async () => true),
    expressInterest: vi.fn(async (ideaId, message) =>
      makeInterest({ ideaId, message }),
    ),
    getCallerProfile: vi.fn(async () => null),
    getIdea: vi.fn(async () => null),
    getProfile: vi.fn(async () => null),
    listInterestsForIdea: vi.fn(async () => []),
    listMyIdeas: vi.fn(async () => []),
    listMyInterests: vi.fn(async () => []),
    listPublishedIdeas: vi.fn(async () => []),
    publishIdea: vi.fn(async () => null),
    recordIdeaView: vi.fn(async () => null),
    saveCallerProfile: vi.fn(async (displayName, bio, contactEmail, roles) =>
      makeProfile({ displayName, bio, contactEmail, roles }),
    ),
    unpublishIdea: vi.fn(async () => null),
    updateIdea: vi.fn(async (id, input) => makeIdea({ ...input, id })),
  };
  return { ...base, ...overrides };
}

export function makeProfile(overrides: Partial<UserProfile> = {}): UserProfile {
  return {
    id: { toString: () => "aaaaa-aa" } as unknown as UserProfile["id"],
    bio: "",
    displayName: "",
    createdAt: 0n,
    updatedAt: 0n,
    contactEmail: "",
    roles: [],
    ...overrides,
  };
}

export function makeIdea(overrides: Partial<Idea> = {}): Idea {
  return {
    id: 1n,
    field: "business" as Idea["field"],
    status: "published" as Idea["status"],
    title: "An idea",
    documents: [],
    owner: { toString: () => "aaaaa-aa" } as unknown as Idea["owner"],
    createdAt: 0n,
    businessPlan: "",
    description: "",
    summary: "",
    updatedAt: 0n,
    stage: "concept" as Idea["stage"],
    viewCount: 0n,
    interestCount: 0n,
    location: "",
    images: [],
    ...overrides,
  };
}

export function makeInterest(overrides: Partial<Interest> = {}): Interest {
  return {
    id: 1n,
    createdAt: 0n,
    message: "",
    buyer: { toString: () => "bbbbb-bb" } as unknown as Interest["buyer"],
    ideaId: 1n,
    ...overrides,
  };
}

export function makeDocument(
  overrides: Partial<IdeaDocument> = {},
): IdeaDocument {
  return {
    id: 1n,
    url: "https://example.com/doc",
    contentType: "application/pdf",
    name: "Plan",
    uploadedAt: 0n,
    ...overrides,
  };
}

export function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0, staleTime: 0 },
      mutations: { retry: false },
    },
  });
}

export function TestProviders({
  children,
  queryClient,
}: {
  children: ReactNode;
  queryClient?: QueryClient;
}) {
  return (
    <QueryClientProvider client={queryClient ?? createTestQueryClient()}>
      {children}
    </QueryClientProvider>
  );
}

export function renderWithProviders(
  ui: ReactElement,
  queryClient: QueryClient = createTestQueryClient(),
) {
  const result = render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
  );
  return { ...result, queryClient };
}
