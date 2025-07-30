export interface User {
    _id: string;
    username: string;
    displayName: string;
    email: string;
    provider: string;
    providerId: string;
    avatarUrl: string;
    currentWorkspace: string | null;
    onboardingStep: number | null;
}
