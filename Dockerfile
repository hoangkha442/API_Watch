FROM node:18

WORKDIR /usr/share/BE
COPY package*.json ./



RUN yarn install

COPY prisma ./prisma

RUN yarn prisma generate

COPY . .

CMD ["node","src/server.js"]