import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images:{
    remotePatterns:[
      {
        protocol:"https",
        hostname:"m.media-amazon.com", 
      },
    ]
  }
  /* config options here */
};

export default nextConfig;
