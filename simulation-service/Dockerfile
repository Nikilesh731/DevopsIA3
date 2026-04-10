FROM node:18-alpine

WORKDIR /app

COPY shared ./shared
COPY simulation-service/package*.json ./simulation-service/

RUN cd simulation-service && npm ci --omit=dev

COPY simulation-service ./simulation-service

WORKDIR /app/simulation-service

ENV NODE_ENV=production
ENV PORT=5002

EXPOSE 5002

CMD ["npm", "start"]