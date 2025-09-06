import { Loader } from "lucide-react";

const PageLoader = () => {
    return (
        <div className="w-screen fixed left-0 right-0 bottom-0 xl:top-[88px] top-[60px] flex items-center justify-center bg-background">
            <Loader className="animate-spin" />
        </div>
    );
};

export default PageLoader;
