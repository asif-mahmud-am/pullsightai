import { Provider } from "@/types/user";
import { ApiResponse } from "@/types/response";
import { githubEndpoints } from "../endpoints/github";
import { useQuery } from "@tanstack/react-query";
import { Repository } from "@/types/repository";
import { bitbucketEndpoints } from "../endpoints/bitbucket";

interface UseRepositoryQueryParams {
    provider?: Provider;
    isEnabled?: boolean;
    orgName?: string;
}

export const useRepositoryQuery = ({
    provider = "github",
    isEnabled = true,
    orgName = "",
}: UseRepositoryQueryParams) => {
    const queryFnMap: Record<
        Provider,
        ({ orgName }: { orgName: string }) => Promise<ApiResponse<Repository[]>>
    > = {
        github: githubEndpoints.getRepos,
        bitbucket: bitbucketEndpoints.getRepos, // Uncomment and implement if needed
        // gitlab: gitlabEndpoints.getOrgs, // Uncomment and implement if needed
    };

    const queryFn = queryFnMap[provider];
    if (!queryFn) {
        throw new Error(`Unsupported provider: ${provider}`);
    }

    return useQuery<Repository[], Error>({
        queryKey: ["repos"],
        queryFn: async () => {
            const response = await queryFn({
                orgName,
            });
            if (!response?.data) {
                throw new Error("No data received from response");
            }
            return response.data;
        },
        enabled: isEnabled,
    });
};
