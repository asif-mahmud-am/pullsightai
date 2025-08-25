"use client";
import React, { ReactNode } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";

interface SelectableListProps<TItem> {
    selectedId?: string;
    onSelect?: (id: string) => void;
    wrapperClassName?: string;
    className?: string;
    itemClassName?: string;
    items: TItem[];
    getKey: (item: TItem) => string;
    renderHeader?: () => ReactNode;
    renderItem?: (
        item: TItem,
        opts: {
            checked: boolean;
        }
    ) => ReactNode;
}

const SelectableList = <TItem,>({
    items,
    selectedId,
    onSelect,
    wrapperClassName = "",
    className = "",
    itemClassName = "",
    renderHeader,
    renderItem,
    getKey,
}: SelectableListProps<TItem>) => {
    return (
        <div className={cn(wrapperClassName)}>
            {renderHeader && <div className="py-2px-4">{renderHeader()}</div>}
            <RadioGroup
                value={selectedId}
                onValueChange={onSelect}
                className={cn("gap-2 w-full", className)}
            >
                {items.map((item: TItem) => {
                    const key = getKey(item);
                    const checked = selectedId === key;
                    return (
                        <div
                            key={key}
                            onClick={() => onSelect?.(key)}
                            className={cn(
                                "flex items-center gap-5 cursor-pointer rounded-lg py-3 px-4",
                                checked ? "bg-white/5" : "",
                                itemClassName
                            )}
                        >
                            <RadioGroupItem
                                value={key}
                                id={`item-${key}`}
                                checked={checked}
                                className=""
                            />
                            {renderItem ? renderItem(item, { checked }) : null}
                        </div>
                    );
                })}
            </RadioGroup>
        </div>
    );
};

export default SelectableList;
