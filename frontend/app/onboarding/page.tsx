// app/dashboard/page.tsx
import { redirect } from "next/navigation";

const OnboardingIndex = () => {
    redirect("/onboarding/step-1");
};

export default OnboardingIndex;
