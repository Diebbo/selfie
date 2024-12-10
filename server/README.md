# Selfie API
## Development

install dependencies
```bash
npm install
```

create a .env file with this content:
```
JWT_SECRET=<same-as-client>
PORT=3001
EMAIL_PASS=<ourpassword>
EMAIL="selfie.notification@gmail.com"
NODE_ENV="production" | "development"
NOTIFICATION_DELAY=10000
COOKIE_SECURE=false
COOKIE_EXP=604800000
COOKIE_SIGN=false
NOTIFICATION=true
MONGODB_URI="<mongodb-uri>"
```

run the server
```bash
npm run dev # for nodemon
```
