import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Cell {
    value: Value;
    name: string;
}
export type DocumentId = bigint;
export type Error_ = {
    __kind__: "FrontendOriginsNotConfigured";
    FrontendOriginsNotConfigured: null;
} | {
    __kind__: "MixedSsoSources";
    MixedSsoSources: {
        otherKeys: Array<string>;
        ssoKeys: Array<string>;
    };
} | {
    __kind__: "Stale";
    Stale: {
        ageNs: bigint;
    };
} | {
    __kind__: "MalformedCandid";
    MalformedCandid: null;
} | {
    __kind__: "AmbiguousAttribute";
    AmbiguousAttribute: {
        field: string;
        sources: Array<string>;
    };
} | {
    __kind__: "NoAttributes";
    NoAttributes: null;
} | {
    __kind__: "UnknownNonce";
    UnknownNonce: null;
} | {
    __kind__: "UntrustedSsoSource";
    UntrustedSsoSource: {
        domain: string;
    };
} | {
    __kind__: "MissingField";
    MissingField: string;
} | {
    __kind__: "FrontendOriginMismatch";
    FrontendOriginMismatch: {
        got: string;
        expected: Array<string>;
    };
};
export interface Idea {
    id: IdeaId;
    field: Field;
    status: IdeaStatus;
    title: string;
    documents: Array<IdeaDocument>;
    owner: UserId;
    createdAt: Timestamp;
    businessPlan: string;
    description: string;
    summary: string;
    updatedAt: Timestamp;
    stage: Stage;
    viewCount: bigint;
    interestCount: bigint;
    fundingTarget?: bigint;
    location: string;
    images: Array<IdeaDocument>;
}
export interface IdeaDocument {
    id: DocumentId;
    url: string;
    contentType: string;
    name: string;
    uploadedAt: Timestamp;
}
export interface IdeaFilter {
    field?: Field;
    sort?: IdeaSort;
    maxFunding?: bigint;
    search?: string;
    stage?: Stage;
    minFunding?: bigint;
}
export type IdeaId = bigint;
export interface IdeaInput {
    field: Field;
    title: string;
    documents: Array<IdeaDocument>;
    businessPlan: string;
    description: string;
    summary: string;
    stage: Stage;
    fundingTarget?: bigint;
    location: string;
    images: Array<IdeaDocument>;
}
export interface Interest {
    id: InterestId;
    createdAt: Timestamp;
    message: string;
    buyer: UserId;
    ideaId: IdeaId;
}
export type InterestId = bigint;
export interface Result {
    hasMore: boolean;
    rows: Array<Array<Cell>>;
}
export type Result__1 = {
    __kind__: "ok";
    ok: null;
} | {
    __kind__: "err";
    err: Error_;
};
export type Timestamp = bigint;
export type UserId = Principal;
export interface UserProfile {
    id: UserId;
    bio: string;
    displayName: string;
    createdAt: Timestamp;
    updatedAt: Timestamp;
    contactEmail: string;
    roles: Array<AccountRole>;
}
export type Value = {
    __kind__: "int";
    int: bigint;
} | {
    __kind__: "nat";
    nat: bigint;
} | {
    __kind__: "float";
    float: number;
} | {
    __kind__: "bool";
    bool: boolean;
} | {
    __kind__: "null";
    null: null;
} | {
    __kind__: "text";
    text: string;
};
export enum AccountRole {
    seller = "seller",
    buyer = "buyer"
}
export enum Field {
    bio = "bio",
    mechanicalEngineering = "mechanicalEngineering",
    other = "other",
    education = "education",
    medicine = "medicine",
    technology = "technology",
    business = "business",
    agriculture = "agriculture",
    energy = "energy"
}
export enum IdeaSort {
    newest = "newest",
    mostViewed = "mostViewed"
}
export enum IdeaStatus {
    published = "published",
    draft = "draft"
}
export enum Stage {
    concept = "concept",
    prototype = "prototype",
    readyToLaunch = "readyToLaunch"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addCallerRole(role: AccountRole): Promise<UserProfile>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createIdea(input: IdeaInput, status: IdeaStatus): Promise<Idea>;
    deleteIdea(id: bigint): Promise<boolean>;
    execute(qJson: string): Promise<Result>;
    expressInterest(ideaId: bigint, message: string): Promise<Interest>;
    getApiDoc(): Promise<string>;
    getCallerProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getIdea(id: bigint): Promise<Idea | null>;
    getProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    listInterestsForIdea(ideaId: bigint): Promise<Array<Interest>>;
    listMyIdeas(): Promise<Array<Idea>>;
    listMyInterests(): Promise<Array<Interest>>;
    listPublishedIdeas(filter: IdeaFilter): Promise<Array<Idea>>;
    publishIdea(id: bigint): Promise<Idea | null>;
    recordIdeaView(id: bigint): Promise<Idea | null>;
    saveCallerProfile(displayName: string, bio: string, contactEmail: string, roles: Array<AccountRole>): Promise<UserProfile>;
    schema(): Promise<string>;
    unpublishIdea(id: bigint): Promise<Idea | null>;
    updateIdea(id: bigint, input: IdeaInput): Promise<Idea | null>;
}
