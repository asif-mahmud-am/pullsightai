import { Plan } from "./plan";
import { Provider } from "./user";

export interface WorkspaceSetting {
    hourlyRate?: number;
    useOwnApiKey?: boolean;
    apiKey?: string;
    model?: string;
}

export interface Organization {
    _id: string;
    id: string;
    name: string;
    slug?: string;
    provider: Provider;
    ownerId?: string;
    nodeId: string;
    url: string;
    avatarUrl?: string | null;
    reposUrl?: string;
    type?: "Organization" | "User";
    installationId?: string;
    createdOn?: string;
    createdAt?: string;
    updatedAt?: string;
    workspaceSetting?: WorkspaceSetting;
    onboardingStep?: number;
    currentPlan?: {
        _id: string;
        workspace: string;
        plan?: Plan;
        amount: number;
        totalToken: number;
        remainingToken: number;
        numOfSeat: number;
        billingCycle: string;
        isActive: boolean;
        paymentStatus: string;
        periodStart: string;
        periodEnd: string;
        createdAt: string;
        updatedAt: string;
        subscriptionId: string;
    };
}
