FROM node:lts

WORKDIR /usr/src/app

RUN apt-get update
RUN apt-get install ffmpeg -y

COPY package.json ./

RUN npm install

COPY . .

CMD ["npm", "start"]
