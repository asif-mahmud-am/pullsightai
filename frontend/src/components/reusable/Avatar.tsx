import { cn } from "@/lib/utils";
import Image from "next/image";
import { FC, memo, useMemo, useState } from "react";

interface Props {
    src: string;
    className?: string;
    name?: string;
    description?: string;
    hideDetails?: boolean;
}

const Avatar: FC<Props> = ({
    src,
    className,
    name,
    description,
    hideDetails = false,
}) => {
    const [hasError, setHasError] = useState(false);
    const random = Math.floor(Math.random() * 7) + 1;
    const bgClass = useMemo(() => {
        return {
            1: "bg-red-200 text-red-800",
            2: "bg-yellow-200 text-yellow-800",
            3: "bg-green-200 text-green-800",
            4: "bg-blue-200 text-blue-800",
            5: "bg-indigo-200 text-indigo-800",
            6: "bg-purple-200 text-purple-800",
            7: "bg-pink-200 text-pink-800",
        }[random];
    }, [random]);

    return (
        <div className={cn("flex items-center gap-2", className)}>
            {src && !hasError ? (
                <Image
                    src={src}
                    alt=""
                    className={`border rounded-full`}
                    height={36}
                    width={36}
                    onError={() => setHasError(true)}
                />
            ) : (
                <div
                    className={`w-9 h-9 flex items-center justify-center rounded-full ${bgClass}`}
                >
                    <div className="font-medium capitalize">
                        {name?.charAt(0)}
                    </div>
                </div>
            )}
            {!hideDetails && (
                <div>
                    <div className="font-medium">{name}</div>
                    <div className="text-[12px] text-slate-400">
                        {description}
                    </div>
                </div>
            )}
        </div>
    );
};

export default memo(Avatar);
