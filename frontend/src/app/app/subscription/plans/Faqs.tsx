import Badge from "@/components/reusable/Badge";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

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

            <div className="col-span-8 col-start-7">
                <Accordion type="single" collapsible className="w-full space-y-4">
                    <AccordionItem 
                        value="item-1" 
                        className="border rounded-xl data-[state=open]:bg-card data-[state=closed]:bg-transparent transition-colors"
                    >
                        <AccordionTrigger className="text-left px-6 py-4 hover:no-underline font-semibold">
                            Worried about spammy AI feedback?
                        </AccordionTrigger>
                        <AccordionContent className="px-6 pb-6 text-muted-foreground">
                            Our AI is trained specifically for code review, not
                            generic text generation. We focus on actionable
                            insights, not verbose explanations.
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem 
                        value="item-2" 
                        className="border rounded-xl data-[state=open]:bg-card data-[state=closed]:bg-transparent transition-colors"
                    >
                        <AccordionTrigger className="text-left px-6 py-4 hover:no-underline font-semibold">
                            Concerned about code privacy?
                        </AccordionTrigger>
                        <AccordionContent className="px-6 pb-6 text-muted-foreground">
                            Zero code retention policy and comprehensive data
                            protection. Your data is encrypted in transit and at
                            rest. SOC2 type II certified to keep data extremely
                            secure.
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem 
                        value="item-3" 
                        className="border rounded-xl data-[state=open]:bg-card data-[state=closed]:bg-transparent transition-colors"
                    >
                        <AccordionTrigger className="text-left px-6 py-4 hover:no-underline font-semibold">
                            Think open-source means complexity?
                        </AccordionTrigger>
                        <AccordionContent className="px-6 pb-6 text-muted-foreground">
                            We believe in transparency and community-driven
                            development. Our open-source approach means faster fixes
                            and better features.
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem 
                        value="item-4" 
                        className="border rounded-xl data-[state=open]:bg-card data-[state=closed]:bg-transparent transition-colors"
                    >
                        <AccordionTrigger className="text-left px-6 py-4 hover:no-underline font-semibold">
                            Worried automation misses context?
                        </AccordionTrigger>
                        <AccordionContent className="px-6 pb-6 text-muted-foreground">
                            Our AI understands your codebase context, coding
                            standards, and team preferences. It learns from your
                            patterns to provide relevant, contextual feedback.
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </div>
        </div>
    );
};

export default FAQs;
