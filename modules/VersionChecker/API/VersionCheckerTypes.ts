/**
 * Github latest release tag interface
 * (https://developer.github.com/v3/repos/releases/)
 *
 * GET `https://api.github.com/repos/:owner/:repo/releases`
 */
export interface GitHubLatestTag {
    /**
     * API url to release
     * @example "https://api.github.com/repos/user/repo/releases/1"
     */
    url: string;
    /**
     * Normal url to release
     * @example "https://github.com/user/repo/releases/v1.0.0"
     */
    html_url: string;
    /**
     * API url to assets
     * @example "https://api.github.com/repos/user/repo/releases/1/assets"
     */
    assets_url: string;
    /**
     * Github release tag name
     * @example "v1.0.0"
     */
    tag_name: string;
    /**
     * Github release name
     * @example "v1.0.0"
     */
    name: string;
    /**
     * Description of the release
     * @example "Description of the release"
     */
    body: string;
    /**
     * Is a pre release
     */
    prerelease: boolean;
    /**
     * Date of release creation
     * @example "2013-02-27T19:35:32Z"
     */
    created_at: string;
    /**
     * Date of release publication
     * @example "2013-02-27T19:35:32Z"
     */
    published_at: string;
    /**
     * Release author
     */
    author: GitHubLatestTagAuthor;
    /**
     * Assets of release
     */
    assets: GitHubLatestTagAsset[];
}

interface GitHubLatestTagAuthor {
    /**
     * User name
     * @example "octocat"
     */
    login: string;
    /**
     * API URL to user
     */
    url: string;
    /**
     * Normal URL to user
     */
    html_url: string;
}

interface GitHubLatestTagAsset {
    /**
     * API URL to asset
     */
    url: string;
    /**
     * Name of asset
     * @example "example.zip"
     */
    name: string;
    /**
     * Number of downloads
     */
    download_count: number;
    /**
     * Size of asset (bytes?)
     * @example 1024
     */
    size: number;
    /**
     * Date of upload creation
     * @example "2013-02-27T19:35:32Z"
     */
    created_at: string;
    /**
     * Date of upload
     * @example "2013-02-27T19:35:32Z"
     */
    updated_at: string;
    /**
     * Normal URL to download asset
     * @example "https://github.com/.../releases/download/v1.0.0/example.zip"
     */
    browser_download_url: string;
    /**
     * Asset uploader
     */
    uploader: GitHubLatestTagAuthor;
}

export interface LatestVersionCheck {
    /**
     * Indicates if a newer version is available
     */
    newerVersionAvailable: boolean;
    /**
     * If a newer version is available send the latest tag with all the
     * information too
     */
    latestReleaseGitHub?: GitHubLatestTag;
}
