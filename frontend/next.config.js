/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "https://www.taehyun35802.shop/:path*",
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/map",
        destination: "/map/index.html", // redirecting to /map/index
        permanent: true, // This makes it a 308 permanent redirect
      },
    ];
  },
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;
