/** @type {import('next').NextConfig} */
const ToolsetConfig = process.env.OUTDIR
  ? {
      output: "export",
      distDir: process.env.OUTDIR,
      basePath: "/photo-exif-viewer",
    }
  : {};

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  ...ToolsetConfig,
};

module.exports = nextConfig;
