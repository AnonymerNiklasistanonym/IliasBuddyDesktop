export interface GitHubLatestTag {
    url: string;
    assets_url: string;
    upload_url: string;
    html_url: string;
    id: number;
    tag_name: string;
    target_commitish: string;
    name: string;
    author: GitHubLatestTagAuthor;
    prerelease: boolean;
    created_at: string;
    published_at: string;
    assets: GitHubLatestTagAsset[];
    tarball_url: string;
    zipball_url: string;
    body: string;
}

interface GitHubLatestTagAuthor {
    login: string;
    id: number;
    avatar_url: string;
    url: string;
    html_url: string;
}

interface GitHubLatestTagAsset {
    url: string;
    id: number;
    name: string;
    download_count: number;
    size: number;
    created_at: string;
    published_at: string;
    browser_download_url: string;
}
