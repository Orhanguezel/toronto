module.exports = {
  apps: [
    {
      name: "ensotek-backend",
      cwd: "/var/www/Ensotek/backend",
      script: "/var/www/Ensotek/backend/dist/index.js",

      exec_mode: "fork",
      instances: 1,
      watch: false,
      autorestart: true,
      max_memory_restart: "300M",
      env: {
        NODE_ENV: "production",
        PORT: "8086",
      },
      out_file: "/var/log/pm2/ensotek-backend.out.log",
      error_file: "/var/log/pm2/ensotek-backend.err.log",
      combine_logs: true,
      time: true,
    },
  ],
};


