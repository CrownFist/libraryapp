FROM node:16.20.2-bullseye-slim
RUN apt-get update && apt-get install -y --no-install-recommends dumb-init

ENV NODE_ENV=production

WORKDIR /usr/src/app

COPY . .

COPY --chown=node:node . .
RUN npm ci --omit=dev

USER node

#Define envs in docker compose (mongo url and jwt)

CMD ["dumb-init", "node", "library-backend.js"]