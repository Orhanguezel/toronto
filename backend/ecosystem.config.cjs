module.exports = {
  apps: [
    {
      name: "mezartasi-backend",
      cwd: "/var/www/mezarTasi/backend",
      script: "dist/index.js",           // build çıktısı
      interpreter: "/usr/bin/bun",       // istersen "node" da yazabilirsin
      exec_mode: "fork",
      instances: 1,
      watch: false,
      autorestart: true,
      max_memory_restart: "300M",
      env: {
        NODE_ENV: "production",
        PORT: "8082"                     // Nginx'te /api -> 8082 ise burayı 8082 yap
      },
      out_file: "/var/log/pm2/mezartasi-backend.out.log",
      error_file: "/var/log/pm2/mezartasi-backend.err.log",
      combine_logs: true,
      time: true
    }
  ]
};
