FROM node:alpine

WORKDIR /usr/discord-bot

RUN apt-get update
RUN apt-get install ffmpeg -y

COPY package.json ./

RUN yarn

COPY . .

CMD ["yarn", "start"]
