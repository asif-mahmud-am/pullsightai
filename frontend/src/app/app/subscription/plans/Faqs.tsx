import Badge from "@/components/reusable/Badge";

const FAQs = () => {
    return (
        <div className="max-w-8xl mx-auto grid grid-cols-12 mb-20">
            <div className="col-span-4 mb-8">
                <Badge className="mb-4 bg-gradient-to-r from-blue-300 to-purple-300 text-neutral-800 border-0 rounded-2xl h-7 px-4">
                    FAQ
                </Badge>
                <h2 className="text-4xl font-bold mb-2">
                    No Noise. No Surprises. Just Clarity.
                </h2>
                <p className="text-neutral-500">
                    From privacy to accuracy, here’s how PullSight addresses
                    your key concerns.
                </p>
            </div>

            <div className="col-span-8 col-start-7 space-y-4">
                <details className="group border rounded-xl p-6 bg-card">
                    <summary className="flex items-center justify-between cursor-pointer font-semibold">
                        <span>Worried about spammy AI feedback?</span>
                        <span className="group-open:rotate-45 transition-transform">
                            +
                        </span>
                    </summary>
                    <div className="mt-4 text-muted-foreground">
                        Our AI is trained specifically for code review, not
                        generic text generation. We focus on actionable
                        insights, not verbose explanations.
                    </div>
                </details>

                <details className="group border rounded-xl p-6 bg-card">
                    <summary className="flex items-center justify-between cursor-pointer font-semibold">
                        <span>Concerned about code privacy?</span>
                        <span className="group-open:rotate-45 transition-transform">
                            +
                        </span>
                    </summary>
                    <div className="mt-4 text-muted-foreground">
                        Zero code retention policy and comprehensive data
                        protection. Your data is encrypted in transit and at
                        rest. SOC2 type II certified to keep data extremely
                        secure.
                    </div>
                </details>

                <details className="group border rounded-xl p-6 bg-card">
                    <summary className="flex items-center justify-between cursor-pointer font-semibold">
                        <span>Think open-source means complexity?</span>
                        <span className="group-open:rotate-45 transition-transform">
                            +
                        </span>
                    </summary>
                    <div className="mt-4 text-muted-foreground">
                        We believe in transparency and community-driven
                        development. Our open-source approach means faster fixes
                        and better features.
                    </div>
                </details>

                <details className="group border rounded-xl p-6 bg-card">
                    <summary className="flex items-center justify-between cursor-pointer font-semibold">
                        <span>Worried automation misses context?</span>
                        <span className="group-open:rotate-45 transition-transform">
                            +
                        </span>
                    </summary>
                    <div className="mt-4 text-muted-foreground">
                        Our AI understands your codebase context, coding
                        standards, and team preferences. It learns from your
                        patterns to provide relevant, contextual feedback.
                    </div>
                </details>
            </div>
        </div>
    );
};

export default FAQs;
