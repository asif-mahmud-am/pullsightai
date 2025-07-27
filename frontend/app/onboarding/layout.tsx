import {
    CheckedIcon,
    CircleIcon,
    StepOnProgressIcon,
} from "@/components/common/icons";
import { Button } from "@/components/ui/button";
import { LogOutIcon } from "lucide-react";
import { ReactNode } from "react";
import ProgressSteps from "./ProgressSteps";
import Image from "next/image";
import AuthGuardClient from "@/components/auth/AuthGuardClient";
import { AuthGuardServer } from "@/components/auth/AuthGuardServer";

const OnboardingLayout = ({ children }: { children: ReactNode }) => {
    async function handleLogout(event: React.MouseEvent) {
        // try {
        //   await Api.post('/api/logout')
        //   window.location.reload()
        // } catch (error) {
        //   console.error('Logout failed:', error)
        // }
    }

    return (
        <AuthGuardServer>
            <AuthGuardClient>
                <div
                    className="py-12 min-h-screen bg-no-repeat bg-cover bg-center"
                    style={{
                        backgroundImage: "url('/images/gradient-bg.svg')",
                    }}
                >
                    <div className="container">
                        <div className="mb-12">
                            <div className="flex justify-between">
                                <Image
                                    src="/images/logo.svg"
                                    alt="pullsight logo"
                                    width={112}
                                    height={40}
                                    className=""
                                />
                                <Button
                                    variant="outline"
                                    className="text-white text-sm border-0 cursor-pointer hover:underline underline-offset-4"
                                    onClick={handleLogout}
                                >
                                    <LogOutIcon />
                                    Logout
                                </Button>
                            </div>

                            {!false && <ProgressSteps />}
                        </div>
                        <div className="flex flex-col gap-5 mx-auto justify-between mt-[64px] min-h-[calc(100vh-300px)]">
                            {children}
                        </div>
                    </div>
                </div>
            </AuthGuardClient>
        </AuthGuardServer>
    );
};

export default OnboardingLayout;
