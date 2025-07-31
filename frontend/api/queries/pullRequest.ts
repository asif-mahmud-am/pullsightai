import { PullRequest } from "@/types/pullRequest";
import { ApiResponse } from "@/types/response";
import { Provider } from "@/types/user";
import { githubEndpoints } from "../endpoints/github";
import { bitbucketEndpoints } from "../endpoints/bitbucket";
import { useQuery } from "@tanstack/react-query";

export const usePullRequestQuery = ({
    provider = "github",
    isEnabled = true,
    repoId = "",
}: {
    provider?: Provider;
    isEnabled?: boolean;
    repoId?: string;
}) => {
    const queryFnMap: Record<
        Provider,
        (prId: string) => Promise<ApiResponse<PullRequest[]>>
    > = {
        github: githubEndpoints.getPRs,
        bitbucket: bitbucketEndpoints.getPRs, // Uncomment and implement if needed
        // gitlab: gitlabEndpoints.getPR, // Uncomment and implement if needed
    };

    const queryFn = queryFnMap[provider];
    if (!queryFn) {
        throw new Error(`Unsupported provider: ${provider}`);
    }

    return useQuery<PullRequest[], Error>({
        queryKey: [provider, "pr"],
        queryFn: async () => {
            const response = await queryFn(repoId);
            if (!response?.data) {
                throw new Error("No data received from response");
            }
            return response.data;
        },
        enabled: isEnabled && !!repoId,
    });
};
