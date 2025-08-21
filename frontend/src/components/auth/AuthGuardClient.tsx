// components/auth/AuthGuard.tsx
"use client";

import { redirect, usePathname } from "next/navigation";
import { ReactNode, useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { ROUTE_CONSTANTS } from "@/lib/constants";
import Image from "next/image";

export default function AuthGuardClient({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    const user = useAuthStore((s) => s.user);
    const hydrated = useAuthStore((s) => s.hydrated);

    useEffect(() => {
        console.log("First effect", user);
        if (hydrated && !user) {
            redirect(ROUTE_CONSTANTS.LOGIN);
            // Alternatively, you can use router.push(ROUTE_CONSTANTS.LOGIN);
        }
        if (
            hydrated &&
            user &&
            (user.onboardingStep ?? 0) > 0 &&
            !pathname.includes(ROUTE_CONSTANTS.ONBOARDING) // need to check current step and pathname to redirect to proper step
        ) {
            const onboardingStep = user.onboardingStep;
            if (onboardingStep === 2) {
                redirect(ROUTE_CONSTANTS.ONBOARDING_STEP_2);
            } else if (onboardingStep === 3) {
                redirect(ROUTE_CONSTANTS.ONBOARDING_STEP_3);
            } else if (onboardingStep === 4) {
                redirect(ROUTE_CONSTANTS.ONBOARDING_STEP_4);
            } else if (onboardingStep === 5) {
                redirect(ROUTE_CONSTANTS.ONBOARDING_STEP_5);
            } else {
                redirect(ROUTE_CONSTANTS.ONBOARDING_STEP_1);
            }
        } else if (
            hydrated &&
            user &&
            (user.onboardingStep ?? 0) == 0 &&
            (pathname.includes(ROUTE_CONSTANTS.ONBOARDING) ||
                pathname.includes("auth"))
        ) {
            redirect(ROUTE_CONSTANTS.APP_DASHBOARD);
        }
    }, [user, hydrated]);

    if (!hydrated)
        return (
            <div className="h-screen bg-dark-900 flex items-center justify-center">
                <Image
                    src="/images/logo.svg"
                    alt="pullsight logo"
                    width={99}
                    height={35}
                    className=""
                    priority
                />
            </div>
        );

    return <>{children}</>;
}
