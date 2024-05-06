FROM node:14
WORKDIR /app
COPY package*.json ./
RUN npm install

RUN npm install -g nodemon
COPY . .
EXPOSE 3000
ENV NODE_ENV=development
CMD ["npx", "nodemon", "server.js"]