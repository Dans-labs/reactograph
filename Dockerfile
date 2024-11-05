FROM node:21-alpine3.19

WORKDIR /app

COPY yarn.lock package.json ./

RUN yarn install
RUN npm install 3d-force-graph three three-spritetext

COPY . .

EXPOSE 3000

CMD ["yarn", "start", "--host", "0.0.0.0"]
