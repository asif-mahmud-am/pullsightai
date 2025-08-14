"use client";

import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
    createContext,
    useContext,
    useLayoutEffect,
    useState,
    ReactNode,
    ElementType,
    Children,
    isValidElement,
} from "react";

// ------------------ Types ------------------
interface MenuItemProps {
    label: string;
    to?: string;
    icon?: ElementType;
}

interface SubMenuProps {
    id: string;
    label: string;
    icon?: ElementType;
    children?: ReactNode;
}

interface SidebarMenuProps {
    className?: string;
    children?: ReactNode;
}

interface SidebarMenuContextType {
    openSubMenu: string | null;
    setOpenSubMenu: (id: string | null) => void;
}

// ------------------ Context ------------------
const SidebarMenuContext = createContext<SidebarMenuContextType | null>(null);

const useSidebarMenu = () => {
    const context = useContext(SidebarMenuContext);
    if (!context) {
        throw new Error("useSidebarMenu must be used within SidebarMenu");
    }
    return context;
};

// ------------------ SidebarMenu ------------------
const SidebarMenu = ({ className, children }: SidebarMenuProps) => {
    const [openSubMenu, setOpenSubMenu] = useState<string | null>(null);

    return (
        <SidebarMenuContext.Provider value={{ openSubMenu, setOpenSubMenu }}>
            <div
                className={cn(
                    "overflow-y-auto scrollbar flex flex-col gap-1",
                    className
                )}
            >
                {children}
            </div>
        </SidebarMenuContext.Provider>
    );
};

SidebarMenu.displayName = "SidebarMenu";

// ------------------ MenuItem ------------------
const MenuItem = ({ label, to, icon: Icon }: MenuItemProps) => {
    const pathname = usePathname();
    const isActive =
        !!to &&
        (pathname === to || (to !== "/" && pathname.startsWith(to + "/")));

    const classes = cn(
        "flex items-center gap-3 px-4 py-2 rounded-md transition-all duration-200 hover:bg-gray-200",
        isActive ? "bg-gray-200 text-primary" : "text-gray-800"
    );

    const iconClasses = cn(
        "md:size-4 size-5 transition-all duration-200",
        isActive ? "text-primary" : "text-gray-400"
    );

    if (to) {
        return (
            <Link href={to} className={classes}>
                {Icon && <Icon className={iconClasses} />}
                <span className="font-medium md:text-[14px] text-[15px]">
                    {label}
                </span>
            </Link>
        );
    }

    return (
        <div className={classes}>
            {Icon && <Icon className={iconClasses} />}
            <span className="font-medium md:text-[14px] text-[15px]">
                {label}
            </span>
        </div>
    );
};

MenuItem.displayName = "SidebarMenuItem";

// ------------------ SubMenu ------------------
const SubMenu = ({ label, icon: Icon, children, id }: SubMenuProps) => {
    const { openSubMenu, setOpenSubMenu } = useSidebarMenu();
    const pathname = usePathname();
    const isThisSubMenuOpen = openSubMenu === id;

    const handleToggle = () => {
        setOpenSubMenu(isThisSubMenuOpen ? null : id);
    };

    // Auto-open submenu when route matches
    useLayoutEffect(() => {
        // const hasActiveChild = (nodes: ReactNode): boolean => {
        //     let found = false;
        //     Children.forEach(nodes, (child) => {
        //         if (isValidElement(child)) {
        //             const props = child.props;
        //             if (props?.to) {
        //                 const childPath = props.to;
        //                 if (
        //                     pathname === childPath ||
        //                     pathname.startsWith(childPath + "/")
        //                 ) {
        //                     found = true;
        //                 }
        //             }
        //             if (props?.children && hasActiveChild(props.children)) {
        //                 found = true;
        //             }
        //         }
        //     });
        //     return found;
        // };

        // if (hasActiveChild(children) && openSubMenu !== id) {
        //     setOpenSubMenu(id);
        // }
    }, [pathname, children, id, openSubMenu, setOpenSubMenu]);

    return (
        <Collapsible open={isThisSubMenuOpen} onOpenChange={handleToggle}>
            <CollapsibleTrigger asChild>
                <div
                    className="flex items-center gap-3 px-4 py-[11px] cursor-pointer"
                    role="button"
                    tabIndex={0}
                >
                    {Icon && <Icon className="w-4 h-4 text-gray-400" />}
                    <span className="font-medium text-[14px]">{label}</span>
                    <ChevronDown
                        className={cn(
                            "w-4 h-4 text-gray-400 ml-auto transition-transform duration-300",
                            { "rotate-180": isThisSubMenuOpen }
                        )}
                    />
                </div>
            </CollapsibleTrigger>
            <CollapsibleContent>
                <div className="ml-6 flex flex-col gap-1">{children}</div>
            </CollapsibleContent>
        </Collapsible>
    );
};

SubMenu.displayName = "SidebarSubMenu";

export default SidebarMenu;
