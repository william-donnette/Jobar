FROM node:20.15 AS base

WORKDIR /usr/src/app

FROM base AS deps

COPY package.json package.json
COPY package-lock.json package-lock.json

RUN npm ci

FROM base AS dev

COPY . .
COPY --from=deps /usr/src/app/node_modules ./node_modules

ENTRYPOINT ["npm", "run", "dev"]

FROM base AS builder

COPY . .
COPY --from=deps /usr/src/app/node_modules ./node_modules

RUN npm run build

FROM base AS prod

ENV NODE_ENV production

COPY --from=builder /usr/src/app/lib ./lib
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/.env ./.env
COPY --from=builder /usr/src/app/package.json ./package.json


ENV TEMPORAL_PORT=7233
ENV TEMPORAL_ADDRESS="temporal:7233"

EXPOSE 3002

ENV PORT=3002
ENV HOSTNAME="0.0.0.0"

ENTRYPOINT ["npm", "run", "start"]
