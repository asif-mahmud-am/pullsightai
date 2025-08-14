"use client"; // <-- Add this

import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ColumnDef } from "@tanstack/react-table";
import { Repository } from "@/types/repository";
import { PullRequest } from "@/types/pullRequest";

export const columns: ColumnDef<PullRequest>[] = [
    {
        accessorKey: "PR Title",
        header: "PR Title",
        cell: ({ row }) => {
            const active = row.getValue("active") as boolean;
            return <Switch checked={active} />;
        },
    },
    {
        accessorKey: "author",
        header: "Author",
        cell: ({ row }) => {
            const author = row.getValue("author") as
                | { name: string; avatar: string }
                | undefined;

            if (!author) {
                return <span className="text-gray-500"></span>; // fallback display
            }

            return (
                <div className="flex items-center gap-2">
                    <Avatar className="w-6 h-6">
                        <AvatarImage src={author.avatar} />
                        <AvatarFallback>{author.name[0]}</AvatarFallback>
                    </Avatar>
                    <span className="text-gray-300">{author.name}</span>
                </div>
            );
        },
    },
    {
        accessorKey: "title",
        header: "Repository name",
        cell: ({ row }) => {
            const title = row.getValue("title") as string;
            return (
                <span className="text-white hover:underline cursor-pointer">
                    {title}
                </span>
            );
        },
    },

    {
        accessorKey: "updated",
        header: "Updated",
        cell: ({ row }) => {
            const updated = row.getValue("updated") as string | undefined;
            return (
                <span className="text-gray-400">{updated || ""}</span> // fallback if empty
            );
        },
    },
];
