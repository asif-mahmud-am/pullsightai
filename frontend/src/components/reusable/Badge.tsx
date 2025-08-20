import { FC, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Badge as ShadBadge } from "../ui/badge";

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
    className?: string;
    children?: ReactNode;
    variant?: "default" | "secondary" | "destructive" | "primary" | "success";
    type?: "solid" | "outline" | "faded";
}

const variantClasses: Record<string, string> = {
    default: "bg-primary text-primary-foreground border-transparent",
    secondary: "bg-secondary text-secondary-foreground border-transparent",
    destructive: "bg-destructive text-white border-transparent",
    primary: "bg-blue-600 text-white border-transparent",
    success: "bg-green-600 text-white border-transparent",
};

const typeClasses: Record<string, string> = {
    solid: "",
    outline: "bg-transparent border border-current text-inherit",
    faded: "bg-opacity-20 text-inherit",
};

const Badge: FC<BadgeProps> = ({
    className,
    variant = "default",
    type = "solid",
    ...rest
}) => {
    return (
        <ShadBadge
            className={cn(
                "inline-flex items-center justify-center rounded-xl capitalize px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 gap-1 transition-colors",
                variantClasses[variant],
                typeClasses[type],
                className
            )}
            {...rest}
        />
    );
};

export default Badge;
