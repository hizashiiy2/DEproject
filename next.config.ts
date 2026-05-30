import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["sql.js"],
  outputFileTracingIncludes: {
    "/*": ["./node_modules/sql.js/dist/sql-wasm.wasm"],
  },
};

export default nextConfig;
