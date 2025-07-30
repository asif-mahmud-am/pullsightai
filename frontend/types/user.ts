export interface User {
    _id: string;
    username: string;
    displayName: string;
    email: string;
    provider: string;
    providerId: string;
    avatarUrl: string;
    onboardingStep: number | null;
}
