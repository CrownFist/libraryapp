#TEST-STAGE

FROM node:16.20.2-bullseye-slim AS test-stage
RUN apt-get update && apt-get upgrade -y
ENV REACT_APP_BACKEND_URL=http://localhost:8080/graphql REACT_APP_WS_URL=ws://localhost:8080/graphql NODE_ENV=production

WORKDIR /usr/src/app

COPY . .

RUN npm ci --omit=dev

RUN CI=true npm test

#BUILD-STAGE

FROM test-stage AS build-stage

WORKDIR /usr/src/app

COPY --from=test-stage /usr/src/app /usr/src/app

RUN npm run build

#nginx
FROM nginx:1.20-alpine
RUN apk update && apk upgrade
# COPY the directory build from build-stage to /usr/share/nginx/html
# The target location here was found from the Docker hub page
COPY --from=build-stage /usr/src/app/build /usr/share/nginx/html