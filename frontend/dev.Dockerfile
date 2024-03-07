FROM node:16

WORKDIR /usr/src/app

COPY . .

ENV REACT_APP_BACKEND_URL=http://localhost:4000 REACT_APP_WS_URL=ws://localhost:4000

RUN npm install

CMD ["npm", "start"]