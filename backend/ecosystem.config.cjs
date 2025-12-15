module.exports = {
  apps: [
    {
      name: "toronto-backend",
      cwd: "/var/www/toronto/backend",
      script: "/var/www/toronto/backend/dist/index.js",

      exec_mode: "fork",
      instances: 1,
      watch: false,
      autorestart: true,
      max_memory_restart: "300M",

      env_file: "/var/www/toronto/backend/.env",
      env: {
        NODE_ENV: "production",
        PORT: "8088",
      },

      out_file: "/var/log/pm2/toronto-backend.out.log",
      error_file: "/var/log/pm2/toronto-backend.err.log",
      combine_logs: true,
      time: true,
    },
  ],
};
