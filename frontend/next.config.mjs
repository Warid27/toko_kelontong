/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      "localhost",
      "img.daisyui.com",
      "pbs.twimg.com",
      "placehold.co",
      "png.pngtree.com",
      "api-storage.cli.pics",
    ],
    dangerouslyAllowSVG: true, // Allow SVG files
  },

  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: "http://localhost:8080/:path*",
      },
    ];
  },
};

export default nextConfig;
