"use client";
import React, { FC } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { formatDate } from "@/lib/dayjs";

// Helper function to determine grid column class
const getGridColsClass = (
    hasStatus: boolean,
    hasUpdatedAt: boolean
): string => {
    if (hasStatus && hasUpdatedAt) return "grid-cols-6";
    if (hasStatus || hasUpdatedAt) return "grid-cols-5";
    return "grid-cols-4";
};

export interface SelectableItem {
    id: string;
    title: string;
    subtitle?: string;
    timestamp?: string;
    updatedAt?: string;
    avatar?: string | null; // optional avatar URL
    status?: { label: string; colorClass: string }; // optional badge (Merged, Active etc.)
}

interface SelectableListProps {
    items: SelectableItem[];
    selectedId?: string;
    onSelect?: (id: string) => void;
    className?: string;
}

const SelectableList: FC<SelectableListProps> = ({
    items,
    selectedId,
    onSelect,
    className = "",
}) => {
    // Check if any items have a status or updatedAt
    const hasStatusItems = items.some((item) => item.status);
    const hasUpdatedAtItems = items.some((item) => item.updatedAt);
    return (
        <div className="w-full bg-[var(--body-900)] rounded-xl shadow-lg">
            {/* Column Headers */}
            <div
                className={`grid ${getGridColsClass(
                    hasStatusItems,
                    hasUpdatedAtItems
                )} px-4 py-2 text-[var(--subtitle-400)] text-sm font-medium`}
            >
                <div className="col-span-2 pl-8">Title</div>
                <div className="col-span-1 pl-1">Author</div>
                {hasStatusItems && (
                    <div className="col-span-1 text-center">Status</div>
                )}
                <div className="text-right pr-3">Created at</div>
                {hasUpdatedAtItems && (
                    <div className="text-right pr-4">Updated at</div>
                )}
            </div>

            <RadioGroup
                value={selectedId}
                onValueChange={onSelect}
                className={`gap-2 space-y-2 border border-[var(--box-800)] rounded-2xl p-4 w-full max-h-[250px] overflow-y-auto ${className}`}
            >
                {items.map((item) => (
                    <div
                        key={item.id}
                        className={`grid ${getGridColsClass(
                            hasStatusItems,
                            hasUpdatedAtItems
                        )} p-4 items-center rounded-2xl cursor-pointer ${
                            selectedId === item.id
                                ? "bg-[var(--box-800)]"
                                : "bg-[var(--body-900)]"
                        }`}
                        onClick={() => onSelect?.(item.id)}
                    >
                        <div className="flex items-center col-span-2">
                            <RadioGroupItem
                                value={item.id}
                                id={`item-${item.id}`}
                            />
                            <Label
                                htmlFor={`item-${item.id}`}
                                className="text-[var(--title-50)] text-base font-medium ml-3 cursor-pointer"
                            >
                                {item.title}
                            </Label>
                        </div>

                        <div className="flex items-center col-span-1">
                            <div className="flex items-center">
                                <div className="w-8 h-8 rounded-full overflow-hidden bg-[var(--subtitle-500)] flex items-center justify-center mr-2">
                                    {item.avatar ? (
                                        <Image
                                            src={item.avatar}
                                            alt={item.subtitle || ""}
                                            className="w-full h-full object-cover"
                                            width={32}
                                            height={32}
                                        />
                                    ) : (
                                        <span className="text-[var(--title-50)] text-sm">
                                            {item.subtitle?.charAt(0) || "?"}
                                        </span>
                                    )}
                                </div>
                                <p className="text-[var(--subtitle-500)] text-sm">
                                    {item.subtitle || "Unknown"}
                                </p>
                            </div>
                        </div>

                        {hasStatusItems && (
                            <div className="flex items-center justify-center col-span-1">
                                {item.status && (
                                    <span
                                        className={`px-2 py-1 rounded-full text-xs font-medium ${item.status.colorClass}`}
                                    >
                                        {item.status.label}
                                    </span>
                                )}
                            </div>
                        )}

                        <div className="flex items-center justify-end">
                            <p className="text-[var(--subtitle-500)] text-sm whitespace-nowrap">
                                {item.timestamp
                                    ? formatDate(item.timestamp as string)
                                    : "N/A"}
                            </p>
                        </div>

                        {hasUpdatedAtItems && (
                            <div className="flex items-center justify-end">
                                <p className="text-[var(--subtitle-500)] text-sm whitespace-nowrap">
                                    {item.updatedAt || "N/A"}
                                </p>
                            </div>
                        )}
                    </div>
                ))}
            </RadioGroup>
        </div>
    );
};

export default SelectableList;
