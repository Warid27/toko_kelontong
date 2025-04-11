/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: true,

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api-storage.cli.pics",
        port: "443",
        pathname: "/toko-kelontong/**",
      },
    ],
    domains: [
      "img.daisyui.com",
      "pbs.twimg.com",
      "placehold.co",
      "png.pngtree.com",
      "api-storage.cli.pics",
      "tokokube.parisada.id",
      "localhost",
    ],
    dangerouslyAllowSVG: true,
  },

  async rewrites() {
    const apiRewrite = {
      source: "/api/v1/:path*",
      destination: `https://tokokube.parisada.id/:path*`,
    };

    return [apiRewrite];
  },
};

export default nextConfig;
