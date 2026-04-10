FROM node:18-alpine

WORKDIR /app

COPY shared ./shared
COPY resource-service/package*.json ./resource-service/

RUN cd resource-service && npm ci --omit=dev

COPY resource-service ./resource-service

WORKDIR /app/resource-service

ENV NODE_ENV=production
ENV PORT=5003

EXPOSE 5003

CMD ["npm", "start"]