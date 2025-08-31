"use client";

import { useState } from "react";
import { Settings, Save, X } from "lucide-react";
import Dialog from "@/components/reusable/Dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Repository } from "@/types/repository";
import { showToast } from "@/lib/toast";
import Select from "@/components/reusable/Select";
import { useUpdateRepositoryMutation } from "@/api/queries/workspace";

interface RepositorySettingsModalProps {
    repository: Repository;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

interface RepositorySettings {
    minSeverity: "info" | "minor" | "major" | "critical" | "blocker";
    ignore: string;
}

const severityOptions = [
    { value: "info", label: "Info" },
    { value: "minor", label: "Minor" },
    { value: "major", label: "Major" },
    { value: "critical", label: "Critical" },
    { value: "blocker", label: "Blocker" },
];

const RepositorySettingsModal = ({
    repository,
    open,
    onOpenChange,
}: RepositorySettingsModalProps) => {
    const [settings, setSettings] = useState<RepositorySettings>({
        minSeverity: "info",
        ignore: "",
    });

    const { mutateAsync, isPending } = useUpdateRepositoryMutation();

    const handleSave = async () => {
        await mutateAsync({
            id: repository._id,
            data: settings,
        });
    };

    const handleClose = () => {
        if (!isPending) {
            onOpenChange(false);
            // Reset settings to original values
            setSettings({
                minSeverity: "info",
                ignore: "",
            });
        }
    };

    return (
        <Dialog
            open={open}
            onOpenChange={handleClose}
            title={`Repository Settings - ${repository.name}`}
            description="Configure analysis settings for this repository"
            size="md"
            actions={[
                {
                    label: "Cancel",
                    onClick: handleClose,
                    variant: "outline",
                    disabled: isPending,
                },
                {
                    label: "Save Settings",
                    onClick: handleSave,
                    variant: "default",
                    loading: isPending,
                },
            ]}
            closeOnOverlayClick={!isPending}
        >
            <div className="space-y-6">
                {/* Minimum Severity Level */}
                <div className="space-y-2">
                    <Label
                        htmlFor="severity-select"
                        className="text-base font-medium"
                    >
                        Minimum Severity Level
                    </Label>
                    <p className="text-sm text-gray-500">
                        Only report issues at this severity level or higher
                    </p>
                    <Select
                        value={settings.minSeverity}
                        onChange={(value) =>
                            setSettings((prev) => ({
                                ...prev,
                                minSeverity:
                                    value as RepositorySettings["minSeverity"],
                            }))
                        }
                        options={severityOptions}
                        disabled={isPending}
                        className="w-full"
                    />
                </div>

                {/* Ignored Files */}
                <div className="space-y-2">
                    <Label
                        htmlFor="ignored-files"
                        className="text-base font-medium"
                    >
                        Ignored Files & Folders
                    </Label>
                    <p className="text-sm text-gray-500">
                        Specify files and folders to exclude from analysis (one
                        per line, supports glob patterns like *.min.js)
                    </p>
                    <Textarea
                        id="ignored-files"
                        placeholder={`# Example patterns:\n*.min.js\ndist/\nnode_modules/\n**/*.test.ts\nvendor/\n.env*`}
                        value={settings.ignore}
                        onChange={(e) =>
                            setSettings((prev) => ({
                                ...prev,
                                ignore: e.target.value,
                            }))
                        }
                        disabled={isPending}
                        rows={6}
                        className="font-mono text-sm"
                    />
                    <p className="text-xs text-gray-400">
                        Use gitignore-style patterns. Lines starting with # are
                        treated as comments.
                    </p>
                </div>
            </div>
        </Dialog>
    );
};

export default RepositorySettingsModal;
