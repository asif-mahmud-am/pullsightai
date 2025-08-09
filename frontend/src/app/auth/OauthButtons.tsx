import { Bitbucket, Github, GitLab } from "@/components/common/icons";
import { Button } from "@/components/ui/button";
import { getAuthUrl } from "@/lib/utils";
import Link from "next/link";
import { FC } from "react";

const OauthButtons: FC = () => {
    return (
        <div className="flex gap-x-4 w-full">
            <Button
                asChild
                className="flex-1 !bg-white !text-black hover:!bg-gray-200 text-base"
                size={"xl"}
            >
                <Link
                    href={getAuthUrl("github")}
                    className="flex items-center gap-2"
                >
                    <Github /> GitHub
                </Link>
            </Button>
            <Button
                asChild
                className="flex-1 !bg-white !text-black hover:!bg-gray-200 text-base"
                size={"xl"}
            >
                <a
                    href={getAuthUrl("bitbucket")}
                    className="flex items-center gap-2"
                >
                    <Bitbucket /> BitBucket
                </a>
            </Button>
            <Button
                asChild
                className="flex-1 !bg-white !text-black hover:!bg-gray-200 text-base"
                size={"xl"}
            >
                <a
                    href={getAuthUrl("gitlab")}
                    className="flex items-center gap-2"
                >
                    <GitLab /> GitLab
                </a>
            </Button>
        </div>
    );
};

export default OauthButtons;
