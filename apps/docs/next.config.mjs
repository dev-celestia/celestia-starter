import { createMDX } from "fumadocs-mdx/next";

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  output: "export",
  // Set BASE_PATH (e.g. `/<repo>`) when deploying to a GitHub Pages project site
  basePath: process.env.BASE_PATH || "",
  // Image optimization is not available with static export on GitHub Pages
  images: { unoptimized: true },
  reactStrictMode: true,
  transpilePackages: ["@celestia-project/ui"],
};

export default withMDX(config);
