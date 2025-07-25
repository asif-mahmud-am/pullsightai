import {
    Bitbucket,
    Github,
    GitLab,
    StarBullet,
} from "@/components/common/icons";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import Link from "next/link";

const RegisterPage = () => {
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

                        <Image
                            src="/images/star-left.png"
                            alt=""
                            width={400}
                            height={492}
                            className="absolute left-0 bottom-0 w-[150px]"
                        />
                        <Image
                            src="/images/star-right.png"
                            alt=""
                            width={219}
                            height={335}
                            className="absolute right-0 top-0 w-[150px]"
                        />
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
                                Create an Account
                            </h2>

                            <p className="text-[var(--subtitle-500)] text-sm">
                                <span>Already have an account?</span>
                                <span> </span>
                                <Link href="/auth/login" className="underline">
                                    Log in
                                </Link>
                            </p>
                        </div>

                        <div className="flex flex-col gap-[32px] mt-10">
                            <div className="flex gap-x-4 w-full">
                                <Button
                                    asChild
                                    variant="outline"
                                    className="flex-1 !bg-white !text-black hover:!bg-gray-200 rounded-2xl text-base min-h-[64px]"
                                >
                                    <Link
                                        // href={createOauthUrl('github')}
                                        // href={"/auth/oauth/github"}
                                        href={"/onboarding/step-1"}
                                        className="flex items-center gap-2"
                                    >
                                        <Github /> GitHub
                                    </Link>
                                </Button>
                                <Button
                                    asChild
                                    variant="outline"
                                    className="flex-1 h-full !bg-white !text-black hover:!bg-gray-200 rounded-2xl text-base min-h-[64px]"
                                >
                                    <a
                                        // href={createOauthUrl('bitbucket')}
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
                                        // href={createOauthUrl('bitbucket')}
                                        className="flex items-center gap-2"
                                    >
                                        <GitLab /> GitLab
                                    </a>
                                </Button>
                            </div>

                            <Separator />

                            <ul className="space-y-4">
                                <li className="flex items-center gap-3 text-sm text-[var(--title-50)]">
                                    <div className="shrink-0">
                                        <StarBullet />
                                    </div>
                                    <span>
                                        Join 100+ happy engineering teams.
                                    </span>
                                </li>
                                <li className="flex items-center gap-3 text-sm text-[var(--title-50)]">
                                    <div className="shrink-0">
                                        <StarBullet />
                                    </div>
                                    <span>
                                        Be part of a community you can develop
                                        yourself.
                                    </span>
                                </li>
                                <li className="flex items-center gap-3 text-sm text-[var(--title-50)]">
                                    <div className="shrink-0">
                                        <StarBullet />
                                    </div>
                                    <span>
                                        Seamlessly integrates with your existing
                                        workflow.
                                    </span>
                                </li>
                                <li className="flex items-center gap-3 text-sm text-[var(--title-50)]">
                                    <div className="shrink-0">
                                        <StarBullet />
                                    </div>
                                    <span>
                                        We don&apos;t store any part of your
                                        code.
                                    </span>
                                </li>
                            </ul>

                            <Separator />

                            <div className="flex items-center gap-x-12">
                                <div className="flex items-center gap-2 text-xs text-[var(--title-50)]">
                                    <Image
                                        src="/images/soc.svg"
                                        alt=""
                                        height={32}
                                        width={32}
                                    />
                                    <span className="">
                                        SOC2 <br /> Compliant
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-[var(--title-50)]">
                                    <Image
                                        src="/images/open-source.svg"
                                        alt=""
                                        height={32}
                                        width={32}
                                    />
                                    <span>
                                        Open <br /> Source
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-[var(--title-50)]">
                                    <Image
                                        src="/images/ssl.svg"
                                        alt=""
                                        height={32}
                                        width={25}
                                    />
                                    <span>
                                        SSL <br /> Encryption
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
