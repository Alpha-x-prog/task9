FROM node:18
WORKDIR /app
COPY . .
COPY package*.json ./
RUN npm install
RUN npm install ws
RUN npm install express-graphql
CMD ["sh", "-c", "node server.js & node chatServer.js"]