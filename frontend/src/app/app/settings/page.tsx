"use client";

import ContentCard from "@/components/reusable/ContentCard";
import Switch from "@/components/reusable/Switch";
import Input from "@/components/reusable/Input";
import Select from "@/components/reusable/Select";
import { useState } from "react";
import { useUpdateWorkspaceSettingsMutation } from "@/api/queries/workspace";
import Alert from "@/components/reusable/Alert";
import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";

const claudeModels = [
    { value: "claude-3-5-sonnet-20241022", label: "Claude 3.5 Sonnet" },
    { value: "claude-3-5-haiku-20241022", label: "Claude 3.5 Haiku" },
    { value: "claude-3-opus-20240229", label: "Claude 3 Opus" },
    { value: "claude-3-sonnet-20240229", label: "Claude 3 Sonnet" },
    { value: "claude-3-haiku-20240307", label: "Claude 3 Haiku" },
];

const SettingsPage = () => {
    const [useOwnApiKey, setUseOwnApiKey] = useState(false);
    const [apiKey, setApiKey] = useState("");
    const [selectedModel, setSelectedModel] = useState(
        "claude-3-5-sonnet-20241022"
    );

    const {
        mutateAsync: updateWorkspaceSettings,
        error,
        isPending,
    } = useUpdateWorkspaceSettingsMutation();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        const newErrors: { apiKey?: string; model?: string } = {};
        if (useOwnApiKey && !apiKey.trim()) {
            newErrors.apiKey = "API Key is required when using own API key";
        }
        if (useOwnApiKey && !selectedModel) {
            newErrors.model = "Please select a model";
        }

        if (Object.keys(newErrors).length > 0) {
            return;
        }

        // Prepare payload
        const payload = {
            useOwnApiKey,
            apiKey: useOwnApiKey ? apiKey : null,
            model: useOwnApiKey ? selectedModel : null,
        };

        await updateWorkspaceSettings(payload);
    };

    const handleSwitchChange = (checked: boolean) => {
        setUseOwnApiKey(checked);
        // Clear form when disabling
        if (!checked) {
            setApiKey("");
            setSelectedModel("claude-3-5-sonnet-20241022");
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-semibold text-neutral-900 dark:text-white">
                    Settings
                </h1>
                <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
                    Manage your account settings and API configuration.
                </p>
            </div>

            {/* Settings Card */}
            <ContentCard className="">
                {/* Section Header */}
                <ContentCard.Header className="flex-col items-start">
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                        API Configuration
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-neutral-400">
                        Configure your Claude API settings for personalized
                        usage.
                    </p>
                </ContentCard.Header>

                {/* Form Content */}
                <ContentCard.Body className="px-6 py-6">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* API Key Toggle Section */}
                        <div className="flex items-start justify-between">
                            <div className="flex-1 mr-8">
                                <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                                    Use your own API key
                                </h4>
                                <p className="mt-1 text-sm text-gray-500 dark:text-neutral-400">
                                    Enable this to use your own Claude API key.
                                    This gives you more control and higher rate
                                    limits.
                                </p>
                            </div>
                            <Switch
                                checked={useOwnApiKey}
                                onCheckedChange={handleSwitchChange}
                            />
                        </div>

                        {/* Conditional API Configuration */}
                        {useOwnApiKey && (
                            <div className="space-y-6 pt-6 border-t border-gray-200 dark:border-gray-800">
                                <Input
                                    label="API Key"
                                    type="password"
                                    value={apiKey}
                                    onValueChange={setApiKey}
                                    placeholder="sk-ant-api03-..."
                                    description="Your Claude API key from Anthropic Console"
                                    // error={errors.apiKey}
                                    required
                                    className=""
                                />
                                <Select
                                    label="Claude Model"
                                    options={claudeModels}
                                    value={selectedModel}
                                    onChange={setSelectedModel}
                                    // error={errors.model}
                                    required
                                />

                                <Alert
                                    variant="info"
                                    icon={<Info />}
                                    title="About Claude Models"
                                    description="Claude 3.5 Sonnet offers the best balance of intelligence and speed. Choose Haiku for faster responses or Opus for the most complex tasks."
                                />
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex justify-end pt-6 border-t gap-x-3 border-gray-200 dark:border-gray-800">
                            <Button
                                type="submit"
                                disabled={isPending}
                                className="min-w-[120px]"
                            >
                                {isPending ? "Saving..." : "Save changes"}
                            </Button>
                        </div>
                    </form>
                </ContentCard.Body>
            </ContentCard>
        </div>
    );
};

export default SettingsPage;
