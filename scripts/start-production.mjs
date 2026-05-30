import { spawnSync } from "node:child_process";

const port = process.env.PORT ?? "3001";
const host = "0.0.0.0";

const nodeOptions = process.env.NODE_OPTIONS
  ? `${process.env.NODE_OPTIONS} --no-warnings`
  : "--no-warnings";

const result = spawnSync(
  "npx",
  ["next", "start", "-H", host, "-p", port],
  {
    stdio: "inherit",
    env: { ...process.env, NODE_OPTIONS: nodeOptions },
    shell: true,
  },
);

process.exit(result.status ?? 1);
