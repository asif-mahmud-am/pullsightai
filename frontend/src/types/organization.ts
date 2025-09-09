import { Pack } from "./pack";
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
    noOfActiveMembers?: number;
    planTotalToken?: number;
    planRemainingToken?: number;
    packTotalToken?: number;
    packRemainingToken?: number;
    currentPlan?: {
        _id: string;
        workspace: string;
        plan?: Plan;
        amount: number;
        // totalToken: number;
        // remainingToken: number;
        numOfSeat: number;
        billingCycle: string;
        status: string;
        paymentStatus: string;
        periodStart: string;
        periodEnd: string;
        title: string;
        pricePerDev: number;
        tokenLimitPerDev: number;
        isFree: boolean;
        isDefault: boolean;
        createdAt: string;
        updatedAt: string;
        subscriptionId: string;
    };
    currentPack?: {
        _id: string;
        workspace: string;
        pack?: Pack;
        amount: number;
        gatewayCharge: number;
        // totalToken: number;
        // remainingToken: number;
        isActive: boolean;
        createdAt: string;
        updatedAt: string;
    };
}
