


## test
bun run test:smoke
bun run test:a11y
bun run test:intl
bun run test:ui


bun run build
pm2 start toronto-frontend
pm2 save



```sh
pm2 flush


cd /var/www/productsPark
git fetch --prune
git reset --hard origin/main

cd backend
bun run build

# çalışan süreç kesilmeden reload
pm2 reload ecosystem.config.cjs --env production

# gerekirse log izle
pm2 logs productspark-backend --lines 100

```




