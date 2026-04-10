FROM node:18-alpine

WORKDIR /app

COPY shared ./shared
COPY fault-service/package*.json ./fault-service/

RUN cd fault-service && npm ci --omit=dev

COPY fault-service ./fault-service

WORKDIR /app/fault-service

ENV NODE_ENV=production
ENV PORT=5004

EXPOSE 5004

CMD ["npm", "start"]