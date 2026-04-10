FROM node:18-alpine

WORKDIR /app

COPY shared ./shared
COPY region-service/package*.json ./region-service/

RUN cd region-service && npm ci --omit=dev

COPY region-service ./region-service

WORKDIR /app/region-service

ENV NODE_ENV=production
ENV PORT=5001

EXPOSE 5001

CMD ["npm", "start"]