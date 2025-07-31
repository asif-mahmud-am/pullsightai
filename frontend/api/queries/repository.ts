import { Provider } from "@/types/user";
import { ApiResponse } from "@/types/response";
import { githubEndpoints } from "../endpoints/github";
import { useQuery } from "@tanstack/react-query";
import { Repository } from "@/types/repository";
import { bitbucketEndpoints } from "../endpoints/bitbucket";

export const useRepositoryQuery = ({
    provider = "github",
    isEnabled = true
}: {
    provider?: Provider;
    isEnabled?: boolean;
}) => {
    const queryFnMap:Record<Provider, () => Promise<ApiResponse<Repository[]>>> = {
        github: githubEndpoints.getRepos,
        bitbucket: bitbucketEndpoints.getRepos, // Uncomment and implement if needed
        // gitlab: gitlabEndpoints.getOrgs, // Uncomment and implement if needed
    };

    const queryFn = queryFnMap[provider];
    if (!queryFn) {
        throw new Error(`Unsupported provider: ${provider}`);
    }

    return useQuery<Repository[], Error>({
        queryKey: [provider, "repos"],
        queryFn: async () => {
            const response = await queryFn();
            if (!response?.data) {
                throw new Error("No data received from response");
            }
            return response.data;
        },
        enabled: isEnabled,
    });
};