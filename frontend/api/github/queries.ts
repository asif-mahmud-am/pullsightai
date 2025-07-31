import { useQuery } from "@tanstack/react-query";
import { githubEndpoints } from "./endpoints";

export const useGithubOrgs = () =>
    useQuery({
        queryKey: ["github", "orgs"],
        queryFn: githubEndpoints.getOrgs,
    });

export const useGithubRepos = () =>
    useQuery({
        queryKey: ["github", "repos"],
        queryFn: githubEndpoints.getRepos,
    });
