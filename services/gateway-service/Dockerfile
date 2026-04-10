FROM node:18-alpine

WORKDIR /app

COPY shared ./shared
COPY services/gateway-service/package*.json ./services/gateway-service/

RUN cd services/gateway-service && npm install --omit=dev

COPY services/gateway-service ./services/gateway-service

WORKDIR /app/services/gateway-service

ENV NODE_ENV=production
ENV PORT=5000

EXPOSE 5000

CMD ["npm", "start"]