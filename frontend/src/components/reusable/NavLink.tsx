"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils"; // optional helper for conditional classes

type NavLinkProps = {
    href: string;
    children: React.ReactNode;
    exact?: boolean;
    activeClassName?: string;
    className?: string;
};

export function NavLink({
    href,
    children,
    exact = false,
    activeClassName = "",
    className,
}: NavLinkProps) {
    const pathname = usePathname();

    const isActive = exact ? pathname === href : pathname.startsWith(href);

    return (
        <Link
            href={href}
            className={cn(className, isActive && activeClassName)}
            aria-current={isActive ? "page" : undefined}
        >
            {children}
        </Link>
    );
}
