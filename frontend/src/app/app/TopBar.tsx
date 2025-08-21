import LogoutHandler from "@/components/auth/LogoutHandler";
import { Button } from "@/components/ui/button";
import { LogOutIcon } from "lucide-react";
import Image from "next/image";

const AppTopBar = () => {
    return (
        <div className="h-[88px] flex items-center border-b gap-x-4 px-5">
            <Image
                src="/images/logo-icon.svg"
                alt="pull sight logo"
                width={23}
                height={37}
                className="h-auto w-auto"
            />
            <span className="text-base font-medium">
                Welcome back, Ralph 👋
            </span>

            <LogoutHandler asChild>
                <Button
                    variant="outline"
                    className="text-white text-sm border-0 cursor-pointer hover:underline underline-offset-4 ml-auto"
                >
                    <LogOutIcon />
                    Logout
                </Button>
            </LogoutHandler>
        </div>
    );
};

export default AppTopBar;
