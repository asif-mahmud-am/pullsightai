import { Users } from "lucide-react";

const Testimonial = () => {
    return (
        <div className="bg-gradient-to-br from-green-500 to-teal-500 rounded-2xl p-8 text-white relative overflow-hidden">
            <div className="relative z-10">
                <div className="flex items-center justify-center mb-6">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                        <Users className="w-8 h-8" />
                    </div>
                </div>
                <blockquote className="text-xl font-medium text-center mb-6 max-w-3xl mx-auto">
                    &ldquo;PullSight gave us the speed and confidence we
                    needed—without ever risking our IP. Our 150-person
                    engineering team now ships 40% faster.&rdquo;
                </blockquote>
                <div className="text-center">
                    <p className="font-medium">
                        Sophia Kim, Head of Engineering
                    </p>
                </div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/50 to-teal-500/50"></div>
        </div>
    );
};

export default Testimonial;
