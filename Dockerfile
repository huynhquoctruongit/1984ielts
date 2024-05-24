FROM node:18-alpine3.17 as build

WORKDIR /app

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

COPY . .

RUN npm install --force

ENTRYPOINT ["/entrypoint.sh"]

RUN npm run build

CMD ["npm", "run", "preview"]