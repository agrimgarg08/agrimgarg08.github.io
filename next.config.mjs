/** @type {import('next').NextConfig} */
// To support GitHub Pages we export the site as static files.
// The repository name (if hosted under username.github.io/repo) should
// be provided either by setting the REPO_NAME env var when building or
// by hard‑coding a string below.
const repoName = process.env.REPO_NAME || '';

const nextConfig = {
  // export static HTML instead of SSR
  output: 'export',
  // GitHub Pages serves from a folder, so include trailing slashes
  trailingSlash: true,
  // if you are deploying to a project page (not username.github.io),
  // set basePath and assetPrefix to the repo name
  basePath: repoName ? `/${repoName}` : '',
  assetPrefix: repoName ? `/${repoName}/` : '',

  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
};

export default nextConfig
