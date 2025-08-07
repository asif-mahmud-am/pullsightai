import { Organization } from "./organization";

export type Provider = "github" | "bitbucket" | "gitlab";

export interface User {
    _id: string;
    username: string;
    displayName: string;
    email: string;
    provider: Provider;
    providerId: string;
    avatarUrl: string;
    currentWorkspace?: Organization | string; // Can be Organization object or ID
    onboardingStep: number | null;
}
