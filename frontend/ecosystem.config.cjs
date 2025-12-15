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

        NEXT_PUBLIC_REVALIDATE_SECRET: "***",

        // .env’inizde bu şekilde: public API relative (nginx /api proxy)
        NEXT_PUBLIC_API_URL: "/",

        DEFAULT_LOCALE: "tr",
        SUPPORTED_LOCALES: "tr,en,de",
        NEXT_PUBLIC_DISABLE_SENTRY: "1",
        NEXT_PUBLIC_WHATSAPP: "90555xxxxxxx",

        // Server-side ihtiyaç olursa doğru backend portu:
        API_BASE_URL: "http://127.0.0.1:8088",
      },

      out_file: "/var/log/pm2/toronto-frontend.out.log",
      error_file: "/var/log/pm2/toronto-frontend.err.log",
      combine_logs: true,
      time: true,
    },
  ],
};
