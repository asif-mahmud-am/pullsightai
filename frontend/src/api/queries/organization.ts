import { useMutation, useQuery } from "@tanstack/react-query";
import { githubEndpoints } from "../endpoints/github";
import { ApiResponse } from "@/types/response";
import { Organization } from "@/types/organization";
import { Provider } from "@/types/user";
import { bitbucketEndpoints } from "../endpoints/bitbucket";
import { gitlabEndpoints } from "../endpoints/gitlab";

export const useOrganizationQuery = ({
    provider = "github",
    isEnabled = true,
}: {
    provider?: Provider;
    isEnabled?: boolean;
}) => {
    const queryFnMap: Record<
        Provider,
        () => Promise<ApiResponse<Organization[]>>
    > = {
        github: githubEndpoints.getOrgs,
        bitbucket: bitbucketEndpoints.getOrgs, // Uncomment and implement if needed
        gitlab: gitlabEndpoints.getOrgs, // Uncomment and implement if needed
    };

    const queryFn = queryFnMap[provider];
    if (!queryFn) {
        throw new Error(`Unsupported provider: ${provider}`);
    }

    return useQuery<Organization[], Error>({
        queryKey: [provider, "orgs"],
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

export const useOrganizationAddMutation = () => {
    return useMutation<Organization, Error, Partial<Organization>>({
        mutationFn: async ({ slug }) => {
            const response = await bitbucketEndpoints.addOrg(slug || "");
            return response.data;
        },
    });
};
