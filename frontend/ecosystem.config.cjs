module.exports = {
  apps: [
    {
      name: 'toronto-api',
      cwd: '/var/www/toronto-api',
      script: 'bun',
      args: 'run start',
      env: { NODE_ENV: 'production' }
    },
    {
      name: 'toronto-fe',
      cwd: '/var/www/toronto-fe',
      script: 'bun',
      args: 'run start',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        API_BASE_URL: 'http://127.0.0.1:8081',
        NEXT_PUBLIC_SITE_URL: 'https://toronto.example.com',
        NEXT_PUBLIC_REVALIDATE_SECRET: '***'
      }
    }
  ]
};