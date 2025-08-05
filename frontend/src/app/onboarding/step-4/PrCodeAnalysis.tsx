import type React from "react";
import { useState } from "react";
import Markdown from "react-markdown";

import { Badge } from "@/components/ui/badge";
import {
    AlertTriangle,
    Info,
    AlertCircle,
    GitPullRequest,
    GitMerge,
    ExternalLink,
} from "lucide-react";
import { PRAnalysisData } from "@/types/prAnalysis";
import { humanizeDate } from "@/lib/dayjs";
import { Button } from "@/components/ui/button";

const PrCodeAnalysis: React.FC<{ data: PRAnalysisData }> = ({ data }) => {
    const [showAllComments, setShowAllComments] = useState(true);

    const { pull_request: pr, analysis } = data;

    // Filter out any null comments to prevent crashes
    const validComments = analysis.comments
        ? analysis.comments.filter(Boolean)
        : [];

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case "high":
                return "bg-red-900/30 text-red-300 border-red-700";
            case "medium":
                return "bg-yellow-900/30 text-yellow-300 border-yellow-700";
            case "low":
                return "bg-blue-900/30 text-blue-300 border-blue-700";
            default:
                return "bg-gray-900/30 text-gray-300 border-gray-700";
        }
    };

    const displayedComments = showAllComments
        ? validComments
        : validComments.slice(0, 3);

    return (
        <div className="bg-[var(--body-900)] rounded-xl text-gray-100 font-sans">
            {/* PR Header */}
            <div className="border-b border-gray-700 p-4">
                <div className="flex items-start gap-3">
                    <div className="w-10 h-10">
                        {pr.pr_user && (
                            <div className="w-10 h-10 rounded-full bg-gray-700 text-gray-200 flex items-center justify-center font-bold">
                                {pr.pr_user.slice(0, 2).toUpperCase()}
                            </div>
                            // ) : (
                            //     <img
                            //         src={pr.user.avatar_url}
                            //         alt={pr.user.login}
                            //         className="w-10 h-10 rounded-full"
                            //         onError={() => setAvatarError(true)}
                            //     />
                        )}
                    </div>

                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="font-semibold text-gray-200">
                                {pr.pr_user}
                            </span>
                            <Badge className="bg-purple-900/30 text-purple-300 border-purple-700">
                                {pr.merged ? (
                                    <GitMerge className="w-3 h-3 mr-1" />
                                ) : (
                                    <GitPullRequest className="w-3 h-3 mr-1" />
                                )}
                                PR #{pr.pr_number} • {pr.pr_state}
                            </Badge>
                            <span className="text-gray-400 text-sm">
                                {humanizeDate(pr.pr_created_at)}
                            </span>
                            <a
                                href={pr.html_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="cursor-pointer text-gray-400 hover:text-gray-200"
                            >
                                <ExternalLink className="w-4 h-4" />
                            </a>
                        </div>

                        <h3 className="text-lg font-semibold text-gray-200 mb-2">
                            {pr.pr_title}
                        </h3>

                        <div className="flex items-center gap-4 text-sm text-gray-400">
                            <span className="text-green-400">
                                +{pr.pr_additions}
                            </span>
                            <span className="text-red-400">
                                -{pr.pr_deletions}
                            </span>
                            <span>
                                {pr.pr_files_changed} file
                                {pr.pr_files_changed !== 1 ? "s" : ""} changed
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* AI Analysis Summary */}
            <div className="border-b border-gray-700 p-4">
                <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                        <span className="text-white text-sm font-bold">AI</span>
                    </div>

                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="font-semibold text-gray-200">
                                PullSight AI
                            </span>
                            <Badge className="bg-blue-900/30 text-blue-300 border-blue-700">
                                Code Analysis Complete
                            </Badge>
                        </div>

                        <div className="text-gray-300 text-sm mb-3">
                            <Markdown remarkPlugins={[]}>
                                {analysis.summary}
                            </Markdown>
                        </div>

                        <div className="flex items-center gap-4 text-xs text-gray-400">
                            <span className="flex items-center gap-1">
                                <AlertCircle className="w-3 h-3 text-red-400" />
                                {
                                    validComments.filter(
                                        (c) => c.severity === "critical"
                                    ).length
                                }{" "}
                                Critical
                            </span>
                            <span className="flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3 text-yellow-400" />
                                {
                                    validComments.filter(
                                        (c) => c.severity === "warning"
                                    ).length
                                }{" "}
                                Warnings
                            </span>
                            <span className="flex items-center gap-1">
                                <Info className="w-3 h-3 text-blue-400" />
                                {
                                    validComments.filter(
                                        (c) => c.severity === "info"
                                    ).length
                                }{" "}
                                Info
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* AI Comments */}
            {displayedComments.map((comment, index) => (
                <div key={index} className="border-b border-gray-700 p-4">
                    <div className="flex items-start gap-3">
                        <div className="flex-1 max-w-full">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="font-semibold text-gray-200 text-sm">
                                    PullSight AI
                                </span>
                                <Badge
                                    className={`text-xs ${getSeverityColor(
                                        comment.severity?.toLowerCase()
                                    )}`}
                                >
                                    Severity:{" "}
                                    {comment.severity.charAt(0).toUpperCase() +
                                        comment.severity.slice(1)}{" "}
                                </Badge>
                                <span className="text-gray-500 text-xs">
                                    {comment.path}:{comment.line_start}
                                    {comment.line_end !== comment.line_start &&
                                        `-${comment.line_end}`}
                                </span>
                            </div>

                            <div className="text-gray-300 text-sm mb-3">
                                <Markdown>{comment.suggestion}</Markdown>
                            </div>

                            {comment.code_snippet && (
                                <div className="bg-gray-950 rounded border border-gray-700 p-3 mb-3">
                                    <pre className="text-xs overflow-x-auto">
                                        {comment.code_snippet
                                            .trim()
                                            .split("\n")
                                            .map((line, index) => {
                                                const lineNumber =
                                                    (comment.code_snippet_line_start ??
                                                        comment.line_start) +
                                                    index;
                                                const isHighlighted =
                                                    lineNumber >=
                                                        comment.line_start &&
                                                    lineNumber <=
                                                        comment.line_end;

                                                return (
                                                    <div
                                                        key={index}
                                                        className="flex"
                                                    >
                                                        <span className="text-gray-500 w-8 text-right pr-2 select-none font-mono">
                                                            {lineNumber > 0
                                                                ? lineNumber
                                                                : ""}
                                                        </span>
                                                        <code
                                                            className={`flex-1 px-2 ${
                                                                isHighlighted
                                                                    ? comment.severity ===
                                                                      "critical"
                                                                        ? "bg-red-900/40 text-red-200 border-l-2 border-red-500"
                                                                        : comment.severity ===
                                                                          "warning"
                                                                        ? "bg-yellow-900/40 text-yellow-200 border-l-2 border-yellow-500"
                                                                        : "bg-blue-900/40 text-blue-200 border-l-2 border-blue-500"
                                                                    : "text-gray-300"
                                                            }`}
                                                        >
                                                            {line}
                                                        </code>
                                                    </div>
                                                );
                                            })}
                                    </pre>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ))}

            {/* Show More Button */}
            {analysis.comments.length > 3 && (
                <div className="border-b border-gray-700 p-4 text-center">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowAllComments(!showAllComments)}
                        className="text-gray-400 hover:text-gray-200"
                    >
                        {showAllComments
                            ? `Show less (${
                                  analysis.comments.length - 3
                              } hidden)`
                            : `Show ${
                                  analysis.comments.length - 3
                              } more comments`}
                    </Button>
                </div>
            )}
        </div>
    );
};

export default PrCodeAnalysis;
