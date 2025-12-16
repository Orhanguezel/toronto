module.exports = {
  apps: [
    {
      name: "toronto-frontend",
      cwd: "/var/www/toronto/frontend",

      // Next start’ı direkt çalıştırmak daha stabil (bun bağımlılığını kaldırır)
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3010",

      exec_mode: "fork",
      instances: 1,
      watch: false,
      autorestart: true,
      max_memory_restart: "400M",

      env: {
        NODE_ENV: "production",
        PORT: "3010",

        NEXT_PUBLIC_SITE_URL: "https://ornek.guezelwebdesign.com",
        API_BASE_URL: "http://127.0.0.1:8088",
      },

      out_file: "/var/log/pm2/toronto-frontend.out.log",
      error_file: "/var/log/pm2/toronto-frontend.err.log",
      combine_logs: true,
      time: true,
    },
  ],
};
