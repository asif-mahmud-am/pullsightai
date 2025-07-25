import { Bitbucket, Github, GitLab } from "@/components/common/icons";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

const LoginPage = () => {
    return (
        <div className="min-h-screen py-12 flex flex-col">
            <div className="grid grid-cols-12 gap-4 lg:gap-8 flex-grow">
                <div className="col-span-6 hidden lg:block">
                    <div className="max-w-[772px] h-full py-[80px] px-[96px] bg-[var(--box-800)] rounded-[24px] flex flex-col gap-[40px] relative overflow-hidden">
                        <Image
                            src="/images/logo.svg"
                            alt="pullsight logo"
                            width={198}
                            height={71}
                            className="mb-10"
                        />
                        <div className="flex flex-col gap-[32px]">
                            <h1 className="lg:text-[30px] xl:text-[36px] font-bold">
                                Transform Your Code Reviews. Ship Better
                                Software, Faster.
                            </h1>
                            <p className="text-[var(--subtitle-300)] max-w-[554px]">
                                AI-powered code insights for your pull requests.
                                Catch bugs, improve quality, and accelerate
                                development cycles before senior eyes even touch
                                the code.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="col-span-4 lg:col-start-9">
                    <div className="flex flex-col gap-[40px] py-14">
                        <div className="flex flex-col gap-4">
                            <Image
                                src="/images/logo.svg"
                                alt="pullsight logo"
                                width={198}
                                height={71}
                                className="lg:hidden shrink-0 relative left-[-10px]"
                            />
                            <h2 className="text-[30px] sm:text-[36px]">
                                Log in to Your Account
                            </h2>

                            <p className="text-[var(--subtitle-500)] text-sm">
                                <span>Don&apos;t have an account?</span>
                                <span> </span>
                                <Link
                                    href="/auth/register"
                                    className="underline"
                                >
                                    Register now
                                </Link>
                            </p>
                        </div>
                        <div className="flex gap-[32px]">
                            <Button
                                asChild
                                variant="outline"
                                className="flex-1 !bg-white !text-black hover:!bg-gray-200 rounded-2xl text-base min-h-[64px]"
                            >
                                <a
                                    href="/auth/oauth/github"
                                    className="flex items-center gap-2"
                                >
                                    <Github /> GitHub
                                </a>
                            </Button>
                            <Button
                                asChild
                                variant="outline"
                                className="flex-1 h-full !bg-white !text-black hover:!bg-gray-200 rounded-2xl text-base min-h-[64px]"
                            >
                                <a
                                    href="/auth/oauth/bitbucket"
                                    className="flex items-center gap-2"
                                >
                                    <Bitbucket /> BitBucket
                                </a>
                            </Button>
                            <Button
                                asChild
                                variant="outline"
                                className="flex-1 h-full !bg-white !text-black hover:!bg-gray-200 rounded-2xl text-base min-h-[64px]"
                            >
                                <a
                                    href="/auth/oauth/gitlab"
                                    className="flex items-center gap-2"
                                >
                                    <GitLab /> GitLab
                                </a>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
