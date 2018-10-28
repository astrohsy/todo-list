FROM node:10.11.0-alpine

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install && \
    npm install -g pushstate-server

COPY . .

RUN npm run build

EXPOSE 3000

CMD [ "pushstate-server", "build", "3000"];