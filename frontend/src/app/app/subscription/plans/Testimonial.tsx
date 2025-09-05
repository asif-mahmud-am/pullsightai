import { Users, Building2, Code } from "lucide-react";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    type CarouselApi,
} from "@/components/ui/carousel";
import { useEffect, useState } from "react";

const testimonials = [
    {
        id: 1,
        quote: "PullSight gave us the speed and confidence we needed—without ever risking our IP. Our 150-person engineering team now ships 40% faster.",
        author: "Sophia Kim",
        position: "Head of Engineering",
        company: "TechCorp",
        icon: Users,
        gradient: "from-green-500 to-teal-500",
    },
    {
        id: 2,
        quote: "The AI-powered code reviews have significantly improved our code quality. We've reduced bugs by 60% since implementing PullSight.",
        author: "Michael Chen",
        position: "Senior Developer",
        company: "StartupX",
        icon: Code,
        gradient: "from-blue-500 to-purple-500",
    },
    {
        id: 3,
        quote: "PullSight's privacy-first approach gave us the confidence to use AI for code review. SOC2 compliance was exactly what we needed.",
        author: "Sarah Johnson",
        position: "CTO",
        company: "SecureApp Inc",
        icon: Building2,
        gradient: "from-purple-500 to-pink-500",
    },
];

const Testimonial = () => {
    const [api, setApi] = useState<CarouselApi>();
    const [current, setCurrent] = useState(0);

    useEffect(() => {
        if (!api) {
            return;
        }

        setCurrent(api.selectedScrollSnap());

        api.on("select", () => {
            setCurrent(api.selectedScrollSnap());
        });
    }, [api]);

    return (
        <div className="w-full max-w-4xl mx-auto">
            <Carousel setApi={setApi} className="w-full">
                <CarouselContent>
                    {testimonials.map((testimonial) => {
                        const IconComponent = testimonial.icon;
                        return (
                            <CarouselItem key={testimonial.id}>
                                <div
                                    className={`bg-gradient-to-br ${testimonial.gradient} rounded-2xl p-8 text-white relative overflow-hidden`}
                                >
                                    <div className="relative z-10">
                                        <div className="flex items-center justify-center mb-6">
                                            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                                                <IconComponent className="w-8 h-8" />
                                            </div>
                                        </div>
                                        <blockquote className="text-xl font-medium text-center mb-6 max-w-3xl mx-auto">
                                            &ldquo;{testimonial.quote}&rdquo;
                                        </blockquote>
                                        <div className="text-center">
                                            <p className="font-medium">
                                                {testimonial.author}, {testimonial.position}
                                            </p>
                                            <p className="text-sm opacity-80 mt-1">
                                                {testimonial.company}
                                            </p>
                                        </div>
                                    </div>
                                    <div className={`absolute inset-0 bg-gradient-to-r ${testimonial.gradient}/50`}></div>
                                </div>
                            </CarouselItem>
                        );
                    })}
                </CarouselContent>
            </Carousel>
            
            {/* Dot Navigation */}
            <div className="flex justify-center mt-6 space-x-2">
                {testimonials.map((_, index) => (
                    <button
                        key={index}
                        className={`w-3 h-3 rounded-full transition-all duration-300 ${
                            index === current
                                ? "bg-white shadow-lg scale-110"
                                : "bg-white/40 hover:bg-white/60"
                        }`}
                        onClick={() => api?.scrollTo(index)}
                    />
                ))}
            </div>
        </div>
    );
};

export default Testimonial;
