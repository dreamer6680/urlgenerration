FROM node:20

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install --only=production

COPY .next ./.next
COPY public ./public
COPY next.config.js ./

CMD ["npm", "start"]
