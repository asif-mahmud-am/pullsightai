import { useQuery } from "@tanstack/react-query";
import { githubEndpoints } from "../endpoints/github";

export const useOrganizationQuery = ({
    provider = "github",
    isEnabled = true
}) => {
    const queryFnMap: Record<string, () => Promise<unknown>> = {
        github: githubEndpoints.getOrgs,
        // gitlab: gitlabEndpoints.getOrgs,
    };

    const queryFn = queryFnMap[provider];
    return useQuery({
        queryKey: [provider, "orgs"],
        queryFn,
        enabled: isEnabled,
    });
}


export const useGithubRepos = (isEnabled = true) => 
    useQuery({
        queryKey: ["github", "repos"],
        queryFn: githubEndpoints.getRepos,
        enabled: isEnabled,
    });
