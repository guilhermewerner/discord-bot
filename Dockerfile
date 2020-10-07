FROM jrottenberg/ffmpeg:3.3-alpine AS ffmpeg
FROM node:12-alpine

COPY --from=ffmpeg / /

WORKDIR /app

COPY package.json yarn.lock ./

ENV NODE_ENV production

RUN yarn install

COPY . .

CMD [ "node", "./Source/index.js" ]
