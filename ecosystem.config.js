module.exports = {
  apps: [
    {
      name: "stockops-api",
      cwd: "./apps/api",
      script: "dist/index.js",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      max_memory_restart: "500M",
      env: {
        NODE_ENV: "production",
        PORT: 4000
      }
    },
    {
      name: "stockops-web",
      cwd: "./apps/web",
      script: "pnpm",
      args: "start",
      env: {
        NODE_ENV: "production",
        PORT: 5173
      }
    }
  ]
};
